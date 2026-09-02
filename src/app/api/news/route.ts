import { NextRequest, NextResponse } from "next/server";
import { getDb, schema } from "@/lib/db";
import { ensureTable } from "@/lib/db/migrate";
import { eq, desc, count, inArray } from "drizzle-orm";

// These endpoints serve only content that is already public on the site and
// read no cookies or auth headers, so a wildcard origin exposes nothing that a
// plain fetch of the page would not. Credentialed requests stay impossible:
// `Access-Control-Allow-Credentials` is deliberately absent, and browsers
// reject `*` together with credentials.
const CORS = { "Access-Control-Allow-Origin": "*" };

// Every successful public response is cacheable the same way, whether it is the
// list or a single article — both are the same rows, just filtered differently.
const CACHE = "public, s-maxage=30, stale-while-revalidate=120";
// A 404 is cached too, so a bot hammering a broken slug does not reach the
// database on every try. Deliberately short and without stale-while-revalidate:
// a freshly published article must not stay invisible behind a cached 404.
const NOT_FOUND_CACHE = "public, s-maxage=30";
// Errors are never cached — a cached 500 would outlive the outage that caused it.
const ERROR_CACHE = "no-store";

type TranslationMap = Record<string, { title: string; short_description: string; content: string }>;

/** Index translation rows by their article id so lookups stay O(1). */
function groupTranslations(
  rows: { news_id: number; language: string; title: string; short_description: string; content: string }[],
): Map<number, TranslationMap> {
  const byNewsId = new Map<number, TranslationMap>();
  for (const tr of rows) {
    let group = byNewsId.get(tr.news_id);
    if (!group) {
      group = {};
      byNewsId.set(tr.news_id, group);
    }
    group[tr.language] = { title: tr.title, short_description: tr.short_description, content: tr.content };
  }
  return byNewsId;
}

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
      if (!item)
        return NextResponse.json(
          { error: "Not found" },
          { status: 404, headers: { ...CORS, "Cache-Control": NOT_FOUND_CACHE } },
        );

      const translations = await db
        .select()
        .from(schema.newsTranslations)
        .where(eq(schema.newsTranslations.news_id, item.id));

      return NextResponse.json({
        data: {
          ...item,
          translations: groupTranslations(translations).get(item.id) ?? {},
        },
      }, { headers: { ...CORS, "Cache-Control": CACHE } });
    }

    const [items, [{ total }]] = await Promise.all([
      db.select().from(schema.news).orderBy(desc(schema.news.published_at)).limit(limit).offset(offset),
      db.select({ total: count() }).from(schema.news),
    ]);

    // Fetch only the translations belonging to this page. Reading the whole
    // table and filtering it per item in JS made both the transfer and the
    // matching grow with the total article count instead of with `limit`.
    // `inArray` with an empty list would emit invalid SQL, so an empty page
    // skips the query.
    const translations = items.length
      ? await db
          .select()
          .from(schema.newsTranslations)
          .where(inArray(schema.newsTranslations.news_id, items.map((i) => i.id)))
      : [];

    const byNewsId = groupTranslations(translations);

    const data = items.map((item) => ({
      ...item,
      translations: byNewsId.get(item.id) ?? {},
    }));

    return NextResponse.json(
      { data, meta: { total, limit, offset } },
      { headers: { ...CORS, "Cache-Control": CACHE } },
    );
  } catch (e) {
    return NextResponse.json(
      { error: String(e) },
      { status: 500, headers: { ...CORS, "Cache-Control": ERROR_CACHE } },
    );
  }
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}
