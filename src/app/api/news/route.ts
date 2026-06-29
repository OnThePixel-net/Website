import { NextRequest, NextResponse } from "next/server";
import { getDb, schema } from "@/lib/db";
import { ensureTable } from "@/lib/db/migrate";
import { eq, desc, count } from "drizzle-orm";

const CORS = { "Access-Control-Allow-Origin": "*" };

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const limit = Math.min(Number(searchParams.get("limit") ?? "50"), 100);
  const offset = Number(searchParams.get("offset") ?? "0");
  const slug = searchParams.get("slug");

  try {
    await ensureTable();
    const db = getDb();

    if (slug) {
      const [item] = await db
        .select()
        .from(schema.news)
        .where(eq(schema.news.slug, slug))
        .limit(1);
      if (!item) return NextResponse.json({ error: "Not found" }, { status: 404, headers: CORS });
      return NextResponse.json({ data: item }, { headers: CORS });
    }

    const [items, [{ total }]] = await Promise.all([
      db.select().from(schema.news).orderBy(desc(schema.news.published_at)).limit(limit).offset(offset),
      db.select({ total: count() }).from(schema.news),
    ]);

    return NextResponse.json(
      { data: items, meta: { total, limit, offset } },
      { headers: { ...CORS, "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120" } },
    );
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500, headers: CORS });
  }
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}
