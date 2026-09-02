import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/authz";
import { LEVEL_DELETE, LEVEL_WRITE } from "@/lib/permissions";
import {
  pocketIdFetch,
  fetchAllPages,
  getClaim,
  otpGroupIds,
  PocketIdError,
  type PocketUser,
  type UserGroup,
} from "@/lib/pocketid";
import {
  checkGuildMembership,
  joinWarnings,
  managedRoleIdFor,
  normalizeSnowflake,
  revokeManagedRole,
  syncManagedRole,
} from "@/lib/discord-sync";

function handleError(e: unknown) {
  if (e instanceof PocketIdError)
    return NextResponse.json(
      { error: e.message, detail: e.body },
      { status: e.status >= 400 ? e.status : 500 },
    );
  return NextResponse.json({ error: String(e) }, { status: 500 });
}

/**
 * The Discord role a member should hold, given the OTP groups they are in.
 *
 * A disabled account resolves to no role. That mirrors the rest of the system
 * rather than inventing a rule: `getPublicTeamMembers()` already drops disabled
 * accounts from the public team page, so a deactivated member is not shown as
 * team anywhere — and should not keep wearing the rank on Discord either.
 * Re-enabling the account hands the role straight back, because the same
 * function then resolves to the rank again.
 *
 * @param groupIds  the member's group ids (OTP and non-OTP alike).
 * @param groupById the full group catalogue; group objects embedded on a user
 *   may omit custom claims, so the mapping has to be read from here.
 */
function roleFor(
  groupIds: string[],
  groupById: Map<string, UserGroup>,
  otpIds: Set<string>,
  disabled: boolean,
): string {
  if (disabled) return "";
  const memberGroups = groupIds
    .filter((gid) => otpIds.has(gid))
    .map((gid) => groupById.get(gid))
    .filter((g): g is UserGroup => Boolean(g));
  return managedRoleIdFor(memberGroups);
}

/** PUT — update an existing team member in PocketID. */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const gate = await requirePermission("team", LEVEL_WRITE);
  if (!gate.ok) return gate.response;

  const { id } = await params;
  if (!id)
    return NextResponse.json({ error: "Missing user id" }, { status: 400 });

  try {
    const body = await req.json();

    // Load the current user and the group catalogue in parallel.
    const [userRes, groups] = await Promise.all([
      pocketIdFetch(`/api/users/${id}`),
      fetchAllPages<UserGroup>("/api/user-groups"),
    ]);
    const current = (await userRes.json()) as PocketUser;
    const otpIds = otpGroupIds(groups);
    const groupById = new Map(groups.map((g) => [g.id, g]));

    // Resolve the target group set: OTP groups come from the request, every
    // non-OTP group the user already belongs to is preserved untouched.
    let newGroupIds: string[] | null = null;
    if (Array.isArray(body.groupIds)) {
      const selectedOtp = body.groupIds
        .map((g: unknown) => String(g))
        .filter((g: string) => otpIds.has(g));
      if (selectedOtp.length === 0)
        return NextResponse.json(
          { error: "Mindestens eine Gruppe muss ausgewählt werden." },
          { status: 400 },
        );
      const keptNonOtp = (current.userGroups ?? [])
        .map((g) => g.id)
        .filter((gid) => !otpIds.has(gid));
      newGroupIds = Array.from(new Set([...keptNonOtp, ...selectedOtp]));
    }

    // 1) Core user fields (mirrors the create payload shape).
    const email =
      body.email !== undefined
        ? String(body.email).trim()
        : (current.email ?? "");
    const displayName =
      body.displayName !== undefined
        ? String(body.displayName).trim() || current.username
        : (current.displayName ?? current.username);
    const disabled =
      body.disabled !== undefined ? !!body.disabled : !!current.disabled;

    // Work out both sides of the Discord state before anything is written, so
    // an invalid id or an absent account can still be refused cleanly.
    const previousGroupIds = (current.userGroups ?? []).map((g) => g.id);
    const previousDiscordId = getClaim(current, "Discord-id");
    const previousRoleId = roleFor(
      previousGroupIds,
      groupById,
      otpIds,
      !!current.disabled,
    );

    let nextDiscordId = previousDiscordId;
    if (body.discordId !== undefined) {
      const raw = String(body.discordId).trim();
      const parsed = raw ? normalizeSnowflake(raw) : "";
      if (parsed === null)
        return NextResponse.json(
          {
            error:
              "Ungültige Discord-ID. Erwartet werden 17–20 Ziffern (Developer Mode in Discord aktivieren, dann Rechtsklick auf den Account → „ID kopieren“).",
          },
          { status: 400 },
        );
      nextDiscordId = parsed;
    }
    const nextRoleId = roleFor(
      newGroupIds ?? previousGroupIds,
      groupById,
      otpIds,
      disabled,
    );

    // A *newly* linked account has to be on the server, for the same reason a
    // new member does — otherwise the operator moves the link to an account
    // that can never hold the role and nothing says so. An unchanged id is not
    // re-checked: someone who left Discord should still be editable, and their
    // role calls simply fail into a warning below.
    let membershipWarning: string | undefined;
    if (nextDiscordId && nextDiscordId !== previousDiscordId) {
      const membership = await checkGuildMembership(
        nextDiscordId,
        current.username,
        "gespeichert",
      );
      if (!membership.ok)
        return NextResponse.json(
          { error: membership.message },
          { status: 400 },
        );
      membershipWarning = membership.warning;
    }

    await pocketIdFetch(`/api/users/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        username: current.username,
        email,
        emailVerified: current.emailVerified ?? true,
        displayName,
        disabled,
        isAdmin: current.isAdmin ?? false,
      }),
    });

    // 2) Group membership.
    if (newGroupIds) {
      await pocketIdFetch(`/api/users/${id}/user-groups`, {
        method: "PUT",
        body: JSON.stringify({ userGroupIds: newGroupIds }),
      });
    }

    // 3) Custom claims — rebuild Discord/Minecraft while preserving any others.
    if (body.discordId !== undefined || body.minecraftUuid !== undefined) {
      const managed = new Set(["discord-id", "minecraft-uuid"]);
      const claims = (current.customClaims ?? []).filter(
        (c) => !managed.has(c.key.toLowerCase()),
      );
      const minecraftUuid = String(body.minecraftUuid ?? "").trim();
      if (nextDiscordId)
        claims.push({ key: "Discord-id", value: nextDiscordId });
      if (minecraftUuid)
        claims.push({ key: "Minecraft-uuid", value: minecraftUuid });

      await pocketIdFetch(`/api/custom-claims/user/${id}`, {
        method: "PUT",
        body: JSON.stringify(claims),
      });
    }

    // 4) Move the Discord role along with the change. One call covers a rank
    //    switch, a re-linked account, an unlinked account and a (de)activation
    //    — see `syncManagedRole`. It never throws: PocketID is already updated,
    //    so a Discord hiccup is reported rather than left to fail the request
    //    and suggest the edit did not happen.
    const roleWarning = await syncManagedRole(
      { discordId: previousDiscordId, roleId: previousRoleId },
      { discordId: nextDiscordId, roleId: nextRoleId },
      `Team member ${current.username} updated via the OTP dashboard`,
    );

    return NextResponse.json({
      ok: true,
      warning: joinWarnings(membershipWarning, roleWarning),
    });
  } catch (e) {
    return handleError(e);
  }
}

/** LEVEL_DELETE — remove a team member from PocketID. */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const gate = await requirePermission("team", LEVEL_DELETE);
  if (!gate.ok) return gate.response;

  const { id } = await params;
  if (!id)
    return NextResponse.json({ error: "Missing user id" }, { status: 400 });

  try {
    // Read the member's Discord link before the account is gone. Best effort:
    // if PocketID cannot answer this, the deletion still has to go through, so
    // the failure only costs the role removal.
    let discordId = "";
    let roleId = "";
    let username = id;
    let lookupWarning: string | undefined;
    try {
      const [userRes, groups] = await Promise.all([
        pocketIdFetch(`/api/users/${id}`),
        fetchAllPages<UserGroup>("/api/user-groups"),
      ]);
      const user = (await userRes.json()) as PocketUser;
      username = user.username || id;
      discordId = getClaim(user, "Discord-id");
      roleId = roleFor(
        (user.userGroups ?? []).map((g) => g.id),
        new Map(groups.map((g) => [g.id, g])),
        otpGroupIds(groups),
        !!user.disabled,
      );
    } catch (e) {
      console.error("[team route] could not read member before delete:", e);
      lookupWarning =
        "Die Discord-Rolle konnte nicht entzogen werden, weil die Daten des Mitglieds vor dem Löschen nicht mehr gelesen werden konnten. Bitte auf Discord manuell prüfen.";
    }

    // The deletion itself is the operation the operator asked for and must not
    // depend on Discord: it runs first and is the only step allowed to fail the
    // request.
    await pocketIdFetch(`/api/users/${id}`, { method: "DELETE" });

    const roleWarning = await revokeManagedRole(
      { discordId, roleId },
      `Team member ${username} removed via the OTP dashboard`,
    );

    return NextResponse.json({
      ok: true,
      warning: joinWarnings(lookupWarning, roleWarning),
    });
  } catch (e) {
    return handleError(e);
  }
}
