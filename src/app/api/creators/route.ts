import { NextRequest, NextResponse } from "next/server";
import { listCreators, toPublicCreator, normalizeMinecraftUuid } from "@/lib/creators";

// These endpoints serve only content that is already public on the site and
// read no cookies or auth headers, so a wildcard origin exposes nothing that a
// plain fetch of the page would not. Credentialed requests stay impossible:
// `Access-Control-Allow-Credentials` is deliberately absent, and browsers
// reject `*` together with credentials.
const CORS = { "Access-Control-Allow-Origin": "*" };

// Same policy for the list and for a single creator — both are public rows.
const CACHE = "public, s-maxage=60, stale-while-revalidate=300";
// Cache misses too, so an unknown uuid/name cannot be used to hammer the
// database. Short and without stale-while-revalidate so a newly added creator
// does not stay hidden behind a cached 404.
const NOT_FOUND_CACHE = "public, s-maxage=30";
// Errors are never cached — a cached 500 would outlive the outage that caused it.
const ERROR_CACHE = "no-store";

/**
 * Public read-only REST API for creators.
 *
 *   GET /api/creators                     → all creators
 *   GET /api/creators?uuid=<minecraft>    → a single creator by Minecraft UUID
 *   GET /api/creators?name=<name>         → a single creator by name (case-insensitive)
 *   GET /api/creators?limit=&offset=      → pagination
 *   GET /api/creators?format=raw          → dashboard shape instead of the legacy CMS shape
 *
 * The default payload keeps the legacy CMS field names (`Minecraft_username`,
 * `Name`, `Platforms`) so existing consumers do not have to change.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const raw = searchParams.get("format") === "raw";
  const uuidParam = searchParams.get("uuid");
  const nameParam = searchParams.get("name");

  try {
    const all = await listCreators();

    if (uuidParam || nameParam) {
      const uuid = uuidParam ? normalizeMinecraftUuid(uuidParam) : null;
      const entry = all.find((c) =>
        uuidParam
          ? c.minecraftUuid === uuid
          : c.name.toLowerCase() === String(nameParam).trim().toLowerCase(),
      );
      if (!entry)
        return NextResponse.json(
          { error: "Not found" },
          { status: 404, headers: { ...CORS, "Cache-Control": NOT_FOUND_CACHE } },
        );
      return NextResponse.json(
        { data: raw ? entry : toPublicCreator(entry) },
        { headers: { ...CORS, "Cache-Control": CACHE } },
      );
    }

    const limit = Math.min(Number(searchParams.get("limit") ?? "200") || 200, 200);
    const offset = Math.max(Number(searchParams.get("offset") ?? "0") || 0, 0);
    const page = all.slice(offset, offset + limit);

    return NextResponse.json(
      {
        data: raw ? page : page.map(toPublicCreator),
        meta: { total: all.length, limit, offset },
      },
      { headers: { ...CORS, "Cache-Control": CACHE } },
    );
  } catch (e) {
    console.error("[creators public GET]", e);
    return NextResponse.json(
      { error: String(e) },
      { status: 500, headers: { ...CORS, "Cache-Control": ERROR_CACHE } },
    );
  }
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}
