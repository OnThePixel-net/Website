import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

let _db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!_db) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    // TLS is deliberately not pinned here. postgres.js only lets an explicit
    // `ssl` option win over the connection string, so hardcoding `ssl: false`
    // silently disabled TLS even for a `?sslmode=require` URL. Leaving it out
    // keeps the same behaviour for a plain URL (the driver defaults to no TLS,
    // which is what the local Docker database and a private-network database
    // want) while letting a deployment opt in through the URL alone.
    const client = postgres(url, { max: 5 });
    _db = drizzle(client, { schema });
  }
  return _db;
}

export { schema };
