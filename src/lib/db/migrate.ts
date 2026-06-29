import { getDb } from "./index";
import { sql } from "drizzle-orm";

let initialized = false;

export async function ensureTable() {
  if (initialized) return;
  const db = getDb();
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS news (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        short_description TEXT NOT NULL DEFAULT '',
        content TEXT NOT NULL DEFAULT '',
        image_url TEXT,
        published_at TEXT NOT NULL,
        author TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await db.execute(sql`
      ALTER TABLE news ADD COLUMN IF NOT EXISTS author TEXT NOT NULL DEFAULT ''
    `);
    initialized = true;
  } catch (e) {
    console.error("[db] ensureTable failed:", e);
    throw e;
  }
}
