import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/authz";
import { LEVEL_READ, LEVEL_WRITE } from "@/lib/permissions";
import { getDb, schema } from "@/lib/db";
import { ensureTable } from "@/lib/db/migrate";
import { desc, inArray } from "drizzle-orm";

type TranslationMap = Record<
  string,
  { title: string; short_description: string; content: string }
>;

/** Index translation rows by their article id so lookups stay O(1). */
function groupTranslations(
  rows: {
    news_id: number;
    language: string;
    title: string;
    short_description: string;
    content: string;
  }[],
): Map<number, TranslationMap> {
  const byNewsId = new Map<number, TranslationMap>();
  for (const tr of rows) {
    let group = byNewsId.get(tr.news_id);
    if (!group) {
      group = {};
      byNewsId.set(tr.news_id, group);
    }
    group[tr.language] = {
      title: tr.title,
      short_description: tr.short_description,
      content: tr.content,
    };
  }
  return byNewsId;
}

export async function GET() {
  const gate = await requirePermission("news", LEVEL_READ);
  if (!gate.ok) return gate.response;
  try {
    await ensureTable();
    const db = getDb();
    const items = await db
      .select()
      .from(schema.news)
      .orderBy(desc(schema.news.published_at));

    // Only the translations of the articles we actually return, matched through
    // a map instead of a per-item `.filter()` over the whole table.
    const translations = items.length
      ? await db
          .select()
          .from(schema.newsTranslations)
          .where(
            inArray(
              schema.newsTranslations.news_id,
              items.map((i) => i.id),
            ),
          )
      : [];

    const byNewsId = groupTranslations(translations);

    const data = items.map((item) => ({
      ...item,
      translations: byNewsId.get(item.id) ?? {},
    }));

    return NextResponse.json({ data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const detail = (e as { cause?: unknown })?.cause;
    console.error("[news GET]", e);
    return NextResponse.json(
      { error: msg, detail: String(detail ?? "") },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const gate = await requirePermission("news", LEVEL_WRITE);
  if (!gate.ok) return gate.response;
  try {
    await ensureTable();
    const body = await req.json();
    const { title, slug, short_description, content, image_url, translations } =
      body;
    if (!title || !slug) {
      return NextResponse.json(
        { error: "title and slug are required" },
        { status: 400 },
      );
    }
    // The guard above already loaded the session; reuse it instead of asking
    // next-auth a second time within the same request.
    const author = gate.session.user?.name ?? "";
    const published_at = new Date().toISOString().slice(0, 10);
    const db = getDb();
    const [item] = await db
      .insert(schema.news)
      .values({
        title,
        slug,
        short_description: short_description ?? "",
        content: content ?? "",
        image_url: image_url ?? null,
        published_at,
        author,
      })
      .returning();

    if (translations && typeof translations === "object") {
      for (const [lang, tr] of Object.entries(
        translations as Record<
          string,
          { title?: string; short_description?: string; content?: string }
        >,
      )) {
        if (!lang || lang === "en") continue;
        await db
          .insert(schema.newsTranslations)
          .values({
            news_id: item.id,
            language: lang,
            title: tr.title ?? "",
            short_description: tr.short_description ?? "",
            content: tr.content ?? "",
          })
          .onConflictDoUpdate({
            target: [
              schema.newsTranslations.news_id,
              schema.newsTranslations.language,
            ],
            set: {
              title: tr.title ?? "",
              short_description: tr.short_description ?? "",
              content: tr.content ?? "",
            },
          });
      }
    }

    return NextResponse.json({ data: item }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
