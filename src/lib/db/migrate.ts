import { getDb } from "./index";
import { sql } from "drizzle-orm";

export async function ensureTable() {
  const db = getDb();
  await db.run(sql`
    CREATE TABLE IF NOT EXISTS news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      short_description TEXT NOT NULL DEFAULT '',
      content TEXT NOT NULL DEFAULT '',
      image_url TEXT,
      published_at TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
}
