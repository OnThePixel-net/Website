import { getDb } from "./index";
import { sql } from "drizzle-orm";

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

/**
 * The schema is owned by the Drizzle migrations in `drizzle/`, applied once per
 * deploy with `npm run db:migrate`. The bootstrap helpers below therefore stay
 * dormant unless `DB_AUTO_MIGRATE=1` is set — handy for a throwaway local
 * database, but in production they would only put avoidable DDL roundtrips in
 * front of the first response of every cold start.
 */
function autoMigrateEnabled(): boolean {
  return process.env.DB_AUTO_MIGRATE === "1";
}

/**
 * Memoise a bootstrap routine on its promise rather than on a "done" flag.
 *
 * A flag that is only flipped after the last `await` does not guard anything:
 * on a cold start every request that arrives while the first one is still
 * running passes the guard as well, and they all fire the same DDL in parallel.
 * Storing the in-flight promise makes the later callers await the first run
 * instead. A rejected run clears the memo so a subsequent request can retry —
 * otherwise one database hiccup would poison the instance for its whole life.
 */
function once(label: string, run: () => Promise<void>): () => Promise<void> {
  let pending: Promise<void> | null = null;

  return () => {
    if (!autoMigrateEnabled()) return Promise.resolve();
    if (!pending) {
      pending = run().catch((e) => {
        pending = null;
        console.error(`[db] ${label} failed:`, e);
        throw e;
      });
    }
    return pending;
  };
}

export const ensureTable = once("ensureTable", async () => {
  const db = getDb();
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
});

export const ensureCreatorTables = once("ensureCreatorTables", async () => {
  const db = getDb();
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
  // `discord_id` was added to `creators` after the table already existed, so a
  // throwaway database created by an older build still needs the column. The
  // UNIQUE constraint is added separately because `ADD COLUMN IF NOT EXISTS`
  // cannot carry one; NULLs stay distinct, so creators without a Discord id are
  // unaffected. See `drizzle/0001_creators_discord_id.sql` for the real
  // migration this mirrors.
  await db.execute(sql`
    ALTER TABLE creators ADD COLUMN IF NOT EXISTS discord_id TEXT
  `);
  await db.execute(sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = 'creators'::regclass AND conname = 'creators_discord_id_key'
      ) THEN
        ALTER TABLE creators ADD CONSTRAINT creators_discord_id_key UNIQUE (discord_id);
      END IF;
    END $$
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
});

export const ensureApplyTables = once("ensureApplyTables", async () => {
  const db = getDb();
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
});
