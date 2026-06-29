import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb, schema } from "@/lib/db";
import { eq } from "drizzle-orm";

async function checkAuth() {
  const session = await auth();
  return !!session;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await checkAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    const body = await req.json();
    const { title, slug, short_description, content, image_url, published_at, author } = body;
    const [item] = await getDb()
      .update(schema.news)
      .set({
        ...(title !== undefined && { title }),
        ...(slug !== undefined && { slug }),
        ...(short_description !== undefined && { short_description }),
        ...(content !== undefined && { content }),
        ...(image_url !== undefined && { image_url }),
        ...(published_at !== undefined && { published_at }),
        ...(author !== undefined && { author }),
        updated_at: new Date(),
      })
      .where(eq(schema.news.id, Number(id)))
      .returning();
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: item });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await checkAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  try {
    await getDb().delete(schema.news).where(eq(schema.news.id, Number(id)));
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
