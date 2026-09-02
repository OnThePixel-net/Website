import { defineConfig } from "drizzle-kit";

/**
 * Drizzle Kit configuration.
 *
 * `db:generate` only diffs `src/lib/db/schema.ts` against the snapshots in
 * `drizzle/meta` and needs no database. `db:migrate` does connect, so
 * DATABASE_URL has to be present when it runs — see README/.env.example.
 */
export default defineConfig({
  dialect: "postgresql",
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
});
