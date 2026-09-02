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
  OTP_TEAM_CLAIM,
  slugifyGroupName,
  PocketIdError,
  type CustomClaim,
  type UserGroup,
} from "@/lib/pocketid";
import {
  GROUP_CREATOR_CLAIM_KEY,
  GROUP_CREATOR_CLAIM_VALUE,
  GROUP_DISCORD_ROLE_CLAIM_KEY,
  clearCreatorMarkOnOtherGroups,
  joinWarnings,
  normalizeSnowflake,
} from "@/lib/discord-sync";

function handleError(e: unknown) {
  if (e instanceof PocketIdError)
    return NextResponse.json(
      { error: e.message, detail: e.body },
      { status: e.status >= 400 ? e.status : 500 },
    );
  const msg = e instanceof Error ? e.message : String(e);
  console.error("[team groups route]", e);
  return NextResponse.json({ error: msg }, { status: 500 });
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
/** POST — create a new OTP-team group (marked with the `Team=OTP` claim). */
export async function POST(req: NextRequest) {
  const gate = await requirePermission("team", LEVEL_WRITE);
  if (!gate.ok) return gate.response;

  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    const prefix = String(body.prefix ?? "").trim();
    const weight = String(body.weight ?? "").trim();
    const rawRoleId = String(body.discordRoleId ?? "").trim();
    const isCreatorRank = body.isCreatorRank === true;
    // Per-area dashboard levels. `coercePermissions` is fail-closed, so a body
    // that omits `permissions`, or sends a level outside 1–3, creates a group
    // that grants nothing rather than one that guesses.
    const permissions = coercePermissions(body.permissions);

    if (!name)
      return NextResponse.json(
        { error: "Name ist erforderlich." },
        { status: 400 },
      );

    // An unassignable role id is worth catching here: it would be stored
    // happily and only fail much later, on the first member of this rank.
    const discordRoleId = rawRoleId ? normalizeSnowflake(rawRoleId) : "";
    if (discordRoleId === null)
      return NextResponse.json(
        {
          error:
            "Ungültige Discord-Rollen-ID. Erwartet werden 17–20 Ziffern (Developer Mode in Discord aktivieren, dann Rechtsklick auf die Rolle → „ID kopieren“).",
        },
        { status: 400 },
      );

    // 1) Create the group. `name` is the technical slug, `friendlyName` the
    //    display label the user typed.
    const res = await pocketIdFetch("/api/user-groups", {
      method: "POST",
      body: JSON.stringify({
        name: slugifyGroupName(name),
        friendlyName: name,
      }),
    });
    const created = (await res.json()) as UserGroup;

    // 2) Mark it as an OTP group and attach the prefix / weight / Discord
    //    claims. `Discord-role-id` names the role members of this rank get;
    //    `Creator=true` marks the rank whose role every creator receives.
    const claims: CustomClaim[] = [OTP_TEAM_CLAIM];
    if (prefix) claims.push({ key: "prefix", value: prefix });
    if (weight) claims.push({ key: "weight", value: weight });
    if (discordRoleId)
      claims.push({ key: GROUP_DISCORD_ROLE_CLAIM_KEY, value: discordRoleId });
    if (isCreatorRank)
      claims.push({
        key: GROUP_CREATOR_CLAIM_KEY,
        value: GROUP_CREATOR_CLAIM_VALUE,
      });
    // Only levels above 0 become claims — "kein Zugriff" is the absence of the
    // claim, see `permissionClaims()`.
    claims.push(...permissionClaims(permissions));

    let claimsWarning: string | undefined;
    let exclusivityWarning: string | null = null;
    if (created?.id) {
      try {
        await pocketIdFetch(`/api/custom-claims/user-group/${created.id}`, {
          method: "PUT",
          body: JSON.stringify(claims),
        });

        // 3) Keep the creator marker exclusive — exactly one rank may carry it.
        if (isCreatorRank) {
          const groups = await fetchAllPages<UserGroup>("/api/user-groups");
          exclusivityWarning = await clearCreatorMarkOnOtherGroups(
            groups,
            created.id,
          );
        }
      } catch (e) {
        claimsWarning =
          e instanceof PocketIdError
            ? `Gruppe angelegt, aber Claims fehlgeschlagen: ${e.body || e.message}`
            : `Gruppe angelegt, aber Claims fehlgeschlagen: ${String(e)}`;
      }
    }

    return NextResponse.json(
      {
        data: created,
        warning: joinWarnings(claimsWarning, exclusivityWarning),
      },
      { status: 201 },
    );
  } catch (e) {
    return handleError(e);
  }
}
