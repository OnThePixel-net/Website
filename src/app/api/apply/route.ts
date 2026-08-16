import { NextRequest, NextResponse } from "next/server";
import { listApplyPositions } from "@/lib/apply";

const CORS = { "Access-Control-Allow-Origin": "*" };

/**
 * Public read-only REST API for the apply positions.
 *
 *   GET /api/apply              → all positions
 *   GET /api/apply?slug=builder → a single position
 *
 * The payload keeps the field names of the legacy CMS collection
 * (`id` / `name` / `status`) so existing consumers keep working; `slug` is
 * added on top.
 */
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");

  try {
    const positions = await listApplyPositions();

    if (slug) {
      const position = positions.find(
        (p) => p.slug.toLowerCase() === slug.trim().toLowerCase(),
      );
      if (!position)
        return NextResponse.json(
          { error: "Not found" },
          { status: 404, headers: CORS },
        );
      return NextResponse.json(
        { data: position },
        {
          headers: {
            ...CORS,
            "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
          },
        },
      );
    }

    return NextResponse.json(
      { data: positions },
      {
        headers: {
          ...CORS,
          "Cache-Control": "public, s-maxage=30, stale-while-revalidate=120",
        },
      },
    );
  } catch (e) {
    console.error("[apply public GET]", e);
    return NextResponse.json({ error: String(e) }, { status: 500, headers: CORS });
  }
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}
