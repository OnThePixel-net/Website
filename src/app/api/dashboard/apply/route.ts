import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/authz";
import { LEVEL_READ, LEVEL_WRITE } from "@/lib/permissions";
import { getDb, schema } from "@/lib/db";
import { ensureApplyTables } from "@/lib/db/migrate";
import { listApplyPositions } from "@/lib/apply";
import { eq } from "drizzle-orm";

/** GET — list the apply positions with their open/closed status. */
export async function GET() {
  const gate = await requirePermission("apply", LEVEL_READ);
  if (!gate.ok) return gate.response;
  try {
    await ensureApplyTables();
    return NextResponse.json({ data: await listApplyPositions() });
  } catch (e) {
    console.error("[apply GET]", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

/** PATCH — open or close a position, addressed by id or slug. */
export async function PATCH(req: NextRequest) {
  const gate = await requirePermission("apply", LEVEL_WRITE);
  if (!gate.ok) return gate.response;

  try {
    await ensureApplyTables();
    const body = await req.json();

    const status = String(body.status ?? "");
    if (status !== "open" && status !== "closed")
      return NextResponse.json(
        { error: "status muss 'open' oder 'closed' sein." },
        { status: 400 },
      );

    const id = body.id !== undefined ? Number(body.id) : null;
    const slug = body.slug !== undefined ? String(body.slug).trim() : null;
    if (id === null && !slug)
      return NextResponse.json(
        { error: "id oder slug ist erforderlich." },
        { status: 400 },
      );

    const [updated] = await getDb()
      .update(schema.applyPositions)
      .set({ status, updated_at: new Date() })
      .where(
        id !== null
          ? eq(schema.applyPositions.id, id)
          : eq(schema.applyPositions.slug, slug!),
      )
      .returning();

    if (!updated)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({
      data: {
        id: updated.id,
        name: updated.name,
        slug: updated.slug,
        status: updated.status,
        sortOrder: updated.sort_order,
      },
    });
  } catch (e) {
    console.error("[apply PATCH]", e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
