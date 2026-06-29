import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb, schema } from "@/lib/db";
import { ensureTable } from "@/lib/db/migrate";
import { desc } from "drizzle-orm";

async function checkAuth() {
  const session = await auth();
  return !!session;
}

export async function GET() {
  if (!(await checkAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await ensureTable();
    const items = await getDb().select().from(schema.news).orderBy(desc(schema.news.published_at));
    return NextResponse.json({ data: items });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await checkAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await ensureTable();
    const body = await req.json();
    const { title, slug, short_description, content, image_url, published_at } = body;
    if (!title || !slug || !published_at) {
      return NextResponse.json({ error: "title, slug and published_at are required" }, { status: 400 });
    }
    const [item] = await getDb()
      .insert(schema.news)
      .values({ title, slug, short_description: short_description ?? "", content: content ?? "", image_url: image_url ?? null, published_at })
      .returning();
    return NextResponse.json({ data: item }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
