import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb, schema } from "@/lib/db";
import { ensureCreatorTables } from "@/lib/db/migrate";
import {
  listCreators,
  normalizeMinecraftUuid,
  sanitizeChannels,
} from "@/lib/creators";
import { sql } from "drizzle-orm";

async function checkAuth() {
  const session = await auth();
  return !!session;
}

/**
 * postgres.js surfaces the driver error (with the SQLSTATE code) as `cause`,
 * while the wrapping drizzle error only carries the failed query text — so the
 * code has to be read off the cause to recognise a unique violation.
 */
function isUniqueViolation(e: unknown) {
  const err = e as { code?: string; cause?: { code?: string } };
  return err?.code === "23505" || err?.cause?.code === "23505";
}

function handleError(e: unknown, scope: string) {
  const msg = e instanceof Error ? e.message : String(e);
  console.error(`[creators ${scope}]`, e);
  if (isUniqueViolation(e)) {
    return NextResponse.json(
      { error: "Diese Minecraft-UUID ist bereits einem Creator zugeordnet." },
      { status: 409 },
    );
  }
  return NextResponse.json({ error: msg }, { status: 500 });
}

/** GET — list all creators with their channels. */
export async function GET() {
  if (!(await checkAuth()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    return NextResponse.json({ data: await listCreators() });
  } catch (e) {
    return handleError(e, "GET");
  }
}

/** POST — create a creator together with its channels. */
export async function POST(req: NextRequest) {
  if (!(await checkAuth()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    await ensureCreatorTables();
    const body = await req.json();

    const name = String(body.name ?? "").trim();
    if (!name)
      return NextResponse.json(
        { error: "Name ist erforderlich." },
        { status: 400 },
      );

    const minecraftUuid = normalizeMinecraftUuid(body.minecraftUuid);
    if (!minecraftUuid)
      return NextResponse.json(
        { error: "Ungültige Minecraft-UUID." },
        { status: 400 },
      );

    const channels = sanitizeChannels(body.channels);
    const db = getDb();

    // New creators go to the end of the list.
    const [{ max }] = await db
      .select({ max: sql<number>`COALESCE(MAX(${schema.creators.sort_order}), -1)` })
      .from(schema.creators);

    const [created] = await db
      .insert(schema.creators)
      .values({ name, minecraft_uuid: minecraftUuid, sort_order: Number(max) + 1 })
      .returning();

    if (channels.length > 0) {
      await db.insert(schema.creatorChannels).values(
        channels.map((c, i) => ({
          creator_id: created.id,
          platform: c.platform,
          url: c.url,
          sort_order: i,
        })),
      );
    }

    return NextResponse.json(
      {
        data: {
          id: created.id,
          name: created.name,
          minecraftUuid: created.minecraft_uuid,
          sortOrder: created.sort_order,
          channels,
        },
      },
      { status: 201 },
    );
  } catch (e) {
    return handleError(e, "POST");
  }
}
