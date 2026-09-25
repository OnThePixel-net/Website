import { and, count, desc, eq, type SQL } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { ensureBugReportTable } from "@/lib/db/migrate";
import { normalizeDiscordId } from "@/lib/creators";

/**
 * Data access for bug reports: the public form writes them, the dashboard
 * reads, triages and deletes them.
 *
 * As in `lib/apply.ts`, every rule about what may be stored lives here and not
 * in the routes; a route only turns a {@link BugReportValidationError} into a
 * 400.
 */

/* ------------------------------------------------------------- vocabulary -- */

/** What a report is about. The form offers exactly these. */
export const BUG_REPORT_CATEGORIES = [
  "server",
  "website",
  "discord",
  "other",
] as const;
export type BugReportCategory = (typeof BUG_REPORT_CATEGORIES)[number];

/** The triage states a report moves through. */
export const BUG_REPORT_STATUSES = [
  "new",
  "in_progress",
  "fixed",
  "rejected",
] as const;
export type BugReportStatus = (typeof BUG_REPORT_STATUSES)[number];

/**
 * Length caps. Everything below is typed by anonymous visitors, so an uncapped
 * field is an invitation to push megabytes into the database with a script.
 */
export const BUG_REPORT_LIMITS = {
  title: 120,
  description: 4_000,
  steps: 3_000,
  /** Minecraft names are 3–16 characters of [A-Za-z0-9_]. */
  minecraftName: 16,
  internalNote: 4_000,
  pageSize: 25,
  maxPageSize: 100,
} as const;

/** Minimum description length — "doesn't work" is not something to act on. */
const MIN_DESCRIPTION = 20;

const MINECRAFT_NAME = /^[A-Za-z0-9_]{3,16}$/;

/**
 * A rejected input, as opposed to a database or programming fault. `code` is
 * stable so the public form can show a translated message; `message` is the
 * German text the dashboard shows as-is.
 */
export class BugReportValidationError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "BugReportValidationError";
    this.code = code;
  }
}

/* ------------------------------------------------------------------ types -- */

export interface BugReport {
  id: number;
  category: BugReportCategory;
  title: string;
  description: string;
  steps: string;
  minecraftName: string;
  discordId: string | null;
  discordUsername: string | null;
  discordAvatarUrl: string | null;
  status: BugReportStatus;
  internalNote: string;
  createdAt: string;
  updatedAt: string;
}

export interface BugReportInput {
  category: unknown;
  title: unknown;
  description: unknown;
  steps?: unknown;
  minecraftName?: unknown;
  /** From the server-side session only; absent when the reporter is not signed in. */
  discord?: {
    id?: unknown;
    username?: unknown;
    avatarUrl?: unknown;
  } | null;
}

export interface BugReportPage {
  items: BugReport[];
  total: number;
  limit: number;
  offset: number;
}

/* -------------------------------------------------------------- helpers -- */

function text(input: unknown, max: number): string {
  return String(input ?? "")
    .trim()
    .slice(0, max);
}

export function normalizeBugReportCategory(
  input: unknown,
): BugReportCategory | null {
  return (BUG_REPORT_CATEGORIES as readonly string[]).includes(String(input))
    ? (input as BugReportCategory)
    : null;
}

export function normalizeBugReportStatus(
  input: unknown,
): BugReportStatus | null {
  return (BUG_REPORT_STATUSES as readonly string[]).includes(String(input))
    ? (input as BugReportStatus)
    : null;
}

/**
 * A required free-text field: trimmed, and rejected rather than cut when it is
 * too long — a silently truncated description loses the part that mattered.
 */
function requiredText(
  input: unknown,
  max: number,
  code: string,
  label: string,
): string {
  const value = typeof input === "string" ? input.trim() : "";
  if (!value)
    throw new BugReportValidationError(
      `${code}_required`,
      `Bitte fülle das Feld aus: ${label}`,
    );
  if (value.length > max)
    throw new BugReportValidationError(
      `${code}_too_long`,
      `„${label}“ ist zu lang (maximal ${max} Zeichen).`,
    );
  return value;
}

type BugReportRow = typeof schema.bugReports.$inferSelect;

function toBugReport(row: BugReportRow): BugReport {
  return {
    id: row.id,
    category: normalizeBugReportCategory(row.category) ?? "other",
    title: row.title,
    description: row.description,
    steps: row.steps,
    minecraftName: row.minecraft_name,
    discordId: row.discord_id,
    discordUsername: row.discord_username,
    discordAvatarUrl: row.discord_avatar_url,
    status: normalizeBugReportStatus(row.status) ?? "new",
    internalNote: row.internal_note,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

/* ---------------------------------------------------------------- writing -- */

/** Validate and store a report from the public form. */
export async function createBugReport(
  input: BugReportInput,
): Promise<BugReport> {
  const category = normalizeBugReportCategory(input.category);
  if (!category)
    throw new BugReportValidationError(
      "category_invalid",
      `Kategorie muss eine von ${BUG_REPORT_CATEGORIES.join(", ")} sein.`,
    );

  const title = requiredText(
    input.title,
    BUG_REPORT_LIMITS.title,
    "title",
    "Titel",
  );
  const description = requiredText(
    input.description,
    BUG_REPORT_LIMITS.description,
    "description",
    "Beschreibung",
  );
  if (description.length < MIN_DESCRIPTION)
    throw new BugReportValidationError(
      "description_too_short",
      `Die Beschreibung ist zu kurz (mindestens ${MIN_DESCRIPTION} Zeichen).`,
    );

  const steps = typeof input.steps === "string" ? input.steps.trim() : "";
  if (steps.length > BUG_REPORT_LIMITS.steps)
    throw new BugReportValidationError(
      "steps_too_long",
      `„Schritte zum Nachstellen“ ist zu lang (maximal ${BUG_REPORT_LIMITS.steps} Zeichen).`,
    );

  const minecraftName =
    typeof input.minecraftName === "string" ? input.minecraftName.trim() : "";
  if (minecraftName && !MINECRAFT_NAME.test(minecraftName))
    throw new BugReportValidationError(
      "minecraft_name_invalid",
      "Der Minecraft-Name ist ungültig (3–16 Zeichen, nur Buchstaben, Zahlen und _).",
    );

  // A session without a plausible snowflake is stored as anonymous rather than
  // rejected: the login is optional here, so there is nothing to refuse.
  const discordId = input.discord ? normalizeDiscordId(input.discord.id) : null;

  await ensureBugReportTable();
  const [row] = await getDb()
    .insert(schema.bugReports)
    .values({
      category,
      title,
      description,
      steps,
      minecraft_name: minecraftName,
      discord_id: discordId,
      discord_username: discordId
        ? text(input.discord?.username, 100) || discordId
        : null,
      discord_avatar_url: discordId
        ? text(input.discord?.avatarUrl, 500) || null
        : null,
      status: "new",
      updated_at: new Date(),
    })
    .returning();

  return toBugReport(row);
}

/**
 * Set the status and/or the internal note of a report. Returns `null` when no
 * report has that id.
 */
export async function updateBugReport(
  id: number,
  input: { status?: unknown; internalNote?: unknown },
): Promise<BugReport | null> {
  await ensureBugReportTable();

  const patch: Partial<typeof schema.bugReports.$inferInsert> = {
    updated_at: new Date(),
  };

  if (input.status !== undefined) {
    const status = normalizeBugReportStatus(input.status);
    if (!status)
      throw new BugReportValidationError(
        "status_invalid",
        `Status muss einer von ${BUG_REPORT_STATUSES.join(", ")} sein.`,
      );
    patch.status = status;
  }

  if (input.internalNote !== undefined) {
    const note = String(input.internalNote ?? "");
    if (note.length > BUG_REPORT_LIMITS.internalNote)
      throw new BugReportValidationError(
        "note_too_long",
        `Die interne Notiz ist zu lang (maximal ${BUG_REPORT_LIMITS.internalNote} Zeichen).`,
      );
    patch.internal_note = note;
  }

  const [row] = await getDb()
    .update(schema.bugReports)
    .set(patch)
    .where(eq(schema.bugReports.id, id))
    .returning();

  return row ? toBugReport(row) : null;
}

/** Delete a report. Returns `false` when no report has that id. */
export async function deleteBugReport(id: number): Promise<boolean> {
  await ensureBugReportTable();
  const rows = await getDb()
    .delete(schema.bugReports)
    .where(eq(schema.bugReports.id, id))
    .returning({ id: schema.bugReports.id });
  return rows.length > 0;
}

/* ---------------------------------------------------------------- reading -- */

/**
 * Reports, newest first, optionally filtered by status and category. `total`
 * is the number of rows the filter matches, so the dashboard can page.
 */
export async function listBugReports(
  options: {
    status?: string;
    category?: string;
    limit?: number;
    offset?: number;
  } = {},
): Promise<BugReportPage> {
  await ensureBugReportTable();
  const db = getDb();

  const filters: SQL[] = [];
  if (options.status !== undefined) {
    const status = normalizeBugReportStatus(options.status);
    if (!status)
      throw new BugReportValidationError(
        "status_invalid",
        `Status muss einer von ${BUG_REPORT_STATUSES.join(", ")} sein.`,
      );
    filters.push(eq(schema.bugReports.status, status));
  }
  if (options.category !== undefined) {
    const category = normalizeBugReportCategory(options.category);
    if (!category)
      throw new BugReportValidationError(
        "category_invalid",
        `Kategorie muss eine von ${BUG_REPORT_CATEGORIES.join(", ")} sein.`,
      );
    filters.push(eq(schema.bugReports.category, category));
  }
  const where = filters.length > 0 ? and(...filters) : undefined;

  const limit = Math.min(
    Math.max(
      Math.trunc(Number(options.limit) || BUG_REPORT_LIMITS.pageSize),
      1,
    ),
    BUG_REPORT_LIMITS.maxPageSize,
  );
  const offset = Math.max(Math.trunc(Number(options.offset) || 0), 0);

  const [rows, [totalRow]] = await Promise.all([
    db
      .select()
      .from(schema.bugReports)
      .where(where)
      .orderBy(desc(schema.bugReports.created_at), desc(schema.bugReports.id))
      .limit(limit)
      .offset(offset),
    db.select({ value: count() }).from(schema.bugReports).where(where),
  ]);

  return {
    items: rows.map(toBugReport),
    total: totalRow?.value ?? 0,
    limit,
    offset,
  };
}
