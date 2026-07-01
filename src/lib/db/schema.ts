import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";

export const news = pgTable("news", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  short_description: text("short_description").notNull().default(""),
  content: text("content").notNull().default(""),
  image_url: text("image_url"),
  published_at: text("published_at").notNull(),
  author: text("author").notNull().default(""),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const newsTranslations = pgTable("news_translations", {
  id: serial("id").primaryKey(),
  news_id: integer("news_id").notNull().references(() => news.id, { onDelete: "cascade" }),
  language: text("language").notNull(),
  title: text("title").notNull().default(""),
  short_description: text("short_description").notNull().default(""),
  content: text("content").notNull().default(""),
});

export type NewsItem = typeof news.$inferSelect;
export type NewNewsItem = typeof news.$inferInsert;
export type NewsTranslationItem = typeof newsTranslations.$inferSelect;
