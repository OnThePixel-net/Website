import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDb, schema } from "@/lib/db";
import { ensureCreatorTables } from "@/lib/db/migrate";
import { normalizeMinecraftUuid, sanitizeChannels } from "@/lib/creators";
import { eq } from "drizzle-orm";

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

/**
 * PATCH — update name, UUID and/or the channel list. Channels are replaced
 * wholesale: the submitted order becomes the stored `sort_order`.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await checkAuth()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const creatorId = Number(id);
  if (!Number.isInteger(creatorId))
    return NextResponse.json({ error: "Ungültige ID." }, { status: 400 });

  try {
    await ensureCreatorTables();
    const body = await req.json();
    const db = getDb();

    const update: { name?: string; minecraft_uuid?: string; updated_at: Date } = {
      updated_at: new Date(),
    };

    if (body.name !== undefined) {
      const name = String(body.name).trim();
      if (!name)
        return NextResponse.json(
          { error: "Name ist erforderlich." },
          { status: 400 },
        );
      update.name = name;
    }

    if (body.minecraftUuid !== undefined) {
      const uuid = normalizeMinecraftUuid(body.minecraftUuid);
      if (!uuid)
        return NextResponse.json(
          { error: "Ungültige Minecraft-UUID." },
          { status: 400 },
        );
      update.minecraft_uuid = uuid;
    }

    const [updated] = await db
      .update(schema.creators)
      .set(update)
      .where(eq(schema.creators.id, creatorId))
      .returning();

    if (!updated)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    let channels = undefined;
    if (body.channels !== undefined) {
      channels = sanitizeChannels(body.channels);
      await db
        .delete(schema.creatorChannels)
        .where(eq(schema.creatorChannels.creator_id, creatorId));
      if (channels.length > 0) {
        await db.insert(schema.creatorChannels).values(
          channels.map((c, i) => ({
            creator_id: creatorId,
            platform: c.platform,
            url: c.url,
            sort_order: i,
          })),
        );
      }
    }

    return NextResponse.json({
      data: {
        id: updated.id,
        name: updated.name,
        minecraftUuid: updated.minecraft_uuid,
        sortOrder: updated.sort_order,
        channels,
      },
    });
  } catch (e) {
    return handleError(e, "PATCH");
  }
}

/** DELETE — remove a creator; channels are dropped by the cascade. */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await checkAuth()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const creatorId = Number(id);
  if (!Number.isInteger(creatorId))
    return NextResponse.json({ error: "Ungültige ID." }, { status: 400 });

  try {
    await ensureCreatorTables();
    await getDb().delete(schema.creators).where(eq(schema.creators.id, creatorId));
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    return handleError(e, "DELETE");
  }
}
