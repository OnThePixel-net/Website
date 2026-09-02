import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/authz";
import {
  LEVEL_READ,
  LEVEL_WRITE,
  permissionsFromClaims,
} from "@/lib/permissions";
import {
  pocketIdFetch,
  fetchAllPages,
  otpGroupIds,
  isOtpMember,
  getClaim,
  readClaim,
  PocketIdError,
  type PocketUser,
  type UserGroup,
} from "@/lib/pocketid";
import { isDiscordConfigured } from "@/lib/discord";
import {
  checkGuildMembership,
  groupRoleId,
  isCreatorGroup,
  joinWarnings,
  managedRoleIdFor,
  normalizeSnowflake,
  syncManagedRole,
} from "@/lib/discord-sync";

function handleError(e: unknown) {
  if (e instanceof PocketIdError) {
    return NextResponse.json(
      { error: e.message, detail: e.body },
      { status: e.status >= 400 ? e.status : 500 },
    );
  }
  const msg = e instanceof Error ? e.message : String(e);
  console.error("[team route]", e);
  return NextResponse.json({ error: msg }, { status: 500 });
}

/** GET — list OTP team members and the available OTP groups. */
export async function GET() {
  const gate = await requirePermission("team", LEVEL_READ);
  if (!gate.ok) return gate.response;

  try {
    const [groups, users] = await Promise.all([
      fetchAllPages<UserGroup>("/api/user-groups"),
      fetchAllPages<PocketUser>("/api/users"),
    ]);

    const otpIds = otpGroupIds(groups);
    const otpGroups = groups
      .filter((g) => otpIds.has(g.id))
      .map((g) => ({
        id: g.id,
        name: g.name,
        friendlyName: g.friendlyName,
        prefix: readClaim(g.customClaims, "prefix"),
        weight: readClaim(g.customClaims, "weight"),
        discordRoleId: groupRoleId(g),
        isCreatorRank: isCreatorGroup(g),
        // What members of this rank may do in the dashboard, per area. Sent
        // even when every level is 0 so the rank editor always has a complete
        // set to render its four selects from.
        permissions: permissionsFromClaims(g.customClaims),
      }));

    const members = users
      .filter((u) => isOtpMember(u, otpIds))
      .map((u) => ({
        id: u.id,
        username: u.username,
        displayName: u.displayName ?? u.username,
        email: u.email ?? "",
        disabled: !!u.disabled,
        discordId: getClaim(u, "Discord-id"),
        minecraftUuid: getClaim(u, "Minecraft-uuid"),
        groups: (u.userGroups ?? [])
          .filter((g) => otpIds.has(g.id))
          .map((g) => ({ id: g.id, friendlyName: g.friendlyName ?? g.name })),
      }));

    // Whether the Discord bot is set up at all. Read from the environment, so
    // it costs no upstream request — the dashboard uses it to say plainly that
    // the role sync is inactive instead of leaving the operator to guess why
    // nothing happens on Discord.
    return NextResponse.json({
      users: members,
      groups: otpGroups,
      discord: { configured: isDiscordConfigured() },
    });
  } catch (e) {
    return handleError(e);
  }
}

/** POST — create a new team member via the admin API, then set custom claims. */
export async function POST(req: NextRequest) {
  const gate = await requirePermission("team", LEVEL_WRITE);
  if (!gate.ok) return gate.response;

  try {
    const body = await req.json();
    const username = String(body.username ?? "").trim();
    const groupId = String(body.groupId ?? "").trim();
    const rawDiscordId = String(body.discordId ?? "").trim();
    const minecraftUuid = String(body.minecraftUuid ?? "").trim();
    const email =
      String(body.email ?? "").trim() ||
      `${username.toLowerCase()}@onthepixel.net`;

    if (!username)
      return NextResponse.json(
        { error: "Username ist erforderlich." },
        { status: 400 },
      );
    if (!groupId)
      return NextResponse.json(
        { error: "Eine Gruppe muss ausgewählt werden." },
        { status: 400 },
      );

    const discordId = rawDiscordId ? normalizeSnowflake(rawDiscordId) : "";
    if (discordId === null)
      return NextResponse.json(
        {
          error:
            "Ungültige Discord-ID. Erwartet werden 17–20 Ziffern (Developer Mode in Discord aktivieren, dann Rechtsklick auf den Account → „ID kopieren“).",
        },
        { status: 400 },
      );

    // Ensure the chosen group is actually an OTP-team group.
    const groups = await fetchAllPages<UserGroup>("/api/user-groups");
    const otpIds = otpGroupIds(groups);
    if (!otpIds.has(groupId))
      return NextResponse.json(
        { error: "Ungültige Gruppe (keine OTP-Gruppe)." },
        { status: 400 },
      );

    // 0) Ask Discord BEFORE anything is written. A user id that is not on the
    //    server can never receive a role, and a half-created member whose role
    //    silently never arrives is exactly the situation this check exists to
    //    prevent — so this refuses and creates nothing. Only a definitive "not
    //    a member" refuses; an unreachable Discord returns a warning instead
    //    and lets the account be created (see `checkGuildMembership`).
    let membershipWarning: string | undefined;
    if (discordId) {
      const membership = await checkGuildMembership(discordId, username);
      if (!membership.ok)
        return NextResponse.json(
          { error: membership.message },
          { status: 400 },
        );
      membershipWarning = membership.warning;
    }

    // 1) Create the user account via the admin endpoint. `/api/signup` is the
    //    public self-registration route and is rejected with "Open user signup
    //    is not enabled" when that toggle is off — admins create accounts
    //    through `/api/users` (authenticated with the API key) instead. The
    //    body mirrors the update route's shape; group membership is assigned
    //    separately below.
    const createRes = await pocketIdFetch("/api/users", {
      method: "POST",
      body: JSON.stringify({
        username,
        email,
        emailVerified: true,
        displayName: username,
        disabled: false,
        isAdmin: false,
      }),
    });
    const created = (await createRes.json()) as PocketUser;

    // 2) Assign the chosen OTP group (same endpoint the update route uses).
    if (created?.id) {
      await pocketIdFetch(`/api/users/${created.id}/user-groups`, {
        method: "PUT",
        body: JSON.stringify({ userGroupIds: [groupId] }),
      });
    }

    // 3) Set the Discord / Minecraft custom claims on the new user.
    const claims = [
      { key: "Discord-id", value: discordId },
      { key: "Minecraft-uuid", value: minecraftUuid },
    ].filter((c) => c.value);

    let claimsWarning: string | undefined;
    if (created?.id && claims.length > 0) {
      try {
        await pocketIdFetch(`/api/custom-claims/user/${created.id}`, {
          method: "PUT",
          body: JSON.stringify(claims),
        });
      } catch (e) {
        claimsWarning =
          e instanceof PocketIdError
            ? `Nutzer angelegt, aber Custom Claims fehlgeschlagen: ${e.body || e.message}`
            : `Nutzer angelegt, aber Custom Claims fehlgeschlagen: ${String(e)}`;
      }
    }

    // 4) Hand out the rank's Discord role. The account exists in PocketID by
    //    now, so a failure here is reported, not rolled back: deleting a fresh
    //    Pocket ID account to undo a role that Discord refused would trade a
    //    missing role for a destroyed identity, and the two most likely causes
    //    (role hierarchy, missing permission) are fixed on the Discord side and
    //    then applied by simply saving the member again.
    const chosenGroup = groups.find((g) => g.id === groupId);
    const roleWarning = await syncManagedRole(
      { discordId: null, roleId: null },
      { discordId, roleId: managedRoleIdFor(chosenGroup ? [chosenGroup] : []) },
      `Team member ${username} created via the OTP dashboard`,
    );

    return NextResponse.json(
      {
        data: created,
        warning: joinWarnings(membershipWarning, claimsWarning, roleWarning),
      },
      { status: 201 },
    );
  } catch (e) {
    return handleError(e);
  }
}
