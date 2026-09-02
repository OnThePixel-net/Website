import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/authz";
import { LEVEL_WRITE } from "@/lib/permissions";
import { getDb, schema } from "@/lib/db";
import { ensureCreatorTables } from "@/lib/db/migrate";
import { eq } from "drizzle-orm";

/**
 * PUT — persist the creator display order. The body carries the full list of
 * creator ids in the desired order; each position becomes that row's
 * `sort_order`, which is what the public listing sorts by.
 */
export async function PUT(req: NextRequest) {
  // Reordering changes rows, it does not remove any — so this is LEVEL_WRITE, not
  // LEVEL_DELETE, despite the method being PUT on a list. Levels are assigned per
  // handler by what it actually does, never by its HTTP verb alone.
  const gate = await requirePermission("creators", LEVEL_WRITE);
  if (!gate.ok) return gate.response;

  try {
    await ensureCreatorTables();
    const body = await req.json();
    const ids = Array.isArray(body.ids) ? body.ids.map(Number) : [];

    if (ids.length === 0 || ids.some((id: number) => !Number.isInteger(id)))
      return NextResponse.json(
        { error: "ids muss eine Liste von Creator-IDs sein." },
        { status: 400 },
      );

    const db = getDb();
    for (let i = 0; i < ids.length; i++) {
      await db
        .update(schema.creators)
        .set({ sort_order: i, updated_at: new Date() })
        .where(eq(schema.creators.id, ids[i]));
    }

    return NextResponse.json({ data: { ids } });
  } catch (e) {
    console.error("[creators order PUT]", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
