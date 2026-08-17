import { getDb } from "./index";
import { sql } from "drizzle-orm";

let initialized = false;
let creatorsInitialized = false;
let applyInitialized = false;

/**
 * The positions the apply pages offer. They are seeded on first use so the
 * dashboard has something to toggle; the seed is `closed` so a position never
 * opens itself without an admin saying so.
 */
export const APPLY_POSITION_SEED = [
  { name: "Builder", slug: "builder" },
  { name: "Supporter", slug: "supporter" },
  { name: "Java Developer", slug: "developer" },
] as const;

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
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS news_translations (
        id SERIAL PRIMARY KEY,
        news_id INTEGER NOT NULL REFERENCES news(id) ON DELETE CASCADE,
        language TEXT NOT NULL,
        title TEXT NOT NULL DEFAULT '',
        short_description TEXT NOT NULL DEFAULT '',
        content TEXT NOT NULL DEFAULT '',
        UNIQUE(news_id, language)
      )
    `);
    initialized = true;
  } catch (e) {
    console.error("[db] ensureTable failed:", e);
    throw e;
  }
}

export async function ensureCreatorTables() {
  if (creatorsInitialized) return;
  const db = getDb();
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS creators (
        id SERIAL PRIMARY KEY,
        minecraft_uuid TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS creator_channels (
        id SERIAL PRIMARY KEY,
        creator_id INTEGER NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
        platform TEXT NOT NULL,
        url TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0
      )
    `);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS creator_channels_creator_id_idx
        ON creator_channels (creator_id, sort_order)
    `);
    creatorsInitialized = true;
  } catch (e) {
    console.error("[db] ensureCreatorTables failed:", e);
    throw e;
  }
}

export async function ensureApplyTables() {
  if (applyInitialized) return;
  const db = getDb();
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS apply_positions (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        slug TEXT NOT NULL UNIQUE,
        status TEXT NOT NULL DEFAULT 'closed',
        sort_order INTEGER NOT NULL DEFAULT 0,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    for (let i = 0; i < APPLY_POSITION_SEED.length; i++) {
      const { name, slug } = APPLY_POSITION_SEED[i];
      await db.execute(sql`
        INSERT INTO apply_positions (name, slug, status, sort_order)
        VALUES (${name}, ${slug}, 'closed', ${i})
        ON CONFLICT (name) DO NOTHING
      `);
    }
    applyInitialized = true;
  } catch (e) {
    console.error("[db] ensureApplyTables failed:", e);
    throw e;
  }
}
