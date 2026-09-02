import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/authz";
import {
  LEVEL_WRITE,
  coercePermissions,
  permissionClaims,
} from "@/lib/permissions";
import {
  pocketIdFetch,
  fetchAllPages,
  isOtpGroup,
  OTP_TEAM_CLAIM,
  PocketIdError,
  type CustomClaim,
  type UserGroup,
} from "@/lib/pocketid";
import {
  GROUP_CREATOR_CLAIM_KEY,
  GROUP_CREATOR_CLAIM_VALUE,
  GROUP_DISCORD_ROLE_CLAIM_KEY,
  MANAGED_GROUP_CLAIM_KEYS,
  clearCreatorMarkOnOtherGroups,
  normalizeSnowflake,
} from "@/lib/discord-sync";

function handleError(e: unknown) {
  if (e instanceof PocketIdError)
    return NextResponse.json(
      { error: e.message, detail: e.body },
      { status: e.status >= 400 ? e.status : 500 },
    );
  return NextResponse.json({ error: String(e) }, { status: 500 });
}

/*
 * ACCEPTED RISK, stated here because this is where it happens: the routes in
 * this folder write the `Permission-*` claims that decide dashboard rights, and
 * they are themselves gated on `team` >= LEVEL_WRITE. Somebody who may edit ranks can
 * therefore give their own rank every right, including `team` 3. That is by
 * design — administering ranks is administering the team, and the same person
 * can do it directly in Pocket ID anyway — so `team` >= 2 must be handed out as
 * "team administrator", not as "may tidy up the rank list". See the note in
 * `src/lib/permissions.ts` and the README.
 */
/**
 * PUT — update an existing OTP-team group's name, prefix, weight and Discord
 * role mapping.
 *
 * Note that changing the role mapping does not re-stamp the members who already
 * hold the old role: that would fan one edit out into an unbounded number of
 * Discord calls inside a single dashboard request. Members pick up a remapped
 * rank the next time they are saved (or created), which is also when the
 * dashboard can report a per-member failure to the operator.
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const gate = await requirePermission("team", LEVEL_WRITE);
  if (!gate.ok) return gate.response;

  const { id } = await params;
  if (!id)
    return NextResponse.json({ error: "Missing group id" }, { status: 400 });

  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    const prefix = String(body.prefix ?? "").trim();
    const weight = String(body.weight ?? "").trim();
    const rawRoleId = String(body.discordRoleId ?? "").trim();
    const isCreatorRank = body.isCreatorRank === true;
    const permissions = coercePermissions(body.permissions);

    if (!name)
      return NextResponse.json(
        { error: "Name ist erforderlich." },
        { status: 400 },
      );

    const discordRoleId = rawRoleId ? normalizeSnowflake(rawRoleId) : "";
    if (discordRoleId === null)
      return NextResponse.json(
        {
          error:
            "Ungültige Discord-Rollen-ID. Erwartet werden 17–20 Ziffern (Developer Mode in Discord aktivieren, dann Rechtsklick auf die Rolle → „ID kopieren“).",
        },
        { status: 400 },
      );

    // Load the current group and confirm it is an OTP-team group.
    const groupRes = await pocketIdFetch(`/api/user-groups/${id}`);
    const current = (await groupRes.json()) as UserGroup;
    if (!isOtpGroup(current))
      return NextResponse.json({ error: "Keine OTP-Gruppe." }, { status: 403 });

    // 1) Update the display name (the technical `name` slug stays stable).
    await pocketIdFetch(`/api/user-groups/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        name: current.name,
        friendlyName: name,
      }),
    });

    // 2) Rebuild claims: keep any unrelated claims, replace the ones this
    //    editor owns with the submitted values. Cleared fields are simply not
    //    re-added, which is how a role mapping or the creator marker is removed.
    const claims: CustomClaim[] = (current.customClaims ?? []).filter(
      (c) => !MANAGED_GROUP_CLAIM_KEYS.has(c.key.toLowerCase()),
    );
    claims.push(OTP_TEAM_CLAIM);
    if (prefix) claims.push({ key: "prefix", value: prefix });
    if (weight) claims.push({ key: "weight", value: weight });
    if (discordRoleId)
      claims.push({ key: GROUP_DISCORD_ROLE_CLAIM_KEY, value: discordRoleId });
    if (isCreatorRank)
      claims.push({
        key: GROUP_CREATOR_CLAIM_KEY,
        value: GROUP_CREATOR_CLAIM_VALUE,
      });
    claims.push(...permissionClaims(permissions));

    await pocketIdFetch(`/api/custom-claims/user-group/${id}`, {
      method: "PUT",
      body: JSON.stringify(claims),
    });

    // 3) Keep the creator marker exclusive — exactly one rank may carry it.
    let warning: string | null = null;
    if (isCreatorRank) {
      const groups = await fetchAllPages<UserGroup>("/api/user-groups");
      warning = await clearCreatorMarkOnOtherGroups(groups, id);
    }

    return NextResponse.json({ ok: true, warning: warning ?? undefined });
  } catch (e) {
    return handleError(e);
  }
}
