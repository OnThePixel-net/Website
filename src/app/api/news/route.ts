import { NextRequest, NextResponse } from "next/server";

const CMS = "https://cms.onthepixel.net";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const limit = Math.min(Number(searchParams.get("limit") ?? "50"), 100);
  const offset = Number(searchParams.get("offset") ?? "0");
  const url = searchParams.get("url");

  try {
    if (url) {
      const res = await fetch(
        `${CMS}/items/News?filter[url][_eq]=${encodeURIComponent(url)}&limit=1`,
        { next: { revalidate: 60 } },
      );
      if (!res.ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
      const data = await res.json();
      const item = data?.data?.[0] ?? null;
      if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
      return NextResponse.json({ data: item });
    }

    const res = await fetch(
      `${CMS}/items/News?sort=-date&limit=${limit}&offset=${offset}&meta=total_count`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) throw new Error("CMS error");
    const data = await res.json();

    return NextResponse.json(
      {
        data: data.data ?? [],
        meta: {
          total: data.meta?.total_count ?? null,
          limit,
          offset,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
          "Access-Control-Allow-Origin": "*",
        },
      },
    );
  } catch {
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}
