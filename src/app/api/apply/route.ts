import { NextRequest, NextResponse } from "next/server";
import { listApplyPositions } from "@/lib/apply";

// These endpoints serve only content that is already public on the site and
// read no cookies or auth headers, so a wildcard origin exposes nothing that a
// plain fetch of the page would not. Credentialed requests stay impossible:
// `Access-Control-Allow-Credentials` is deliberately absent, and browsers
// reject `*` together with credentials.
const CORS = { "Access-Control-Allow-Origin": "*" };

// Same policy for the list and for a single position — both are public rows.
const CACHE = "public, s-maxage=30, stale-while-revalidate=120";
// Cache misses too, so an unknown slug cannot be used to hammer the database.
// Short and without stale-while-revalidate so a newly added position does not
// stay hidden behind a cached 404.
const NOT_FOUND_CACHE = "public, s-maxage=30";
// Errors are never cached — a cached 500 would outlive the outage that caused it.
const ERROR_CACHE = "no-store";

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
          { status: 404, headers: { ...CORS, "Cache-Control": NOT_FOUND_CACHE } },
        );
      return NextResponse.json(
        { data: position },
        { headers: { ...CORS, "Cache-Control": CACHE } },
      );
    }

    return NextResponse.json(
      { data: positions },
      { headers: { ...CORS, "Cache-Control": CACHE } },
    );
  } catch (e) {
    console.error("[apply public GET]", e);
    return NextResponse.json(
      { error: String(e) },
      { status: 500, headers: { ...CORS, "Cache-Control": ERROR_CACHE } },
    );
  }
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}
