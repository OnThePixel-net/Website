/**
 * Applies the pending migrations in drizzle/ and exits.
 *
 * This is the production counterpart to `npm run db:migrate`. That script runs
 * drizzle-kit, a build tool that lives in devDependencies and is therefore not
 * in the runtime image — running it there fails with "drizzle-kit: not found".
 * The migrator used here ships inside drizzle-orm, which is a runtime
 * dependency, so the image needs no build tooling to migrate itself.
 *
 * Deliberately plain .mjs and not TypeScript: tsx is a devDependency too, and
 * requiring a transpiler to run migrations would reintroduce the exact problem
 * this file exists to solve.
 *
 * Run it before the new version starts serving traffic:
 *
 *   node scripts/migrate.mjs
 *
 * It is safe to run on every deploy and on a database that is already current:
 * drizzle records applied migrations in drizzle.__drizzle_migrations and skips
 * them. Running it concurrently from several containers is not safe, so keep it
 * a single deploy step rather than part of the container's start command.
 */
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const MIGRATIONS_FOLDER = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "drizzle",
);

const url = process.env.DATABASE_URL;
if (!url) {
  console.error(
    "[migrate] DATABASE_URL is not set. Point it at the database you want to " +
      "migrate and run this again.",
  );
  process.exit(1);
}

// `max: 1` because a migration run is strictly sequential, and drizzle takes a
// lock on its bookkeeping table; a pool would only add idle connections that
// keep the process alive after the work is done.
const client = postgres(url, { max: 1 });

try {
  console.log(`[migrate] applying migrations from ${MIGRATIONS_FOLDER}`);
  await migrate(drizzle(client), { migrationsFolder: MIGRATIONS_FOLDER });
  console.log("[migrate] database is up to date");
} catch (error) {
  // Surface the real cause: a failed migration leaves the database in whatever
  // state the last successful statement produced, and the operator needs to
  // know which one broke before deciding whether to retry or restore.
  console.error("[migrate] migration failed:", error);
  process.exitCode = 1;
} finally {
  await client.end({ timeout: 5 });
}
