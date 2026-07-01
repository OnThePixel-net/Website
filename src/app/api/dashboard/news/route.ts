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
    const db = getDb();
    const items = await db.select().from(schema.news).orderBy(desc(schema.news.published_at));
    const allTranslations = await db.select().from(schema.newsTranslations);

    const data = items.map((item) => ({
      ...item,
      translations: allTranslations
        .filter((tr) => tr.news_id === item.id)
        .reduce<Record<string, { title: string; short_description: string; content: string }>>(
          (acc, tr) => {
            acc[tr.language] = { title: tr.title, short_description: tr.short_description, content: tr.content };
            return acc;
          },
          {},
        ),
    }));

    return NextResponse.json({ data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const detail = (e as { cause?: unknown })?.cause;
    console.error("[news GET]", e);
    return NextResponse.json({ error: msg, detail: String(detail ?? "") }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await checkAuth())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await ensureTable();
    const body = await req.json();
    const { title, slug, short_description, content, image_url, translations } = body;
    if (!title || !slug) {
      return NextResponse.json({ error: "title and slug are required" }, { status: 400 });
    }
    const session = await auth();
    const author = session?.user?.name ?? "";
    const published_at = new Date().toISOString().slice(0, 10);
    const db = getDb();
    const [item] = await db
      .insert(schema.news)
      .values({ title, slug, short_description: short_description ?? "", content: content ?? "", image_url: image_url ?? null, published_at, author })
      .returning();

    if (translations && typeof translations === "object") {
      for (const [lang, tr] of Object.entries(translations as Record<string, { title?: string; short_description?: string; content?: string }>)) {
        if (!lang || lang === "en") continue;
        await db.insert(schema.newsTranslations).values({
          news_id: item.id,
          language: lang,
          title: tr.title ?? "",
          short_description: tr.short_description ?? "",
          content: tr.content ?? "",
        }).onConflictDoUpdate({
          target: [schema.newsTranslations.news_id, schema.newsTranslations.language],
          set: { title: tr.title ?? "", short_description: tr.short_description ?? "", content: tr.content ?? "" },
        });
      }
    }

    return NextResponse.json({ data: item }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
