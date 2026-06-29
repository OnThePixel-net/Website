import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const news = pgTable("news", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  short_description: text("short_description").notNull().default(""),
  content: text("content").notNull().default(""),
  image_url: text("image_url"),
  published_at: text("published_at").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export type NewsItem = typeof news.$inferSelect;
export type NewNewsItem = typeof news.$inferInsert;
