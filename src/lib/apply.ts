import { asc } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { ensureApplyTables } from "@/lib/db/migrate";

export type ApplyStatus = "open" | "closed";

export interface ApplyPosition {
  id: number;
  name: string;
  slug: string;
  status: ApplyStatus;
  sortOrder: number;
}

/** Routes the apply overview links to, keyed by position name. */
export const POSITION_ROUTES: Record<string, string> = {
  Builder: "/apply/builder",
  Supporter: "/apply/supporter",
  "Java Developer": "/apply/developer",
};

/**
 * All positions with their current status. Returns an empty list when the
 * database is unreachable — the apply pages then simply show nothing open,
 * which is the safe direction to fail in.
 */
export async function listApplyPositions(): Promise<ApplyPosition[]> {
  try {
    await ensureApplyTables();
    const rows = await getDb()
      .select()
      .from(schema.applyPositions)
      .orderBy(asc(schema.applyPositions.sort_order), asc(schema.applyPositions.id));

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      status: row.status === "open" ? "open" : "closed",
      sortOrder: row.sort_order,
    }));
  } catch (e) {
    console.error("[apply] database read failed:", e);
    return [];
  }
}

/** Whether applications for a position are currently accepted. */
export async function isPositionOpen(name: string): Promise<boolean> {
  const positions = await listApplyPositions();
  return positions.some((p) => p.name === name && p.status === "open");
}
