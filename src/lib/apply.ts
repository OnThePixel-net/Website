import { and, asc, count, desc, eq, inArray, sql, type SQL } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { ensureApplyTables } from "@/lib/db/migrate";
import { normalizeDiscordId } from "@/lib/creators";
import type { ApplyAnswerRecord } from "@/lib/db/schema";

/**
 * Data access for the application system: the open positions, the questions
 * their forms ask, and the applications that come back.
 *
 * Everything that decides whether a write is acceptable lives in this module,
 * not in the routes — the same rules have to hold for the public form, for the
 * dashboard and for the seed script, and a rule that is written down three
 * times is a rule that will differ in three places. Routes are left with
 * translating an {@link ApplyValidationError} into a 400.
 */

/* ------------------------------------------------------------- vocabulary -- */

export type ApplyStatus = "open" | "closed";

/** The two site languages. Mirrors the locales in `lib/i18n`. */
export type ApplyLanguage = "en" | "de";

/**
 * The field types the form component can render — kept in sync with
 * `ApplicationField["type"]` in `components/page/ApplicationForm.tsx`. A type
 * outside this list would reach the form as an unrenderable field, so it is
 * rejected on the way in rather than discovered on the page.
 */
export const APPLY_QUESTION_TYPES = ["text", "textarea"] as const;
export type ApplyQuestionType = (typeof APPLY_QUESTION_TYPES)[number];

/** The review states an application moves through. */
export const APPLY_SUBMISSION_STATUSES = ["new", "accepted", "rejected"] as const;
export type ApplySubmissionStatus = (typeof APPLY_SUBMISSION_STATUSES)[number];

/**
 * Length caps. They are not cosmetic: everything below is written by whoever
 * fills in the public form, so an uncapped textarea is an invitation to push
 * megabytes into the database with a script.
 */
export const APPLY_LIMITS = {
  positionName: 80,
  slug: 64,
  positionDescription: 500,
  fieldKey: 64,
  label: 160,
  placeholder: 200,
  questionDescription: 300,
  questionsPerPosition: 40,
  /** Per answer, by field type. */
  answer: { text: 500, textarea: 5000 },
  /** Across all answers of one application. */
  answersTotal: 20_000,
  internalNote: 4_000,
  /** Page size of {@link listApplySubmissions}. */
  pageSize: 25,
  maxPageSize: 100,
} as const;

/**
 * A rejected input, as opposed to a database or programming fault.
 *
 * Routes should answer this with 400 and everything else with 500. `code` is
 * stable and machine-readable so the public form can show a translated message
 * (its own copy is bilingual); `message` is the German fallback the dashboard
 * displays as-is, matching the other dashboard routes.
 */
export class ApplyValidationError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "ApplyValidationError";
    this.code = code;
  }
}

/* ------------------------------------------------------------------ types -- */

export interface ApplyPosition {
  id: number;
  name: string;
  slug: string;
  status: ApplyStatus;
  sortOrder: number;
  /** Card copy on `/apply`, per language. May be empty. */
  descriptionEn: string;
  descriptionDe: string;
}

export interface ApplyQuestion {
  id: number;
  positionId: number;
  /** Key the answer is stored under, e.g. `minecraft_username`. */
  fieldKey: string;
  type: ApplyQuestionType;
  required: boolean;
  sortOrder: number;
  labelEn: string;
  labelDe: string;
  /** Empty string means "not set". */
  placeholderEn: string;
  placeholderDe: string;
  descriptionEn: string;
  descriptionDe: string;
}

export interface ApplyPositionWithQuestions extends ApplyPosition {
  questions: ApplyQuestion[];
}

/** One answer, with the question it answered frozen alongside it. */
export interface ApplyAnswer {
  /** May point at a question that has since been edited or deleted. */
  questionId: number | null;
  fieldKey: string;
  type: string;
  labelEn: string;
  labelDe: string;
  value: string;
}

export interface ApplySubmission {
  id: number;
  /** `null` once the position it was sent for has been deleted. */
  positionId: number | null;
  positionName: string;
  positionSlug: string;
  discordId: string;
  discordUsername: string;
  discordAvatarUrl: string | null;
  answers: ApplyAnswer[];
  status: ApplySubmissionStatus;
  internalNote: string;
  /** ISO-8601; the rows cross a server/client boundary as JSON anyway. */
  createdAt: string;
  updatedAt: string;
  reviewedAt: string | null;
}

/**
 * Structurally the `ApplicationField` of `components/page/ApplicationForm.tsx`.
 * It is redeclared instead of imported because that module is a client
 * component; see {@link toApplicationFields}.
 */
export interface ApplyApplicationField {
  id: string;
  label: string;
  type: ApplyQuestionType;
  placeholder?: string;
  description?: string;
}

export interface ApplyPositionInput {
  name: string;
  /** Derived from `name` when omitted. */
  slug?: string;
  status?: string;
  sortOrder?: number;
  descriptionEn?: string;
  descriptionDe?: string;
}

export interface ApplyQuestionInput {
  /** Derived from the label when omitted. */
  fieldKey?: string;
  type?: string;
  required?: boolean;
  sortOrder?: number;
  labelEn?: string;
  labelDe?: string;
  placeholderEn?: string;
  placeholderDe?: string;
  descriptionEn?: string;
  descriptionDe?: string;
}

export interface ApplySubmissionInput {
  /** The position applied for, by slug. Must be open. */
  positionSlug: string;
  /** Taken from the server-side session, never from the request body. */
  discord: { id: unknown; username?: unknown; avatarUrl?: unknown };
  /** `{ [fieldKey]: value }`, as the form component posts it. */
  answers: unknown;
}

export interface ApplySubmissionPage {
  items: ApplySubmission[];
  total: number;
  limit: number;
  offset: number;
}

/** Routes the apply overview links to, keyed by position name. */
export const POSITION_ROUTES: Record<string, string> = {
  Builder: "/apply/builder",
  Supporter: "/apply/supporter",
  "Java Developer": "/apply/developer",
};

/* ---------------------------------------------------------- normalisation -- */

/** Trim a value to a string and cut it to `max` characters. */
function text(input: unknown, max: number): string {
  return String(input ?? "").trim().slice(0, max);
}

/**
 * Turn a position name into a URL slug, or return `null` when nothing usable is
 * left. Unlike `slugifyGroupName` in `lib/pocketid.ts`, which substitutes
 * `"group"` for an unslugifiable name, this returns `null`: a position slug is
 * a unique key and part of a public URL, so silently inventing one would either
 * collide with an existing position or publish a meaningless address.
 */
export function normalizeApplySlug(input: unknown): string | null {
  const slug = String(input ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, APPLY_LIMITS.slug)
    .replace(/-+$/g, "");
  return slug || null;
}

/**
 * Normalise the key an answer is stored under: lower case, underscores, no
 * leading digit. Returns `null` when nothing usable is left. The existing
 * hardcoded forms use exactly this shape (`minecraft_username`, `why_supporter`).
 */
export function normalizeApplyFieldKey(input: unknown): string | null {
  const key = String(input ?? "")
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, APPLY_LIMITS.fieldKey)
    .replace(/_+$/g, "");
  if (!key) return null;
  return /^[0-9]/.test(key) ? `f_${key}`.slice(0, APPLY_LIMITS.fieldKey) : key;
}

/** `"open"` / `"closed"`, or `null` for anything else. */
export function normalizeApplyStatus(input: unknown): ApplyStatus | null {
  const value = String(input ?? "").trim().toLowerCase();
  return value === "open" || value === "closed" ? value : null;
}

/** A supported field type, or `null`. */
export function normalizeApplyQuestionType(input: unknown): ApplyQuestionType | null {
  const value = String(input ?? "").trim().toLowerCase();
  return (APPLY_QUESTION_TYPES as readonly string[]).includes(value)
    ? (value as ApplyQuestionType)
    : null;
}

/** A supported review status, or `null`. */
export function normalizeApplySubmissionStatus(
  input: unknown,
): ApplySubmissionStatus | null {
  const value = String(input ?? "").trim().toLowerCase();
  return (APPLY_SUBMISSION_STATUSES as readonly string[]).includes(value)
    ? (value as ApplySubmissionStatus)
    : null;
}

/**
 * Pick the copy for `language` and fall back to the other one when it is empty.
 * A position that was only described in German still has to render something on
 * the English page — an empty card is worse than the wrong language.
 */
export function pickApplyText(
  copy: { en: string; de: string },
  language: ApplyLanguage,
): string {
  const preferred = language === "de" ? copy.de : copy.en;
  const fallback = language === "de" ? copy.en : copy.de;
  return preferred.trim() || fallback.trim();
}

/**
 * The questions of a position in the shape `ApplicationForm` expects. Optional
 * texts collapse to `undefined` so the component's `field.placeholder &&` and
 * `field.description &&` checks behave as they do for the hardcoded fields.
 */
export function toApplicationFields(
  questions: ApplyQuestion[],
  language: ApplyLanguage,
): ApplyApplicationField[] {
  return questions.map((q) => {
    const placeholder = pickApplyText(
      { en: q.placeholderEn, de: q.placeholderDe },
      language,
    );
    const description = pickApplyText(
      { en: q.descriptionEn, de: q.descriptionDe },
      language,
    );
    return {
      id: q.fieldKey,
      label: pickApplyText({ en: q.labelEn, de: q.labelDe }, language),
      type: q.type,
      ...(placeholder ? { placeholder } : {}),
      ...(description ? { description } : {}),
    };
  });
}

/* -------------------------------------------------------------- row mapping -- */

type PositionRow = typeof schema.applyPositions.$inferSelect;
type QuestionRow = typeof schema.applyQuestions.$inferSelect;
type SubmissionRow = typeof schema.applySubmissions.$inferSelect;

function toPosition(row: PositionRow): ApplyPosition {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    status: row.status === "open" ? "open" : "closed",
    sortOrder: row.sort_order,
    descriptionEn: row.description_en,
    descriptionDe: row.description_de,
  };
}

function toQuestion(row: QuestionRow): ApplyQuestion {
  return {
    id: row.id,
    positionId: row.position_id,
    fieldKey: row.field_key,
    // Legacy-proofing: the column is plain text, so a row written by a future
    // version with an unknown type degrades to a single-line input instead of
    // rendering nothing.
    type: normalizeApplyQuestionType(row.type) ?? "text",
    required: row.required,
    sortOrder: row.sort_order,
    labelEn: row.label_en,
    labelDe: row.label_de,
    placeholderEn: row.placeholder_en,
    placeholderDe: row.placeholder_de,
    descriptionEn: row.description_en,
    descriptionDe: row.description_de,
  };
}

function toSubmission(row: SubmissionRow): ApplySubmission {
  return {
    id: row.id,
    positionId: row.position_id,
    positionName: row.position_name,
    positionSlug: row.position_slug,
    discordId: row.discord_id,
    discordUsername: row.discord_username,
    discordAvatarUrl: row.discord_avatar_url,
    answers: (Array.isArray(row.answers) ? row.answers : []).map((a) => ({
      questionId: a.question_id ?? null,
      fieldKey: a.field_key,
      type: a.type,
      labelEn: a.label_en,
      labelDe: a.label_de,
      value: a.value,
    })),
    status: normalizeApplySubmissionStatus(row.status) ?? "new",
    internalNote: row.internal_note,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    reviewedAt: row.reviewed_at ? row.reviewed_at.toISOString() : null,
  };
}

/* ---------------------------------------------------------------- reading -- */

/**
 * All positions with their current status. Returns an empty list when the
 * database is unreachable — the apply pages then simply show nothing open,
 * which is the safe direction to fail in.
 */
export async function listApplyPositions(): Promise<ApplyPosition[]> {
  try {
    await ensureApplyTables();
    const rows = await getDb()
      .select()
      .from(schema.applyPositions)
      .orderBy(asc(schema.applyPositions.sort_order), asc(schema.applyPositions.id));

    return rows.map(toPosition);
  } catch (e) {
    console.error("[apply] database read failed:", e);
    return [];
  }
}

/** Whether applications for a position are currently accepted. */
export async function isPositionOpen(name: string): Promise<boolean> {
  const positions = await listApplyPositions();
  return positions.some((p) => p.name === name && p.status === "open");
}

/** A single position by id, without its questions. Throws on a database fault. */
export async function getApplyPosition(id: number): Promise<ApplyPosition | null> {
  await ensureApplyTables();
  const [row] = await getDb()
    .select()
    .from(schema.applyPositions)
    .where(eq(schema.applyPositions.id, id))
    .limit(1);
  return row ? toPosition(row) : null;
}

/**
 * Positions together with their questions.
 *
 * `onlyOpen` is what separates the public site (open positions only) from the
 * dashboard (everything). Throws on a database fault — see
 * {@link getPublicApplyPositions} for the failure-tolerant public variant.
 */
export async function listApplyPositionsWithQuestions(
  options: { onlyOpen?: boolean } = {},
): Promise<ApplyPositionWithQuestions[]> {
  await ensureApplyTables();
  const db = getDb();

  const positions = await db
    .select()
    .from(schema.applyPositions)
    .where(options.onlyOpen ? eq(schema.applyPositions.status, "open") : undefined)
    .orderBy(asc(schema.applyPositions.sort_order), asc(schema.applyPositions.id));

  if (positions.length === 0) return [];

  const questions = await db
    .select()
    .from(schema.applyQuestions)
    .where(
      inArray(
        schema.applyQuestions.position_id,
        positions.map((p) => p.id),
      ),
    )
    .orderBy(asc(schema.applyQuestions.sort_order), asc(schema.applyQuestions.id));

  // Bucket once instead of re-scanning the question list per position; the
  // insertion order of a bucket is the query's sort order.
  const byPositionId = new Map<number, ApplyQuestion[]>();
  for (const row of questions) {
    const question = toQuestion(row);
    const bucket = byPositionId.get(question.positionId);
    if (bucket) bucket.push(question);
    else byPositionId.set(question.positionId, [question]);
  }

  return positions.map((row) => ({
    ...toPosition(row),
    questions: byPositionId.get(row.id) ?? [],
  }));
}

/**
 * One position with its questions, addressed by slug. `onlyOpen` makes a closed
 * position indistinguishable from a missing one, which is what the public form
 * route wants. Throws on a database fault.
 */
export async function getApplyPositionBySlug(
  slug: string,
  options: { onlyOpen?: boolean } = {},
): Promise<ApplyPositionWithQuestions | null> {
  const normalized = String(slug ?? "").trim().toLowerCase();
  if (!normalized) return null;

  await ensureApplyTables();
  const db = getDb();

  const [position] = await db
    .select()
    .from(schema.applyPositions)
    .where(
      options.onlyOpen
        ? and(
            eq(schema.applyPositions.slug, normalized),
            eq(schema.applyPositions.status, "open"),
          )
        : eq(schema.applyPositions.slug, normalized),
    )
    .limit(1);

  if (!position) return null;

  return { ...toPosition(position), questions: await listApplyQuestions(position.id) };
}

/**
 * Open positions with their questions for the public site. Returns an empty
 * list when the database is unreachable, mirroring {@link listApplyPositions}.
 */
export async function getPublicApplyPositions(): Promise<ApplyPositionWithQuestions[]> {
  try {
    return await listApplyPositionsWithQuestions({ onlyOpen: true });
  } catch (e) {
    console.error("[apply] database read failed:", e);
    return [];
  }
}

/**
 * One open position with its questions for the public form. Returns `null` when
 * the position is closed, unknown *or* the database is unreachable — from the
 * page's point of view all three mean "do not show a form".
 */
export async function getPublicApplyPosition(
  slug: string,
): Promise<ApplyPositionWithQuestions | null> {
  try {
    return await getApplyPositionBySlug(slug, { onlyOpen: true });
  } catch (e) {
    console.error("[apply] database read failed:", e);
    return null;
  }
}

/** The questions of one position, in their persisted order. */
export async function listApplyQuestions(positionId: number): Promise<ApplyQuestion[]> {
  await ensureApplyTables();
  const rows = await getDb()
    .select()
    .from(schema.applyQuestions)
    .where(eq(schema.applyQuestions.position_id, positionId))
    .orderBy(asc(schema.applyQuestions.sort_order), asc(schema.applyQuestions.id));
  return rows.map(toQuestion);
}

/* -------------------------------------------------------------- positions -- */

/** Next free sort order, so a new position lands at the end of the list. */
async function nextPositionSortOrder(): Promise<number> {
  const [row] = await getDb()
    .select({
      next: sql<number>`coalesce(max(${schema.applyPositions.sort_order}), -1) + 1`,
    })
    .from(schema.applyPositions);
  return row?.next ?? 0;
}

/** Next free sort order within one position's question list. */
async function nextQuestionSortOrder(positionId: number): Promise<number> {
  const [row] = await getDb()
    .select({
      next: sql<number>`coalesce(max(${schema.applyQuestions.sort_order}), -1) + 1`,
    })
    .from(schema.applyQuestions)
    .where(eq(schema.applyQuestions.position_id, positionId));
  return row?.next ?? 0;
}

function positionDescriptions(input: ApplyPositionInput) {
  return {
    description_en: text(input.descriptionEn, APPLY_LIMITS.positionDescription),
    description_de: text(input.descriptionDe, APPLY_LIMITS.positionDescription),
  };
}

/**
 * Create a position.
 *
 * Defaults to `closed`: a position that opened itself the moment it was created
 * would start collecting applications before anybody wrote its questions.
 */
export async function createApplyPosition(
  input: ApplyPositionInput,
): Promise<ApplyPosition> {
  await ensureApplyTables();

  const name = text(input.name, APPLY_LIMITS.positionName);
  if (!name)
    throw new ApplyValidationError("name_required", "Name ist erforderlich.");

  const slug = normalizeApplySlug(input.slug ?? name);
  if (!slug)
    throw new ApplyValidationError(
      "slug_invalid",
      "Slug ist ungültig. Erlaubt sind Buchstaben, Ziffern und Bindestriche.",
    );

  const status = input.status === undefined ? "closed" : normalizeApplyStatus(input.status);
  if (!status)
    throw new ApplyValidationError(
      "status_invalid",
      "Status muss 'open' oder 'closed' sein.",
    );

  const sortOrder =
    input.sortOrder === undefined
      ? await nextPositionSortOrder()
      : Math.trunc(Number(input.sortOrder) || 0);

  const [row] = await getDb()
    .insert(schema.applyPositions)
    .values({
      name,
      slug,
      status,
      sort_order: sortOrder,
      ...positionDescriptions(input),
      updated_at: new Date(),
    })
    .returning();

  return toPosition(row);
}

/**
 * Patch a position. Only the keys present in `input` are written, so the
 * dashboard's status toggle does not have to resend the whole row. Returns
 * `null` when no position has that id.
 */
export async function updateApplyPosition(
  id: number,
  input: Partial<ApplyPositionInput>,
): Promise<ApplyPosition | null> {
  await ensureApplyTables();

  const patch: Partial<typeof schema.applyPositions.$inferInsert> = {
    updated_at: new Date(),
  };

  if (input.name !== undefined) {
    const name = text(input.name, APPLY_LIMITS.positionName);
    if (!name)
      throw new ApplyValidationError("name_required", "Name ist erforderlich.");
    patch.name = name;
  }

  if (input.slug !== undefined) {
    const slug = normalizeApplySlug(input.slug);
    if (!slug)
      throw new ApplyValidationError(
        "slug_invalid",
        "Slug ist ungültig. Erlaubt sind Buchstaben, Ziffern und Bindestriche.",
      );
    patch.slug = slug;
  }

  if (input.status !== undefined) {
    const status = normalizeApplyStatus(input.status);
    if (!status)
      throw new ApplyValidationError(
        "status_invalid",
        "Status muss 'open' oder 'closed' sein.",
      );
    patch.status = status;
  }

  if (input.sortOrder !== undefined)
    patch.sort_order = Math.trunc(Number(input.sortOrder) || 0);
  if (input.descriptionEn !== undefined)
    patch.description_en = text(input.descriptionEn, APPLY_LIMITS.positionDescription);
  if (input.descriptionDe !== undefined)
    patch.description_de = text(input.descriptionDe, APPLY_LIMITS.positionDescription);

  const [row] = await getDb()
    .update(schema.applyPositions)
    .set(patch)
    .where(eq(schema.applyPositions.id, id))
    .returning();

  return row ? toPosition(row) : null;
}

/**
 * Delete a position. Its questions go with it (ON DELETE CASCADE); the
 * applications that were sent for it stay and keep the position's name and slug
 * in their own columns. Returns `false` when no position has that id.
 */
export async function deleteApplyPosition(id: number): Promise<boolean> {
  await ensureApplyTables();
  const rows = await getDb()
    .delete(schema.applyPositions)
    .where(eq(schema.applyPositions.id, id))
    .returning({ id: schema.applyPositions.id });
  return rows.length > 0;
}

/* -------------------------------------------------------------- questions -- */

/** Shared field validation for create and patch. */
function questionTexts(input: ApplyQuestionInput) {
  return {
    label_en: text(input.labelEn, APPLY_LIMITS.label),
    label_de: text(input.labelDe, APPLY_LIMITS.label),
    placeholder_en: text(input.placeholderEn, APPLY_LIMITS.placeholder),
    placeholder_de: text(input.placeholderDe, APPLY_LIMITS.placeholder),
    description_en: text(input.descriptionEn, APPLY_LIMITS.questionDescription),
    description_de: text(input.descriptionDe, APPLY_LIMITS.questionDescription),
  };
}

/**
 * Add a question to a position.
 *
 * The field key may be omitted; it is then derived from the label, the way the
 * hardcoded forms name their fields. It is never derived from the *German*
 * label alone if an English one exists, so the key stays stable when only the
 * translation is edited later.
 */
export async function createApplyQuestion(
  positionId: number,
  input: ApplyQuestionInput,
): Promise<ApplyQuestion> {
  await ensureApplyTables();
  const db = getDb();

  const position = await getApplyPosition(positionId);
  if (!position)
    throw new ApplyValidationError("position_unknown", "Position nicht gefunden.");

  const texts = questionTexts(input);
  if (!texts.label_en && !texts.label_de)
    throw new ApplyValidationError(
      "label_required",
      "Die Frage braucht mindestens eine Beschriftung (Deutsch oder Englisch).",
    );

  const fieldKey = normalizeApplyFieldKey(
    input.fieldKey || texts.label_en || texts.label_de,
  );
  if (!fieldKey)
    throw new ApplyValidationError(
      "field_key_invalid",
      "Feldschlüssel ist ungültig. Erlaubt sind Buchstaben, Ziffern und Unterstriche.",
    );

  const type = input.type === undefined ? "text" : normalizeApplyQuestionType(input.type);
  if (!type)
    throw new ApplyValidationError(
      "type_invalid",
      `Feldtyp muss einer von ${APPLY_QUESTION_TYPES.join(", ")} sein.`,
    );

  const [existing] = await db
    .select({ value: count() })
    .from(schema.applyQuestions)
    .where(eq(schema.applyQuestions.position_id, positionId));
  if ((existing?.value ?? 0) >= APPLY_LIMITS.questionsPerPosition)
    throw new ApplyValidationError(
      "too_many_questions",
      `Eine Position kann höchstens ${APPLY_LIMITS.questionsPerPosition} Fragen haben.`,
    );

  const sortOrder =
    input.sortOrder === undefined
      ? await nextQuestionSortOrder(positionId)
      : Math.trunc(Number(input.sortOrder) || 0);

  const [row] = await db
    .insert(schema.applyQuestions)
    .values({
      position_id: positionId,
      field_key: fieldKey,
      type,
      required: input.required === undefined ? true : Boolean(input.required),
      sort_order: sortOrder,
      ...texts,
      updated_at: new Date(),
    })
    .returning();

  return toQuestion(row);
}

/**
 * Patch a question. Returns `null` when no question has that id.
 *
 * Changing `fieldKey` deliberately does not touch the applications that already
 * answered under the old key — they carry their own copy of the question.
 */
export async function updateApplyQuestion(
  id: number,
  input: ApplyQuestionInput,
): Promise<ApplyQuestion | null> {
  await ensureApplyTables();
  const db = getDb();

  const [current] = await db
    .select()
    .from(schema.applyQuestions)
    .where(eq(schema.applyQuestions.id, id))
    .limit(1);
  if (!current) return null;

  const patch: Partial<typeof schema.applyQuestions.$inferInsert> = {
    updated_at: new Date(),
  };

  if (input.fieldKey !== undefined) {
    const fieldKey = normalizeApplyFieldKey(input.fieldKey);
    if (!fieldKey)
      throw new ApplyValidationError(
        "field_key_invalid",
        "Feldschlüssel ist ungültig. Erlaubt sind Buchstaben, Ziffern und Unterstriche.",
      );
    patch.field_key = fieldKey;
  }

  if (input.type !== undefined) {
    const type = normalizeApplyQuestionType(input.type);
    if (!type)
      throw new ApplyValidationError(
        "type_invalid",
        `Feldtyp muss einer von ${APPLY_QUESTION_TYPES.join(", ")} sein.`,
      );
    patch.type = type;
  }

  if (input.required !== undefined) patch.required = Boolean(input.required);
  if (input.sortOrder !== undefined)
    patch.sort_order = Math.trunc(Number(input.sortOrder) || 0);

  const texts = questionTexts(input);
  if (input.labelEn !== undefined) patch.label_en = texts.label_en;
  if (input.labelDe !== undefined) patch.label_de = texts.label_de;
  if (input.placeholderEn !== undefined) patch.placeholder_en = texts.placeholder_en;
  if (input.placeholderDe !== undefined) patch.placeholder_de = texts.placeholder_de;
  if (input.descriptionEn !== undefined) patch.description_en = texts.description_en;
  if (input.descriptionDe !== undefined) patch.description_de = texts.description_de;

  // Checked against the row as it will be, not against the patch alone: clearing
  // the English label is fine while a German one remains, and vice versa.
  const labelEn = patch.label_en ?? current.label_en;
  const labelDe = patch.label_de ?? current.label_de;
  if (!labelEn && !labelDe)
    throw new ApplyValidationError(
      "label_required",
      "Die Frage braucht mindestens eine Beschriftung (Deutsch oder Englisch).",
    );

  const [row] = await db
    .update(schema.applyQuestions)
    .set(patch)
    .where(eq(schema.applyQuestions.id, id))
    .returning();

  return row ? toQuestion(row) : null;
}

/** Delete a question. Returns `false` when no question has that id. */
export async function deleteApplyQuestion(id: number): Promise<boolean> {
  await ensureApplyTables();
  const rows = await getDb()
    .delete(schema.applyQuestions)
    .where(eq(schema.applyQuestions.id, id))
    .returning({ id: schema.applyQuestions.id });
  return rows.length > 0;
}

/**
 * Rewrite the order of a position's questions from a list of ids.
 *
 * Ids that do not belong to the position are ignored rather than rejected, and
 * questions the caller did not mention keep their relative order behind the
 * listed ones — a drag-and-drop editor that raced with a second tab should
 * reorder what it knows about, not fail. The whole rewrite runs in one
 * transaction so a half-applied order can never be observed.
 */
export async function reorderApplyQuestions(
  positionId: number,
  orderedIds: unknown,
): Promise<ApplyQuestion[]> {
  await ensureApplyTables();

  const ids = (Array.isArray(orderedIds) ? orderedIds : [])
    .map((raw) => Math.trunc(Number(raw)))
    .filter((id) => Number.isFinite(id) && id > 0);

  const current = await listApplyQuestions(positionId);
  const known = new Set(current.map((q) => q.id));
  const wanted = ids.filter((id) => known.has(id));
  const rest = current.map((q) => q.id).filter((id) => !wanted.includes(id));
  const finalOrder = [...wanted, ...rest];

  await getDb().transaction(async (tx) => {
    for (const [sortOrder, id] of finalOrder.entries()) {
      await tx
        .update(schema.applyQuestions)
        .set({ sort_order: sortOrder, updated_at: new Date() })
        .where(eq(schema.applyQuestions.id, id));
    }
  });

  return listApplyQuestions(positionId);
}

/* ------------------------------------------------------------ submissions -- */

/**
 * Validate the posted answers against a position's questions and freeze them
 * into the snapshot that is stored with the application.
 *
 * Rejects unknown keys (a form that posts a field this position never asked for
 * is either stale or forged), missing required answers, and answers past the
 * length cap for their field type.
 */
export function buildApplyAnswers(
  questions: ApplyQuestion[],
  raw: unknown,
): ApplyAnswerRecord[] {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw))
    throw new ApplyValidationError(
      "answers_invalid",
      "Die Antworten müssen als Objekt übermittelt werden.",
    );

  const posted = raw as Record<string, unknown>;
  const known = new Set(questions.map((q) => q.fieldKey));
  for (const key of Object.keys(posted)) {
    if (!known.has(key))
      throw new ApplyValidationError(
        "unknown_field",
        `Unbekanntes Feld: ${key.slice(0, APPLY_LIMITS.fieldKey)}`,
      );
  }

  let total = 0;
  const answers: ApplyAnswerRecord[] = [];

  for (const question of questions) {
    const label = question.labelDe || question.labelEn || question.fieldKey;
    const value = String(posted[question.fieldKey] ?? "").trim();

    if (!value && question.required)
      throw new ApplyValidationError(
        "answer_required",
        `Bitte fülle das Feld aus: ${label}`,
      );

    if (value.length > APPLY_LIMITS.answer[question.type])
      throw new ApplyValidationError(
        "answer_too_long",
        `Die Antwort auf „${label}“ ist zu lang (maximal ` +
          `${APPLY_LIMITS.answer[question.type]} Zeichen).`,
      );

    total += value.length;
    if (total > APPLY_LIMITS.answersTotal)
      throw new ApplyValidationError(
        "answers_too_long",
        `Die Bewerbung ist insgesamt zu lang (maximal ${APPLY_LIMITS.answersTotal} Zeichen).`,
      );

    // Every question produces a row, including the optional ones left blank —
    // "was asked, not answered" and "was never asked" have to stay
    // distinguishable when the application is read later.
    answers.push({
      question_id: question.id,
      field_key: question.fieldKey,
      type: question.type,
      label_en: question.labelEn,
      label_de: question.labelDe,
      value,
    });
  }

  return answers;
}

/**
 * Store an application.
 *
 * The position is resolved and re-checked here: a form that was left open while
 * the position was closed must not still be able to post. The Discord identity
 * is expected to come from the server-side session — this function only checks
 * that it is a plausible snowflake, it cannot tell a session apart from a
 * request body.
 */
export async function createApplySubmission(
  input: ApplySubmissionInput,
): Promise<ApplySubmission> {
  await ensureApplyTables();

  const position = await getApplyPositionBySlug(input.positionSlug, { onlyOpen: true });
  if (!position)
    throw new ApplyValidationError(
      "position_closed",
      "Für diese Position werden aktuell keine Bewerbungen angenommen.",
    );

  const discordId = normalizeDiscordId(input.discord?.id);
  if (!discordId)
    throw new ApplyValidationError(
      "discord_required",
      "Für eine Bewerbung ist eine verifizierte Discord-Anmeldung erforderlich.",
    );

  const answers = buildApplyAnswers(position.questions, input.answers);
  const avatarUrl = text(input.discord?.avatarUrl, 500);

  const [row] = await getDb()
    .insert(schema.applySubmissions)
    .values({
      position_id: position.id,
      position_name: position.name,
      position_slug: position.slug,
      discord_id: discordId,
      discord_username: text(input.discord?.username, 100) || discordId,
      discord_avatar_url: avatarUrl || null,
      answers,
      status: "new",
      updated_at: new Date(),
    })
    .returning();

  return toSubmission(row);
}

/**
 * Applications, newest first, optionally filtered by position and status.
 *
 * `total` is the number of rows the filter matches, so the dashboard can page
 * without fetching everything. Both are read in one round trip.
 */
export async function listApplySubmissions(
  options: {
    positionId?: number;
    status?: string;
    limit?: number;
    offset?: number;
  } = {},
): Promise<ApplySubmissionPage> {
  await ensureApplyTables();
  const db = getDb();

  const filters: SQL[] = [];
  if (options.positionId !== undefined)
    filters.push(eq(schema.applySubmissions.position_id, options.positionId));
  if (options.status !== undefined) {
    const status = normalizeApplySubmissionStatus(options.status);
    if (!status)
      throw new ApplyValidationError(
        "status_invalid",
        `Status muss einer von ${APPLY_SUBMISSION_STATUSES.join(", ")} sein.`,
      );
    filters.push(eq(schema.applySubmissions.status, status));
  }
  const where = filters.length > 0 ? and(...filters) : undefined;

  const limit = Math.min(
    Math.max(Math.trunc(Number(options.limit) || APPLY_LIMITS.pageSize), 1),
    APPLY_LIMITS.maxPageSize,
  );
  const offset = Math.max(Math.trunc(Number(options.offset) || 0), 0);

  const [rows, [totalRow]] = await Promise.all([
    db
      .select()
      .from(schema.applySubmissions)
      .where(where)
      // Matches `apply_submissions_position_id_created_at_idx` (and its
      // position-less twin), so the page is read straight off the index.
      .orderBy(desc(schema.applySubmissions.created_at), desc(schema.applySubmissions.id))
      .limit(limit)
      .offset(offset),
    db.select({ value: count() }).from(schema.applySubmissions).where(where),
  ]);

  return {
    items: rows.map(toSubmission),
    total: totalRow?.value ?? 0,
    limit,
    offset,
  };
}

/** One application by id, or `null`. */
export async function getApplySubmission(id: number): Promise<ApplySubmission | null> {
  await ensureApplyTables();
  const [row] = await getDb()
    .select()
    .from(schema.applySubmissions)
    .where(eq(schema.applySubmissions.id, id))
    .limit(1);
  return row ? toSubmission(row) : null;
}

/**
 * Set the review status and/or the internal note of an application. Returns
 * `null` when no application has that id.
 *
 * `reviewed_at` follows the status: it is stamped when the application leaves
 * `new` and cleared when it is put back, so "decided at" never survives an
 * undo. Editing only the note leaves it alone.
 */
export async function updateApplySubmission(
  id: number,
  input: { status?: string; internalNote?: string },
): Promise<ApplySubmission | null> {
  await ensureApplyTables();

  const patch: Partial<typeof schema.applySubmissions.$inferInsert> = {
    updated_at: new Date(),
  };

  if (input.status !== undefined) {
    const status = normalizeApplySubmissionStatus(input.status);
    if (!status)
      throw new ApplyValidationError(
        "status_invalid",
        `Status muss einer von ${APPLY_SUBMISSION_STATUSES.join(", ")} sein.`,
      );
    patch.status = status;
    patch.reviewed_at = status === "new" ? null : new Date();
  }

  if (input.internalNote !== undefined)
    patch.internal_note = text(input.internalNote, APPLY_LIMITS.internalNote);

  const [row] = await getDb()
    .update(schema.applySubmissions)
    .set(patch)
    .where(eq(schema.applySubmissions.id, id))
    .returning();

  return row ? toSubmission(row) : null;
}

/** Delete an application. Returns `false` when no application has that id. */
export async function deleteApplySubmission(id: number): Promise<boolean> {
  await ensureApplyTables();
  const rows = await getDb()
    .delete(schema.applySubmissions)
    .where(eq(schema.applySubmissions.id, id))
    .returning({ id: schema.applySubmissions.id });
  return rows.length > 0;
}
