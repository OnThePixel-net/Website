import { createClient } from "@libsql/client/http";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

function getClient() {
  const url = process.env.TURSO_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;
  if (!url) throw new Error("TURSO_URL is not set");
  return createClient({ url, authToken });
}

export function getDb() {
  return drizzle(getClient(), { schema });
}

export { schema };
