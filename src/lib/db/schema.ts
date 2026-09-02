import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  index,
  unique,
  foreignKey,
} from "drizzle-orm/pg-core";

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
  sort_order: integer("sort_order").notNull().default(0),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type NewsItem = typeof news.$inferSelect;
export type NewNewsItem = typeof news.$inferInsert;
export type NewsTranslationItem = typeof newsTranslations.$inferSelect;
export type CreatorRecord = typeof creators.$inferSelect;
export type NewCreatorRecord = typeof creators.$inferInsert;
export type CreatorChannelRecord = typeof creatorChannels.$inferSelect;
export type ApplyPositionRecord = typeof applyPositions.$inferSelect;
