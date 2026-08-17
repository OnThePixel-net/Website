import { NextRequest, NextResponse } from "next/server";
import { listCreators, toPublicCreator, normalizeMinecraftUuid } from "@/lib/creators";

const CORS = { "Access-Control-Allow-Origin": "*" };

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
          { status: 404, headers: CORS },
        );
      return NextResponse.json(
        { data: raw ? entry : toPublicCreator(entry) },
        {
          headers: {
            ...CORS,
            "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
          },
        },
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
      {
        headers: {
          ...CORS,
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      },
    );
  } catch (e) {
    console.error("[creators public GET]", e);
    return NextResponse.json({ error: String(e) }, { status: 500, headers: CORS });
  }
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}
