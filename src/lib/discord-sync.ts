/**
 * Glue between the PocketID rank model and the Discord role model.
 *
 * `src/lib/discord.ts` knows how to talk to Discord and `src/lib/pocketid.ts`
 * knows what a rank is; neither knows which Discord role belongs to which rank.
 * That mapping lives here, together with the two rules every dashboard route
 * has to follow when it writes:
 *
 *  1. **Ask before you create.** A Discord id that is not on the server can
 *     never receive a role, so the membership check happens BEFORE the record
 *     is written — see {@link checkGuildMembership}.
 *  2. **Never let Discord break bookkeeping.** Once the record exists, a failed
 *     role change is reported, not thrown — see {@link syncManagedRole}. The
 *     Discord side is a projection of the PocketID/database side, and a
 *     projection that fails must not take the source of truth down with it.
 *
 * ## The mapping itself
 *
 * It is stored as custom claims on the PocketID *group*, next to the existing
 * `Team`, `prefix` and `weight` claims, so a rank stays a single object an
 * operator edits in one place:
 *
 *  - `Discord-role-id` — the Discord role handed to members of that rank.
 *  - `Creator` = `true` — marks the one rank that is the *creator* rank. Its
 *    `Discord-role-id` is the role every creator on `/dashboard/creators`
 *    receives, which is why creators need no separate role configuration.
 *
 * Both are optional. A rank without `Discord-role-id` is simply not represented
 * on Discord, and with no rank marked `Creator` the creator sync is inactive —
 * neither is an error, because the whole integration is optional (see
 * {@link isDiscordConfigured}).
 *
 * This module is server-only: everything it touches needs the bot token.
 */

import {
  DiscordError,
  addMemberRole,
  getGuildMember,
  isDiscordConfigured,
  removeMemberRole,
  switchMemberRole,
} from "@/lib/discord";
import {
  fetchAllPages,
  isOtpGroup,
  pocketIdFetch,
  readClaim,
  groupWeight,
  type CustomClaim,
  type UserGroup,
} from "@/lib/pocketid";
import { PERMISSION_CLAIM_KEYS } from "@/lib/permissions";

/* -------------------------------------------------------------------------- */
/*  Claim keys                                                                */
/* -------------------------------------------------------------------------- */

/** Group claim naming the Discord role that belongs to a rank. */
export const GROUP_DISCORD_ROLE_CLAIM_KEY = "Discord-role-id";

/** Group claim marking the rank whose role creators receive. */
export const GROUP_CREATOR_CLAIM_KEY = "Creator";

/** The only value {@link GROUP_CREATOR_CLAIM_KEY} is written with. */
export const GROUP_CREATOR_CLAIM_VALUE = "true";

/**
 * Claim keys this project rebuilds when it saves a group, lower-cased for the
 * case-insensitive comparison the rest of the code uses. A route that writes
 * group claims drops these and re-adds the ones it was given, so a cleared
 * field actually disappears instead of surviving as a stale claim; anything not
 * listed here is preserved untouched.
 */
export const MANAGED_GROUP_CLAIM_KEYS = new Set([
  "team",
  "prefix",
  "weight",
  GROUP_DISCORD_ROLE_CLAIM_KEY.toLowerCase(),
  GROUP_CREATOR_CLAIM_KEY.toLowerCase(),
  // The four `Permission-<area>` claims (see `src/lib/permissions.ts`). They
  // have nothing to do with Discord, but this set is the single registry of
  // "claims the group editor owns and rebuilds", and an area set back to "kein
  // Zugriff" has to actually lose its claim rather than keep a stale level.
  ...PERMISSION_CLAIM_KEYS,
]);

/* -------------------------------------------------------------------------- */
/*  Reading the mapping off a group                                           */
/* -------------------------------------------------------------------------- */

/**
 * Accept a Discord snowflake (role or user id) and return it unchanged, or
 * `null` when it is not one. Snowflakes are 17–20 digit decimals kept as
 * strings, because their 64-bit value does not survive a JavaScript number.
 * Mirrors `normalizeDiscordId` in `lib/creators.ts` for the role side.
 */
export function normalizeSnowflake(input: unknown): string | null {
  const raw = String(input ?? "").trim();
  return /^\d{17,20}$/.test(raw) ? raw : null;
}

/** The Discord role id mapped to a group, or `""` when the rank has none. */
export function groupRoleId(group: UserGroup | undefined): string {
  return readClaim(group?.customClaims, GROUP_DISCORD_ROLE_CLAIM_KEY).trim();
}

/** True when a group carries the `Creator=true` claim. */
export function isCreatorGroup(group: UserGroup | undefined): boolean {
  return (
    readClaim(group?.customClaims, GROUP_CREATOR_CLAIM_KEY)
      .trim()
      .toLowerCase() === GROUP_CREATOR_CLAIM_VALUE
  );
}

/**
 * Rank order: heavier `weight` first, ties broken by group id.
 *
 * The weight part matches how the public team page and `getPublicTeamMembers()`
 * pick a member's primary rank, so the Discord role a member gets is the rank
 * the website shows them with. The id tie-break exists purely so the result is
 * deterministic — without it, two equally weighted ranks would resolve
 * differently depending on the order PocketID happened to return them in.
 */
function byRank(a: UserGroup, b: UserGroup): number {
  const delta = groupWeight(b) - groupWeight(a);
  return delta !== 0 ? delta : a.id.localeCompare(b.id);
}

/**
 * The single Discord role a team member should hold, derived from every OTP
 * group they belong to.
 *
 * A member can be in several ranks, but on Discord they get exactly one managed
 * role: the one of their highest-weight rank *that has a role mapped*. Skipping
 * unmapped ranks (rather than giving up as soon as the very top rank has none)
 * is what makes a partial rollout work — the operator maps one rank at a time
 * and each mapped rank takes effect immediately, instead of every member of a
 * still-unmapped top rank silently losing their lower rank's role.
 *
 * Holding one role rather than one per rank keeps the member list on Discord
 * readable and lets a rank change be a single hand-over
 * (see {@link syncManagedRole}).
 *
 * @param memberGroups the member's groups, resolved to their full definitions.
 * @returns the role id, or `""` when none of the member's ranks maps to one.
 */
export function managedRoleIdFor(memberGroups: UserGroup[]): string {
  const mapped = memberGroups.filter((g) => groupRoleId(g));
  if (mapped.length === 0) return "";
  return groupRoleId(mapped.slice().sort(byRank)[0]);
}

/**
 * The rank marked as the creator rank, or `null` when none is.
 *
 * The dashboard keeps the marker exclusive (saving a group as the creator rank
 * clears it everywhere else), but nothing stops a second one from being set
 * directly in PocketID. Rather than failing on that, this resolves it the same
 * way {@link managedRoleIdFor} resolves a member's rank — highest weight wins,
 * ties broken by group id — so the outcome is at least deterministic and
 * matches what the group panel highlights.
 */
export function resolveCreatorGroup(groups: UserGroup[]): UserGroup | null {
  const marked = groups.filter((g) => isOtpGroup(g) && isCreatorGroup(g));
  return marked.length > 0 ? marked.slice().sort(byRank)[0] : null;
}

/** What {@link resolveCreatorRole} found, plus why it found nothing. */
export interface CreatorRoleLookup {
  /** The role every creator receives, or `""` when the sync is not set up. */
  roleId: string;
  /** Name of the rank marked as the creator rank, for messages. */
  rankName: string | null;
  /**
   * Set when no role could be resolved for a reason the operator can fix. It is
   * deliberately a warning and never an error: a creator without a Discord role
   * is a perfectly valid creator, so nothing about the creator dashboard may
   * hinge on this succeeding.
   */
  notice?: string;
}

/**
 * Look up the Discord role that creators receive.
 *
 * Creators have no rank of their own — they borrow one of the team ranks, the
 * one marked `Creator=true` — so this reads the group catalogue from PocketID
 * on every call. That couples the creator dashboard to PocketID for exactly one
 * value, which is why every failure below degrades to "no role, here is why"
 * instead of propagating.
 */
export async function resolveCreatorRole(): Promise<CreatorRoleLookup> {
  if (!isDiscordConfigured()) return { roleId: "", rankName: null };

  let groups: UserGroup[];
  try {
    groups = await fetchAllPages<UserGroup>("/api/user-groups");
  } catch (e) {
    console.error("[discord-sync] could not read the group catalogue:", e);
    return {
      roleId: "",
      rankName: null,
      notice: `Der Creator-Rang konnte nicht aus PocketID gelesen werden, die Discord-Rolle wurde nicht angepasst: ${describe(e)}`,
    };
  }

  const group = resolveCreatorGroup(groups);
  if (!group)
    return {
      roleId: "",
      rankName: null,
      notice:
        "Kein Rang ist als Creator-Rang markiert, deshalb wurde keine Discord-Rolle vergeben. Unter Team → Gruppen einen Rang bearbeiten und dort „Creator-Rang“ setzen.",
    };

  const rankName = group.friendlyName || group.name;
  const roleId = groupRoleId(group);
  if (!roleId)
    return {
      roleId: "",
      rankName,
      notice: `Der Creator-Rang „${rankName}“ hat keine Discord-Rolle hinterlegt, deshalb wurde keine Rolle vergeben. Unter Team → Gruppen bei diesem Rang eine Discord-Rolle auswählen.`,
    };

  return { roleId, rankName };
}

/**
 * Strip the `Creator` marker from every OTP group except `keepGroupId`.
 *
 * This is what makes "exactly one creator rank" true rather than merely
 * intended: the rank editor sets the marker, this clears it everywhere else, so
 * two ranks can never both claim it through the dashboard. It runs after the
 * new marker is written, because a crash between the two steps should leave two
 * marked ranks (which {@link resolveCreatorGroup} resolves deterministically)
 * rather than none (which would silently stop the creator sync).
 *
 * The PocketID write lives here, next to the claim it maintains, so a route
 * only has to say "make this one exclusive".
 *
 * @returns a warning when a group could not be cleared, `null` otherwise.
 */
export async function clearCreatorMarkOnOtherGroups(
  groups: UserGroup[],
  keepGroupId: string,
): Promise<string | null> {
  const stale = groups.filter(
    (g) => g.id !== keepGroupId && isOtpGroup(g) && isCreatorGroup(g),
  );
  if (stale.length === 0) return null;

  const failed: string[] = [];
  for (const group of stale) {
    const claims: CustomClaim[] = (group.customClaims ?? []).filter(
      (c) => c.key.toLowerCase() !== GROUP_CREATOR_CLAIM_KEY.toLowerCase(),
    );
    try {
      await pocketIdFetch(`/api/custom-claims/user-group/${group.id}`, {
        method: "PUT",
        body: JSON.stringify(claims),
      });
    } catch (e) {
      console.error(
        `[discord-sync] could not clear the creator marker on group ${group.id}:`,
        e,
      );
      failed.push(group.friendlyName || group.name);
    }
  }

  if (failed.length === 0) return null;
  return `Der Creator-Rang konnte bei folgenden Rängen nicht entfernt werden: ${failed.join(", ")}. Bitte dort manuell prüfen.`;
}

/* -------------------------------------------------------------------------- */
/*  Membership check                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Outcome of {@link checkGuildMembership}.
 *
 * `ok: false` is reserved for the one case the caller must refuse on: Discord
 * answered, and the account is not on the server. Everything else — no bot
 * configured, Discord unreachable, a bad token — is `ok: true` with a warning,
 * because none of it proves the person is absent and none of it should stop an
 * operator from managing the team.
 */
export type MembershipCheck =
  { ok: true; warning?: string } | { ok: false; message: string };

/**
 * Verify that a Discord account is on the configured server before a record
 * referencing it is written.
 *
 * @param discordId a snowflake, already validated by the caller.
 * @param subject   how to name the record in the refusal, e.g. `"Notch"`.
 * @param action    past participle completing „… konnte nicht … werden“.
 */
export async function checkGuildMembership(
  discordId: string,
  subject: string,
  action: "angelegt" | "gespeichert" = "angelegt",
): Promise<MembershipCheck> {
  if (!isDiscordConfigured()) return { ok: true };

  try {
    const member = await getGuildMember(discordId);
    if (member) return { ok: true };
    return {
      ok: false,
      message: `„${subject}“ konnte nicht ${action} werden, weil der Discord-Account ${discordId} nicht auf dem OTP-Discord ist. Die Person muss dem Server zuerst beitreten — oder die eingetragene Discord-ID ist falsch.`,
    };
  } catch (e) {
    // Discord could not answer. That is not evidence of absence, so the write
    // goes ahead and the operator is told the role sync did not run.
    console.error("[discord-sync] membership check failed:", e);
    return {
      ok: true,
      warning: `Discord-Mitgliedschaft konnte nicht geprüft werden, die Rolle wurde nicht gesetzt: ${describe(e)}`,
    };
  }
}

/* -------------------------------------------------------------------------- */
/*  Role synchronisation                                                      */
/* -------------------------------------------------------------------------- */

/** One side of a role sync: which account holds which managed role. */
export interface RoleState {
  /** Discord user id, or `null`/`""` when no account is linked. */
  discordId: string | null | undefined;
  /** Managed role id, or `null`/`""` when the rank maps to none. */
  roleId: string | null | undefined;
}

function describe(e: unknown): string {
  if (e instanceof DiscordError) return e.message;
  return e instanceof Error ? e.message : String(e);
}

/** Run one role call, turning a failure into a collected warning. */
async function attempt(
  op: () => Promise<void>,
  warnings: string[],
): Promise<void> {
  try {
    await op();
  } catch (e) {
    console.error("[discord-sync] role change failed:", e);
    warnings.push(describe(e));
  }
}

/**
 * Bring Discord in line with a record that has just been written.
 *
 * Handles all four transitions with the same call:
 *
 *  - **nothing → role**: the role is granted.
 *  - **role → other role, same account**: handed over with
 *    {@link switchMemberRole}, which grants the new role before dropping the
 *    old one, so an interrupted hand-over leaves the member over- rather than
 *    under-privileged.
 *  - **account A → account B**: B is granted first, then A is revoked. Same
 *    reasoning, and it keeps a failed grant from stripping the person who is
 *    still the rightful holder.
 *  - **role → nothing** (rank unmapped, account unlinked, member deleted): the
 *    role is revoked.
 *
 * Never throws. The record is already persisted by the time this runs, so a
 * Discord failure can only be reported, never undone by unwinding the caller.
 *
 * @returns a warning describing every failed step, or `null` when everything
 *   worked (including "there was nothing to do" and "no bot configured").
 */
export async function syncManagedRole(
  previous: RoleState,
  next: RoleState,
  reason: string,
): Promise<string | null> {
  if (!isDiscordConfigured()) return null;

  const prevId = previous.discordId || null;
  const prevRole = previous.roleId || null;
  const nextId = next.discordId || null;
  const nextRole = next.roleId || null;

  const warnings: string[] = [];

  if (prevId && prevId === nextId) {
    // Same account, so the two halves belong to one member and can be handed
    // over. `switchMemberRole` no-ops when both ids are equal.
    if (prevRole !== nextRole) {
      await attempt(
        () => switchMemberRole(prevId, prevRole, nextRole, reason),
        warnings,
      );
    }
  } else {
    if (nextId && nextRole) {
      await attempt(() => addMemberRole(nextId, nextRole, reason), warnings);
    }
    if (prevId && prevRole) {
      await attempt(() => removeMemberRole(prevId, prevRole, reason), warnings);
    }
  }

  if (warnings.length === 0) return null;
  return `Discord-Rollensync fehlgeschlagen: ${warnings.join(" | ")}`;
}

/**
 * Revoke a managed role, for the delete paths.
 *
 * A thin wrapper over {@link syncManagedRole} that exists so a delete handler
 * reads as "revoke this" instead of "sync to nothing", and so the intent stays
 * obvious next to the comment explaining why the deletion itself must not
 * depend on the outcome.
 */
export async function revokeManagedRole(
  state: RoleState,
  reason: string,
): Promise<string | null> {
  return syncManagedRole(state, { discordId: null, roleId: null }, reason);
}

/** Join a create/update handler's warnings into one message, or `undefined`. */
export function joinWarnings(
  ...parts: (string | null | undefined)[]
): string | undefined {
  const kept = parts.filter((p): p is string => Boolean(p));
  return kept.length > 0 ? kept.join(" ") : undefined;
}
