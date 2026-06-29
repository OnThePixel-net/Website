import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

let _db: ReturnType<typeof drizzle> | null = null;

export function getDb() {
  if (!_db) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    // Only force SSL when not connecting to localhost/127.0.0.1
    const isLocal = /localhost|127\.0\.0\.1/.test(url);
    const client = postgres(url, { ssl: isLocal ? false : "require", max: 5 });
    _db = drizzle(client, { schema });
  }
  return _db;
}

export { schema };
