import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/authz";
import { LEVEL_READ, LEVEL_WRITE } from "@/lib/permissions";
import { getDb, schema } from "@/lib/db";
import { ensureCreatorTables } from "@/lib/db/migrate";
import {
  listCreators,
  normalizeMinecraftUuid,
  sanitizeChannels,
} from "@/lib/creators";
import { isDiscordConfigured } from "@/lib/discord";
import {
  checkGuildMembership,
  joinWarnings,
  normalizeSnowflake,
  resolveCreatorRole,
  syncManagedRole,
} from "@/lib/discord-sync";
import { eq, sql } from "drizzle-orm";

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

/**
 * Read the Discord id off a request body.
 *
 * `""` means "no account linked" and is a valid answer — creators existed long
 * before the role sync and their `discord_id` column is nullable — so only a
 * non-empty value that is not a snowflake is rejected.
 */
function parseDiscordId(input: unknown): string | null {
  const raw = String(input ?? "").trim();
  return raw ? normalizeSnowflake(raw) : "";
}

const INVALID_DISCORD_ID =
  "Ungültige Discord-ID. Erwartet werden 17–20 Ziffern (Developer Mode in Discord aktivieren, dann Rechtsklick auf den Account → „ID kopieren“).";

/** GET — list all creators with their channels. */
export async function GET() {
  const gate = await requirePermission("creators", LEVEL_READ);
  if (!gate.ok) return gate.response;
  try {
    const configured = isDiscordConfigured();
    // Only ask PocketID for the creator rank when the bot could act on it at
    // all; with no bot configured the answer would change nothing on screen.
    const creatorRole = configured
      ? await resolveCreatorRole()
      : { roleId: "", rankName: null, notice: undefined };

    return NextResponse.json({
      data: await listCreators(),
      discord: {
        configured,
        creatorRank: creatorRole.rankName,
        notice: creatorRole.notice,
      },
    });
  } catch (e) {
    return handleError(e, "GET");
  }
}

/** POST — create a creator together with its channels. */
export async function POST(req: NextRequest) {
  const gate = await requirePermission("creators", LEVEL_WRITE);
  if (!gate.ok) return gate.response;

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

    const discordId = parseDiscordId(body.discordId);
    if (discordId === null)
      return NextResponse.json({ error: INVALID_DISCORD_ID }, { status: 400 });

    // Ask Discord before writing anything: a creator whose account is not on
    // the server can never be given the role, and the operator should hear that
    // as "this person is not in our Discord", not as a role error afterwards.
    let membershipWarning: string | undefined;
    if (discordId) {
      const membership = await checkGuildMembership(discordId, name);
      if (!membership.ok)
        return NextResponse.json(
          { error: membership.message },
          { status: 400 },
        );
      membershipWarning = membership.warning;
    }

    const creatorRole = discordId
      ? await resolveCreatorRole()
      : { roleId: "", rankName: null, notice: undefined };

    const channels = sanitizeChannels(body.channels);
    const db = getDb();

    // New creators go to the end of the list.
    const [{ max }] = await db
      .select({
        max: sql<number>`COALESCE(MAX(${schema.creators.sort_order}), -1)`,
      })
      .from(schema.creators);

    const [created] = await db
      .insert(schema.creators)
      .values({
        name,
        minecraft_uuid: minecraftUuid,
        discord_id: discordId || null,
        sort_order: Number(max) + 1,
      })
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

    // Hand out the creator role. Unlike a team member — whose PocketID account
    // is an identity other things already depend on — a creator that was
    // inserted a moment ago is just one row, so a refused role is rolled back
    // rather than left as a creator the operator believes is synced. The most
    // likely cause (the bot's role sitting too low) is fixed on Discord and the
    // form, which stays open with its values, is submitted again.
    const roleWarning = await syncManagedRole(
      { discordId: null, roleId: null },
      { discordId, roleId: creatorRole.roleId },
      `Creator ${name} added via the OTP dashboard`,
    );
    if (roleWarning) {
      await db
        .delete(schema.creators)
        .where(eq(schema.creators.id, created.id));
      return NextResponse.json(
        {
          error: `Der Creator wurde NICHT angelegt, weil die Discord-Rolle nicht vergeben werden konnte. ${roleWarning}`,
        },
        { status: 502 },
      );
    }

    return NextResponse.json(
      {
        data: {
          id: created.id,
          name: created.name,
          minecraftUuid: created.minecraft_uuid,
          discordId: created.discord_id,
          sortOrder: created.sort_order,
          channels,
        },
        // A missing creator rank is reported, never fatal: the creator is
        // supposed to exist on the website whether or not Discord is set up.
        warning: joinWarnings(membershipWarning, creatorRole.notice),
      },
      { status: 201 },
    );
  } catch (e) {
    return handleError(e, "POST");
  }
}
