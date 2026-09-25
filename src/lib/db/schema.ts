import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  boolean,
  jsonb,
  index,
  unique,
  foreignKey,
} from "drizzle-orm/pg-core";

// Relative, not the `@/` alias: drizzle-kit loads this file on its own to diff
// the schema, outside the Next/tsconfig path resolution the app runs under.
import { NO_PERMISSIONS, type PermissionSet } from "../permissions";

/**
 * Constraint and index names are spelled out explicitly instead of relying on
 * Drizzle's naming scheme, because these objects already exist in production:
 * they were created by the raw DDL in `db/migrate.ts`, so PostgreSQL named them
 * with its own defaults (`<table>_<columns>_key` / `_fkey`). Keeping the schema
 * on those names means a diff against the live database stays empty instead of
 * proposing to drop and recreate every constraint under a new name.
 */

export const news = pgTable("news", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique("news_slug_key"),
  short_description: text("short_description").notNull().default(""),
  content: text("content").notNull().default(""),
  image_url: text("image_url"),
  published_at: text("published_at").notNull(),
  author: text("author").notNull().default(""),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const newsTranslations = pgTable(
  "news_translations",
  {
    id: serial("id").primaryKey(),
    news_id: integer("news_id").notNull(),
    language: text("language").notNull(),
    title: text("title").notNull().default(""),
    short_description: text("short_description").notNull().default(""),
    content: text("content").notNull().default(""),
  },
  (t) => [
    foreignKey({
      name: "news_translations_news_id_fkey",
      columns: [t.news_id],
      foreignColumns: [news.id],
    }).onDelete("cascade"),
    // One row per article and language. Doubles as the btree index that backs
    // the `WHERE news_id = $1` lookups on the news detail page, and as the
    // conflict target of the dashboard's translation upserts.
    unique("news_translations_news_id_language_key").on(t.news_id, t.language),
  ],
);

export const creators = pgTable("creators", {
  id: serial("id").primaryKey(),
  minecraft_uuid: text("minecraft_uuid").notNull().unique("creators_minecraft_uuid_key"),
  name: text("name").notNull(),
  /**
   * Discord user id, used to hand the creator their Discord role.
   *
   * `text`, not a numeric type: a snowflake is a 64-bit integer and would lose
   * its last digits once JavaScript parses it as a double.
   *
   * Nullable, because creators already exist in production without one — the
   * role sync must not invalidate those rows. Still UNIQUE so the same Discord
   * account cannot be attached to two creators; PostgreSQL treats NULLs as
   * distinct in a unique constraint, so any number of creators without a
   * Discord id remain allowed.
   */
  discord_id: text("discord_id").unique("creators_discord_id_key"),
  sort_order: integer("sort_order").notNull().default(0),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const creatorChannels = pgTable(
  "creator_channels",
  {
    id: serial("id").primaryKey(),
    creator_id: integer("creator_id").notNull(),
    platform: text("platform").notNull(),
    url: text("url").notNull(),
    sort_order: integer("sort_order").notNull().default(0),
  },
  (t) => [
    foreignKey({
      name: "creator_channels_creator_id_fkey",
      columns: [t.creator_id],
      foreignColumns: [creators.id],
    }).onDelete("cascade"),
    // Serves the per-creator channel lookup and hands back the rows already in
    // the order the dashboard persisted them.
    index("creator_channels_creator_id_idx").on(t.creator_id, t.sort_order),
  ],
);

export const applyPositions = pgTable("apply_positions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique("apply_positions_name_key"),
  slug: text("slug").notNull().unique("apply_positions_slug_key"),
  status: text("status").notNull().default("closed"),
  /**
   * The card text on `/apply`, one column per site language.
   *
   * Until now this copy lived in the translation dictionaries
   * (`t.apply.builderDesc` …), which only works as long as the set of positions
   * is hardcoded. A position created in the dashboard has no dictionary key, so
   * the text has to travel with the row.
   *
   * Two columns rather than an `apply_position_translations` table: the site
   * has exactly two fixed languages and this is a single short sentence per
   * language. A translation table would buy a third language nobody has asked
   * for, at the price of a join and an upsert per language on every read and
   * write. `news_translations` earns that price because an article carries
   * three long fields and is edited per language; a position does not.
   *
   * NOT NULL DEFAULT '' so the rows that already exist stay valid — an empty
   * description renders as the empty card body it is today for a position the
   * dictionary has no entry for.
   */
  description_en: text("description_en").notNull().default(""),
  description_de: text("description_de").notNull().default(""),
  sort_order: integer("sort_order").notNull().default(0),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/**
 * The questions a position's application form asks, in the shape the form
 * component (`ApplicationField` in `components/page/ApplicationForm.tsx`)
 * consumes: a key, a label, a field type, an optional placeholder and an
 * optional hint below the label.
 *
 * Labels, placeholders and hints are stored per language for the same reason as
 * the position description above: two fixed languages, short strings, no
 * per-language editing workflow.
 */
export const applyQuestions = pgTable(
  "apply_questions",
  {
    id: serial("id").primaryKey(),
    position_id: integer("position_id").notNull(),
    /**
     * The key the answer is stored under — `ApplicationField.id`, e.g.
     * `minecraft_username`. Unique per position so a submission's answers can
     * be keyed by it unambiguously.
     */
    field_key: text("field_key").notNull(),
    /** One of `APPLY_QUESTION_TYPES` in `lib/apply.ts` (`text` / `textarea`). */
    type: text("type").notNull().default("text"),
    /**
     * Defaults to true because that is what the form does today: it marks every
     * field with an asterisk and refuses to submit while one is empty.
     */
    required: boolean("required").notNull().default(true),
    label_en: text("label_en").notNull().default(""),
    label_de: text("label_de").notNull().default(""),
    /** Empty string means "not set" — the form then renders no placeholder/hint. */
    placeholder_en: text("placeholder_en").notNull().default(""),
    placeholder_de: text("placeholder_de").notNull().default(""),
    description_en: text("description_en").notNull().default(""),
    description_de: text("description_de").notNull().default(""),
    sort_order: integer("sort_order").notNull().default(0),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    foreignKey({
      name: "apply_questions_position_id_fkey",
      columns: [t.position_id],
      foreignColumns: [applyPositions.id],
    }).onDelete("cascade"),
    // Deleting a position deletes its questions: a question without its
    // position is meaningless, and the already submitted applications keep
    // their own copy of the questions (see `apply_submissions.answers`).
    //
    // Serves the per-position question lookup and hands the rows back already
    // in the order the dashboard persisted them — same shape as
    // `creator_channels_creator_id_idx`.
    index("apply_questions_position_id_idx").on(t.position_id, t.sort_order),
    unique("apply_questions_position_id_field_key_key").on(t.position_id, t.field_key),
  ],
);

/**
 * One answer as it was given, frozen at submission time.
 *
 * The label and type are copied in on purpose. A pure reference to
 * `apply_questions.id` would make an application unreadable as soon as the team
 * renames a question ("Portfolio Links" → "Bauwerke") or deletes it, and a
 * deleted question would take the answer's meaning with it — exactly the point
 * at which an old application still has to be defensible. `question_id` is kept
 * as a hint for the dashboard (to group answers by their current question) and
 * is explicitly allowed to point at a row that no longer exists.
 */
export interface ApplyAnswerRecord {
  question_id: number | null;
  field_key: string;
  type: string;
  label_en: string;
  label_de: string;
  value: string;
}

export const applySubmissions = pgTable(
  "apply_submissions",
  {
    id: serial("id").primaryKey(),
    /**
     * Nullable, and the foreign key is ON DELETE SET NULL rather than CASCADE:
     * deleting the "Builder" position must not delete the applications people
     * sent for it. The two snapshot columns below keep such an orphaned row
     * readable.
     */
    position_id: integer("position_id"),
    position_name: text("position_name").notNull(),
    position_slug: text("position_slug").notNull(),
    /**
     * The Discord identity as verified by the session at submission time.
     * `discord_id` is a snowflake and therefore `text`: its 64-bit value does
     * not survive a JavaScript number.
     */
    discord_id: text("discord_id").notNull(),
    discord_username: text("discord_username").notNull(),
    discord_avatar_url: text("discord_avatar_url"),
    /**
     * The full question/answer snapshot, see {@link ApplyAnswerRecord}.
     *
     * `jsonb` and not a row per answer: the answers are only ever read as a
     * whole, together with the submission, and a per-answer table would need
     * the same label snapshot on every row anyway. It is not `text` (as the
     * news blocks are) because nothing has to stay compatible here — a fresh
     * column can have the type that makes the database reject malformed JSON.
     */
    answers: jsonb("answers").$type<ApplyAnswerRecord[]>().notNull().default([]),
    /** One of `APPLY_SUBMISSION_STATUSES` in `lib/apply.ts`. */
    status: text("status").notNull().default("new"),
    /** Team-internal remark; never leaves the dashboard. */
    internal_note: text("internal_note").notNull().default(""),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    /** When the status last left `new`; null while the application is untouched. */
    reviewed_at: timestamp("reviewed_at", { withTimezone: true }),
  },
  (t) => [
    foreignKey({
      name: "apply_submissions_position_id_fkey",
      columns: [t.position_id],
      foreignColumns: [applyPositions.id],
    }).onDelete("set null"),
    // The dashboard's main query: the applications for one position, newest
    // first. Ordering the index descending lets it satisfy the ORDER BY too,
    // instead of only the WHERE.
    index("apply_submissions_position_id_created_at_idx").on(
      t.position_id,
      t.created_at.desc(),
    ),
    // Same query without the position filter (the unfiltered inbox).
    index("apply_submissions_created_at_idx").on(t.created_at.desc()),
  ],
);

/**
 * A bug report sent through the public form on `/bug-report`.
 *
 * Sending one needs no login — the captcha is the spam barrier — so the
 * Discord columns are nullable and only filled when the reporter happened to
 * be signed in. They come from the server-side session, never from the form.
 */
export const bugReports = pgTable(
  "bug_reports",
  {
    id: serial("id").primaryKey(),
    /** One of `BUG_REPORT_CATEGORIES` in `lib/bug-reports.ts`. */
    category: text("category").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    /** How to reproduce it; empty when the reporter left it out. */
    steps: text("steps").notNull().default(""),
    /** In-game name, so the team can find the player; empty when not given. */
    minecraft_name: text("minecraft_name").notNull().default(""),
    /** Snowflake as text — its 64-bit value does not survive a JS number. */
    discord_id: text("discord_id"),
    discord_username: text("discord_username"),
    discord_avatar_url: text("discord_avatar_url"),
    /** One of `BUG_REPORT_STATUSES` in `lib/bug-reports.ts`. */
    status: text("status").notNull().default("new"),
    /** Team-internal remark; never leaves the dashboard. */
    internal_note: text("internal_note").notNull().default(""),
    created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    // The dashboard lists newest first, filtered by status or not.
    index("bug_reports_created_at_idx").on(t.created_at.desc()),
    index("bug_reports_status_created_at_idx").on(t.status, t.created_at.desc()),
  ],
);

export type NewsItem = typeof news.$inferSelect;
export type NewNewsItem = typeof news.$inferInsert;
export type NewsTranslationItem = typeof newsTranslations.$inferSelect;
export type CreatorRecord = typeof creators.$inferSelect;
export type NewCreatorRecord = typeof creators.$inferInsert;
export type CreatorChannelRecord = typeof creatorChannels.$inferSelect;
export type ApplyPositionRecord = typeof applyPositions.$inferSelect;
export type NewApplyPositionRecord = typeof applyPositions.$inferInsert;
export type ApplyQuestionRecord = typeof applyQuestions.$inferSelect;
export type NewApplyQuestionRecord = typeof applyQuestions.$inferInsert;
export type ApplySubmissionRecord = typeof applySubmissions.$inferSelect;
export type NewApplySubmissionRecord = typeof applySubmissions.$inferInsert;
export type BugReportRecord = typeof bugReports.$inferSelect;
export type NewBugReportRecord = typeof bugReports.$inferInsert;

/**
 * A personal access token for the dashboard API.
 *
 * The dashboard's route handlers under `/api/dashboard/**` were reachable with
 * a browser session only, which is right for the dashboard itself and useless
 * for everything else that wants to talk to it — a Discord bot posting a news
 * article, a deploy script opening an application position. An API key is that
 * second way in: the same endpoints, the same per-area levels, no cookie.
 *
 * Stored like a password, because that is what it is:
 *
 *  - `token_hash` is a salted scrypt digest of the full token —
 *    `scrypt$<salt>$<key>`, salt and scheme travelling with it rather than in
 *    columns of their own — and the only copy that survives creation. The token
 *    itself is shown once, in the dialog that created it, and cannot be
 *    recovered afterwards — a leaked database row does not hand anybody a
 *    working key. `lib/api-keys.ts` explains why a memory-hard KDF is worth its
 *    ~100 ms here even though the secret is 256 random bits.
 *  - `prefix` is the token's leading, non-secret segment. It is what the list
 *    shows ("otp_3f9a2c7b…"), so an operator can tell which key a log line or a
 *    running script means, and it is what a request is looked up by — one
 *    indexed row instead of hashing against every key in the table.
 *
 * Rights are the same {@link PermissionSet} a Pocket ID group carries, stored
 * as `jsonb` so a fifth area needs no migration, and always read back through
 * `coercePermissions()` — a level nobody recognises must come out as "no
 * access", never as an unknown the guard might misread.
 */
export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  /** Free-text label, e.g. "Discord bot" — only ever shown in the dashboard. */
  name: text("name").notNull(),
  /** The token's public, searchable segment. See the table comment. */
  prefix: text("prefix").notNull().unique("api_keys_prefix_key"),
  /** Salted scrypt digest of the whole token; the token is never stored. */
  token_hash: text("token_hash").notNull().unique("api_keys_token_hash_key"),
  /** Per-area levels, exactly as `session.user.permissions` carries them. */
  permissions: jsonb("permissions")
    .$type<PermissionSet>()
    .notNull()
    .default(NO_PERMISSIONS),
  /** Display name of the account that created the key, for the audit trail. */
  created_by: text("created_by").notNull().default(""),
  created_at: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  /**
   * Last time the key authenticated a request, or null while it never has.
   * Written at most once a minute per key (see `lib/api-keys.ts`) so a busy
   * integration does not turn every read into a write.
   */
  last_used_at: timestamp("last_used_at", { withTimezone: true }),
  /** Optional expiry; null means the key is valid until it is revoked. */
  expires_at: timestamp("expires_at", { withTimezone: true }),
  /**
   * When the key was revoked, null while it is live. Revoking keeps the row
   * rather than deleting it: the name, the prefix and `last_used_at` are the
   * record of what that key did, and they are exactly what is wanted after a
   * key has had to be pulled.
   */
  revoked_at: timestamp("revoked_at", { withTimezone: true }),
});

export type ApiKeyRecord = typeof apiKeys.$inferSelect;
export type NewApiKeyRecord = typeof apiKeys.$inferInsert;
