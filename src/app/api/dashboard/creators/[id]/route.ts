import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/authz";
import { LEVEL_DELETE, LEVEL_WRITE } from "@/lib/permissions";
import { getDb, schema } from "@/lib/db";
import { ensureCreatorTables } from "@/lib/db/migrate";
import { normalizeMinecraftUuid, sanitizeChannels } from "@/lib/creators";
import {
  checkGuildMembership,
  joinWarnings,
  normalizeSnowflake,
  resolveCreatorRole,
  revokeManagedRole,
  syncManagedRole,
} from "@/lib/discord-sync";
import { eq } from "drizzle-orm";

/**
 * postgres.js surfaces the driver error (with the SQLSTATE code) as `cause`,
 * while the wrapping drizzle error only carries the failed query text — so the
 * code has to be read off the cause to recognise a unique violation.
 */
function isUniqueViolation(e: unknown) {
  const err = e as { code?: string; cause?: { code?: string } };
  return err?.code === "23505" || err?.cause?.code === "23505";
}

/**
 * Which unique constraint was violated. `creators` has two, and telling the
 * operator "that UUID is taken" when in fact the Discord id collided would send
 * them looking at the wrong field.
 */
function uniqueViolationMessage(e: unknown): string {
  const err = e as {
    constraint_name?: string;
    message?: string;
    cause?: { constraint_name?: string; message?: string };
  };
  const hint = `${err?.constraint_name ?? err?.cause?.constraint_name ?? ""} ${
    err?.cause?.message ?? err?.message ?? ""
  }`;
  return hint.includes("discord")
    ? "Diese Discord-ID ist bereits einem anderen Creator zugeordnet."
    : "Diese Minecraft-UUID ist bereits einem Creator zugeordnet.";
}

function handleError(e: unknown, scope: string) {
  const msg = e instanceof Error ? e.message : String(e);
  console.error(`[creators ${scope}]`, e);
  if (isUniqueViolation(e)) {
    return NextResponse.json(
      { error: uniqueViolationMessage(e) },
      { status: 409 },
    );
  }
  return NextResponse.json({ error: msg }, { status: 500 });
}

const INVALID_DISCORD_ID =
  "Ungültige Discord-ID. Erwartet werden 17–20 Ziffern (Developer Mode in Discord aktivieren, dann Rechtsklick auf den Account → „ID kopieren“).";

/**
 * PATCH — update name, UUID, Discord id and/or the channel list. Channels are
 * replaced wholesale: the submitted order becomes the stored `sort_order`.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const gate = await requirePermission("creators", LEVEL_WRITE);
  if (!gate.ok) return gate.response;

  const { id } = await params;
  const creatorId = Number(id);
  if (!Number.isInteger(creatorId))
    return NextResponse.json({ error: "Ungültige ID." }, { status: 400 });

  try {
    await ensureCreatorTables();
    const body = await req.json();
    const db = getDb();

    // The row is read up front because the Discord sync needs to know which
    // account currently holds the role before the update overwrites it.
    const [existing] = await db
      .select()
      .from(schema.creators)
      .where(eq(schema.creators.id, creatorId));
    if (!existing)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    const update: {
      name?: string;
      minecraft_uuid?: string;
      discord_id?: string | null;
      updated_at: Date;
    } = { updated_at: new Date() };

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

    // An omitted `discordId` leaves the link untouched — that is what keeps a
    // creator from before the role sync editable without being forced to fill
    // the field in.
    const previousDiscordId = existing.discord_id ?? "";
    let nextDiscordId = previousDiscordId;
    if (body.discordId !== undefined) {
      const raw = String(body.discordId).trim();
      const parsed = raw ? normalizeSnowflake(raw) : "";
      if (parsed === null)
        return NextResponse.json(
          { error: INVALID_DISCORD_ID },
          { status: 400 },
        );
      nextDiscordId = parsed;
      update.discord_id = parsed || null;
    }

    // A newly linked account has to be on the server, checked before the row is
    // touched so the refusal leaves nothing half-applied.
    let membershipWarning: string | undefined;
    if (nextDiscordId && nextDiscordId !== previousDiscordId) {
      const membership = await checkGuildMembership(
        nextDiscordId,
        update.name ?? existing.name,
        "gespeichert",
      );
      if (!membership.ok)
        return NextResponse.json(
          { error: membership.message },
          { status: 400 },
        );
      membershipWarning = membership.warning;
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

    // Move the role to whichever account is linked now. Unlike the create path
    // this does not roll back: the update also rewrote the name, the UUID and
    // the whole channel list, and putting those back has no clean meaning — so
    // the row keeps the operator's edit and the Discord failure is reported
    // with the fix in it.
    let roleWarning: string | null = null;
    let creatorRoleNotice: string | undefined;
    if (previousDiscordId || nextDiscordId) {
      const creatorRole = await resolveCreatorRole();
      creatorRoleNotice = creatorRole.notice;
      roleWarning = await syncManagedRole(
        { discordId: previousDiscordId, roleId: creatorRole.roleId },
        { discordId: nextDiscordId, roleId: creatorRole.roleId },
        `Creator ${updated.name} updated via the OTP dashboard`,
      );
    }

    return NextResponse.json({
      data: {
        id: updated.id,
        name: updated.name,
        minecraftUuid: updated.minecraft_uuid,
        discordId: updated.discord_id,
        sortOrder: updated.sort_order,
        channels,
      },
      warning: joinWarnings(membershipWarning, creatorRoleNotice, roleWarning),
    });
  } catch (e) {
    return handleError(e, "PATCH");
  }
}

/** LEVEL_DELETE — remove a creator; channels are dropped by the cascade. */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const gate = await requirePermission("creators", LEVEL_DELETE);
  if (!gate.ok) return gate.response;

  const { id } = await params;
  const creatorId = Number(id);
  if (!Number.isInteger(creatorId))
    return NextResponse.json({ error: "Ungültige ID." }, { status: 400 });

  try {
    await ensureCreatorTables();
    const db = getDb();

    const [existing] = await db
      .select()
      .from(schema.creators)
      .where(eq(schema.creators.id, creatorId));

    // The deletion is what was asked for and runs regardless of Discord: a
    // creator who already left the server, or an unreachable Discord, must not
    // keep a removed creator on the website.
    await db.delete(schema.creators).where(eq(schema.creators.id, creatorId));

    let warning: string | null = null;
    if (existing?.discord_id) {
      const creatorRole = await resolveCreatorRole();
      warning =
        joinWarnings(
          creatorRole.notice,
          await revokeManagedRole(
            { discordId: existing.discord_id, roleId: creatorRole.roleId },
            `Creator ${existing.name} removed via the OTP dashboard`,
          ),
        ) ?? null;
    }

    // 204 stays the answer for the ordinary case; a warning needs a body to
    // travel in, and the dashboard shows it after the row disappears.
    if (!warning) return new NextResponse(null, { status: 204 });
    return NextResponse.json({ ok: true, warning });
  } catch (e) {
    return handleError(e, "DELETE");
  }
}
