/**
 * Server-side authorisation for the admin dashboard.
 *
 * Before this module existed, the dashboard only ever checked *that* somebody
 * was signed in, never *who*: every route under `/api/dashboard/**` carried its
 * own `checkAuth()` doing `!!(await auth())`, and the only real gate lived in a
 * client component that merely hid the UI. Any Discord account could therefore
 * create, edit and delete news, creators, apply positions and — through the
 * PocketID admin API — team accounts by talking to the routes directly. This
 * module holds the decision that closes that hole; `src/lib/authz.ts` enforces
 * it in the route handlers and `AdminPageGuard` in the dashboard pages.
 *
 * ── The model ─────────────────────────────────────────────────────────────
 * Pocket ID is the single source of truth. Whichever provider somebody signs
 * in with, the account is resolved to a Pocket ID user, and only groups
 * carrying the `Team=OTP` custom claim — the same definition the team dashboard
 * and the public `/team` page already use — can grant anything. There is no
 * second, hand-maintained list of admins to keep in sync with the team roster.
 *
 *   - `oidc` (Pocket ID itself): resolved through the `sub` claim, with email
 *     and username fallbacks (see {@link matchPocketUser}).
 *   - `discord`: resolved through the `Discord-id` custom claim that the team
 *     dashboard writes onto every Pocket ID user it creates
 *     (`src/app/api/dashboard/team/route.ts`).
 *
 * The account's highest-weight OTP group also travels along as its
 * {@link SessionRole}, so the UI can show the real rank.
 *
 * WHAT an account may do is a second question, answered per dashboard area
 * rather than once for everything: each OTP group carries four
 * `Permission-<area>` custom claims (see `src/lib/permissions.ts`), and a user
 * in several groups gets the highest level of each area. Dashboard access is
 * then simply "at least one area above 0" — an OTP group that carries no
 * permission claims grants nothing, which is deliberately also what every
 * group looks like the minute this feature is deployed.
 *
 * ── When the decision is made ─────────────────────────────────────────────
 * Once at sign-in, then re-checked at most every
 * {@link ADMIN_RECHECK_INTERVAL_MS} — never per request. The result rides on
 * the JWT (`token.isAdmin`, `token.permissions`, `token.role`; see
 * `src/auth.ts`). Somebody removed from the team, or moved to a group with
 * lower levels, therefore keeps their old rights for at most that window rather
 * than until their session expires, and a healthy dashboard costs no upstream
 * calls. `requirePermission()` in `src/lib/authz.ts` only reads the result.
 *
 * ── Failure behaviour ─────────────────────────────────────────────────────
 * Fail-closed, but never "log everybody out because an API blipped":
 *   - at sign-in, an unreachable Pocket ID means no rights (there is no earlier
 *     decision to fall back on — granting them would be exactly the hole this
 *     module closes);
 *   - during a re-check, an unreachable Pocket ID leaves the previous decision
 *     in place and retries shortly after ({@link ADMIN_RECHECK_BACKOFF_MS}), so
 *     an admin already at work is not thrown out by an upstream hiccup.
 * Every one of those paths logs a line naming what to fix.
 */

import {
  fetchAllPages,
  getClaim,
  groupLabel,
  groupWeight,
  isOtpGroup,
  otpGroupIds,
  prefixColor,
  primaryGroup,
  readClaim,
  type PocketUser,
  type UserGroup,
} from "@/lib/pocketid";
import type { SessionRole } from "@/lib/session-role";
import {
  LEVEL_DELETE,
  hasAnyPermission,
  mergePermissions,
  NO_PERMISSIONS,
  permissionsFromClaims,
  uniformPermissions,
  type PermissionSet,
} from "@/lib/permissions";

/**
 * Provider id of the Pocket ID (generic OIDC) provider registered in
 * `src/auth.ts`. Lives here rather than in `src/auth.ts` so this module stays
 * free of a circular import — `src/auth.ts` imports *this* file, never the
 * other way round. The string is part of the OAuth callback URL
 * (`/api/auth/callback/oidc`) registered at Pocket ID, so it must not change.
 */
export const OIDC_PROVIDER_ID = "oidc";

/** Provider id of the built-in Discord provider (`next-auth/providers/discord`). */
export const DISCORD_PROVIDER_ID = "discord";

/**
 * Key of the Pocket ID custom claim holding a member's Discord id. Written by
 * the team dashboard when a member is created or edited, which is what makes a
 * Discord sign-in resolvable to a Pocket ID account at all. Matching is
 * case-insensitive (`getClaim`), so a hand-typed `discord-id` also works.
 */
const DISCORD_ID_CLAIM = "Discord-id";

/**
 * How long a positive/negative decision is trusted before Pocket ID is asked
 * again. Fifteen minutes is the compromise: short enough that removing someone
 * from the team takes effect within a coffee break rather than at their next
 * sign-in, long enough that a busy dashboard session causes at most four
 * upstream lookups an hour instead of one per request.
 */
export const ADMIN_RECHECK_INTERVAL_MS = 15 * 60 * 1000;

/**
 * Retry delay after a failed re-check. Deliberately much shorter than the
 * normal interval — the previous decision is being trusted longer than it
 * should be, so the outage should be re-probed soon — but not per request,
 * which would hammer a Pocket ID that is already struggling.
 */
export const ADMIN_RECHECK_BACKOFF_MS = 60 * 1000;

/**
 * Emergency access list: email addresses that are let in without asking Pocket
 * ID at all, for EVERY provider.
 *
 * Anyone listed gets the highest level ({@link LEVEL_DELETE}) in EVERY area — the
 * list is the way back in, so it cannot itself depend on a claim somebody has
 * to set first. Right after this feature is deployed no group carries any
 * `Permission-*` claim yet, so this list is the ONLY thing that can still open
 * the dashboard and set those claims. Configure it before deploying.
 *
 * This exists for exactly one situation — Pocket ID is unreachable, or the
 * account cannot be resolved to a Pocket ID user, and the operator would
 * otherwise be locked out of their own dashboard with no way back in. It is
 * NOT the normal way to grant access: in day-to-day operation this variable
 * should be empty and rights should come from `Team: OTP` group membership,
 * because anything listed here bypasses the team roster and survives being
 * removed from the team.
 *
 * Read at call time, not at module load, so a restart with a changed value is
 * enough. Compared lower-cased — a casing mismatch here would be a lockout.
 */
export function emergencyAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

/** Log the "no way back in" warning at most once per process. */
let warnedAboutMissingEmergencyList = false;

/**
 * Point out — once — that no emergency access is configured, at the moment it
 * would have helped: a denial or an upstream failure. Not an error on its own
 * (an empty `ADMIN_EMAILS` is the correct steady state), but the operator has
 * to know it is the difference between a Pocket ID outage being an
 * inconvenience and being a lockout.
 */
export function warnIfNoEmergencyAdmins(): void {
  if (emergencyAdminEmails().length > 0 || warnedAboutMissingEmergencyList) {
    return;
  }
  warnedAboutMissingEmergencyList = true;
  console.warn(
    "[admin-access] Dashboard access was denied and ADMIN_EMAILS is not set, " +
      "so there is no way in that does not depend on Pocket ID. Access " +
      "normally requires membership in a Pocket ID group that carries the " +
      "`Team=OTP` claim AND at least one `Permission-<news|creators|team|" +
      "apply>` claim with a value of 1, 2 or 3 (and a working POCKETID_APIKEY)." +
      " Set ADMIN_EMAILS to a comma-separated list of email addresses — a " +
      "server-side variable, do NOT use a NEXT_PUBLIC_ prefix — to keep an " +
      "emergency way in; those addresses get level 3 everywhere.",
  );
}

/**
 * In-process throttle for upstream re-checks, keyed per account.
 *
 * The authoritative "when is this decision stale" timestamp lives on the JWT.
 * But the `jwt` callback also runs for every `auth()` call inside a route
 * handler, and a token updated there cannot always be written back to the
 * session cookie — so the stale timestamp can survive and make every single
 * request re-ask Pocket ID. This map bounds that to one lookup per account per
 * {@link ADMIN_RECHECK_BACKOFF_MS} per server instance, and also collapses the
 * burst of parallel requests a dashboard page fires on load into one lookup.
 *
 * Per instance, in memory, best-effort: losing it on a restart or having one
 * copy per replica costs an extra lookup, never a wrong decision.
 */
const recheckCooldownUntil = new Map<string, number>();

/** Guard against unbounded growth if a lot of accounts pass through. */
const RECHECK_MAP_LIMIT = 10_000;

/**
 * Try to claim the right to ask Pocket ID about `key` right now. Returns false
 * when somebody asked too recently; on true, the slot is taken immediately so
 * concurrent callers do not all fire.
 */
export function claimRecheckSlot(key: string): boolean {
  const now = Date.now();
  if ((recheckCooldownUntil.get(key) ?? 0) > now) return false;
  if (recheckCooldownUntil.size >= RECHECK_MAP_LIMIT) {
    recheckCooldownUntil.clear();
  }
  recheckCooldownUntil.set(key, now + ADMIN_RECHECK_BACKOFF_MS);
  return true;
}

/** Everything a sign-in can tell us about the account being authorised. */
export interface AdminAccessInput {
  /** `account.provider` of the sign-in (`discord`, `oidc`, …). */
  provider: string;
  /** Discord snowflake — only ever set for the Discord provider. */
  discordId?: string | null;
  /** Email claim, if the provider supplied one. */
  email?: string | null;
  /**
   * OIDC subject identifier (`sub` / `account.providerAccountId`), or — on a
   * re-check — the Pocket ID user id resolved at sign-in.
   */
  subject?: string | null;
  /** `preferred_username` / `username` claim, if the provider supplied one. */
  username?: string | null;
}

/** Outcome of an authorisation attempt. */
export type AdminResolution =
  | {
      /** Pocket ID answered (or the emergency list applied): this is final. */
      status: "decided";
      /** Whether the dashboard may be opened at all — i.e. any area above 0. */
      isAdmin: boolean;
      /** Per-area levels, folded over every OTP group the account is in. */
      permissions: PermissionSet;
      /** The account's highest-weight OTP group, when it has one. */
      role?: SessionRole;
      /** Pocket ID user id, so a later re-check can look the account up directly. */
      pocketUserId?: string;
    }
  | {
      /**
       * Pocket ID could not be asked. The caller decides: deny at sign-in,
       * keep the previous decision on a re-check.
       */
      status: "unavailable";
    };

/** Case-insensitive match against the emergency `ADMIN_EMAILS` list. */
function isEmergencyAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return emergencyAdminEmails().includes(email.trim().toLowerCase());
}

/**
 * Find the Pocket ID account behind an OIDC sign-in.
 *
 * ASSUMPTION, and it cannot be verified from this repository: Pocket ID issues
 * the user's own id as the `sub` claim, so `sub === PocketUser.id`. That is how
 * Pocket ID is documented to behave and how OIDC subjects are normally minted,
 * but there is no Pocket ID instance available here to confirm it against.
 *
 * The match is therefore layered rather than assumed: id first, then the email
 * claim, then the username claim. If Pocket ID ever hands out an opaque,
 * per-client subject, the email/username fallbacks still resolve the account.
 * If none of the three match, the caller is refused rather than let through.
 */
function matchPocketUser(
  users: PocketUser[],
  input: AdminAccessInput,
): PocketUser | undefined {
  if (input.subject) {
    const byId = users.find((u) => u.id === input.subject);
    if (byId) return byId;
  }

  const email = input.email?.trim().toLowerCase();
  if (email) {
    const byEmail = users.find((u) => u.email?.trim().toLowerCase() === email);
    if (byEmail) return byEmail;
  }

  const username = input.username?.trim().toLowerCase();
  if (username) {
    const byUsername = users.find(
      (u) => u.username.trim().toLowerCase() === username,
    );
    if (byUsername) return byUsername;
  }

  return undefined;
}

/**
 * Find the Pocket ID account behind a Discord sign-in, through the
 * `Discord-id` custom claim the team dashboard maintains.
 *
 * This is what makes Pocket ID the single source of truth for both providers:
 * a Discord login is not a separate identity with its own allowlist, it is the
 * same team member arriving through a different door. A member whose claim is
 * unset simply does not resolve — and is refused, with a log line saying so,
 * because the fix is to fill in the Discord id in the team dashboard.
 */
function matchPocketUserByDiscordId(
  users: PocketUser[],
  discordId: string,
): PocketUser | undefined {
  const wanted = discordId.trim();
  if (!wanted) return undefined;
  return users.find((u) => getClaim(u, DISCORD_ID_CLAIM).trim() === wanted);
}

/**
 * The account's primary role: its highest-weight OTP group.
 *
 * Same rule as `getPublicTeamMembers()` in `src/lib/pocketid.ts` and the team
 * dashboard — they share `primaryGroup()`, including the reason for the group
 * lookup: the group objects embedded on a user may omit `customClaims` /
 * `friendlyName`, so each one is resolved back to its full definition before
 * the weights are compared.
 */
function primaryRole(
  user: PocketUser,
  groups: UserGroup[],
  otpIds: Set<string>,
): SessionRole | undefined {
  const groupById = new Map(groups.map((g) => [g.id, g]));

  const memberGroups = (user.userGroups ?? [])
    .filter((g) => otpIds.has(g.id))
    .map((g) => groupById.get(g.id) ?? g);

  const primary = primaryGroup(memberGroups);

  if (!primary) return undefined;

  return {
    id: primary.id,
    friendlyName: groupLabel(primary),
    weight: groupWeight(primary),
    color: prefixColor(readClaim(primary.customClaims, "prefix")),
    teamMember: isOtpGroup(primary),
  };
}

/**
 * Fold the `Permission-*` claims of every OTP group the account is in into one
 * set, taking the highest level per area.
 *
 * Deliberately NOT "the primary group decides": the primary group is the one
 * with the highest `weight`, which is a display rank, not a rights ladder. A
 * member of "Builder" (weight 80) and "Redaktion" (weight 10) is meant to have
 * both sets of rights; letting the heavier group alone decide would silently
 * drop the second one. Taking the maximum also means adding a group can only
 * ever grant rights, never revoke them, which is the behaviour an operator
 * expects when they add somebody to one more rank.
 *
 * Non-OTP groups are ignored entirely, so a permission claim accidentally
 * attached to some unrelated Pocket ID group grants nothing.
 */
function permissionsForUser(
  user: PocketUser,
  groups: UserGroup[],
  otpIds: Set<string>,
): PermissionSet {
  const groupById = new Map(groups.map((g) => [g.id, g]));

  return (
    (user.userGroups ?? [])
      .filter((g) => otpIds.has(g.id))
      // The group objects embedded on a user may omit `customClaims`, so each is
      // resolved back to its full definition before its claims are read.
      .map((g) => groupById.get(g.id) ?? g)
      .reduce<PermissionSet>(
        (acc, group) =>
          mergePermissions(acc, permissionsFromClaims(group.customClaims)),
        NO_PERMISSIONS,
      )
  );
}

/**
 * Decide whether an account may use the admin dashboard, and with which role.
 *
 * Used both for the initial sign-in and for the periodic re-check; the caller
 * (`src/auth.ts`) is what differs between the two, not this function.
 *
 * The development role login never reaches this code: it is decided in
 * `src/auth.ts` straight from the picked role, without env lists and without
 * the network, because there is no Pocket ID instance locally.
 */
export async function resolveAdminAccess(
  input: AdminAccessInput,
): Promise<AdminResolution> {
  // Checked before anything else, and deliberately so: the emergency list has
  // to work precisely when Pocket ID does not.
  if (isEmergencyAdmin(input.email)) {
    console.warn(
      `[admin-access] Granting dashboard access to "${input.email}" through ` +
        "the ADMIN_EMAILS emergency list, bypassing Pocket ID team " +
        "membership. Remove the address from ADMIN_EMAILS once the account " +
        "is in a `Team: OTP` group.",
    );
    // No role: the emergency path deliberately does not consult Pocket ID, so
    // there is no group to derive one from — and, for the same reason, no
    // group claims to read levels from either. Full rights everywhere is the
    // only useful answer: the whole point is to be able to get in and fix the
    // configuration, which includes setting the `Permission-*` claims.
    return {
      status: "decided",
      isAdmin: true,
      permissions: uniformPermissions(LEVEL_DELETE),
    };
  }

  if (
    input.provider !== OIDC_PROVIDER_ID &&
    input.provider !== DISCORD_PROVIDER_ID
  ) {
    // A provider added later has to be given an explicit rule here on purpose;
    // silently inheriting access would be the very bug this module prevents.
    warnIfNoEmergencyAdmins();
    console.warn(
      `[admin-access] Sign-in through provider "${input.provider}" has no ` +
        "authorisation rule — no dashboard access.",
    );
    return { status: "decided", isAdmin: false, permissions: NO_PERMISSIONS };
  }

  let groups: UserGroup[];
  let users: PocketUser[];
  try {
    [groups, users] = await Promise.all([
      fetchAllPages<UserGroup>("/api/user-groups"),
      fetchAllPages<PocketUser>("/api/users"),
    ]);
  } catch (e) {
    // Not a decision — the caller keeps an earlier one if it has one, and
    // refuses if it does not. Loud either way: this is indistinguishable from
    // a real outage and, without ADMIN_EMAILS, locks out the whole team.
    warnIfNoEmergencyAdmins();
    console.error(
      "[admin-access] Could not reach the PocketID admin API to authorise a " +
        `"${input.provider}" sign-in (is POCKETID_APIKEY set?). No new ` +
        "dashboard rights are granted while it is unreachable; ADMIN_EMAILS " +
        "works without Pocket ID and is the way back in.",
      e,
    );
    return { status: "unavailable" };
  }

  const user =
    input.provider === DISCORD_PROVIDER_ID
      ? matchPocketUserByDiscordId(users, input.discordId ?? "")
      : matchPocketUser(users, input);

  if (!user) {
    warnIfNoEmergencyAdmins();
    console.warn(
      input.provider === DISCORD_PROVIDER_ID
        ? `[admin-access] No Pocket ID user carries the ${DISCORD_ID_CLAIM} ` +
            `claim "${input.discordId ?? "?"}" — no dashboard access. If this ` +
            "is a team member, fill in their Discord id in the team dashboard."
        : `[admin-access] Pocket ID sign-in (sub=${input.subject ?? "?"}) ` +
            "could not be resolved to a Pocket ID account by id, email or " +
            "username — no dashboard access.",
    );
    return { status: "decided", isAdmin: false, permissions: NO_PERMISSIONS };
  }

  if (user.disabled) {
    console.warn(
      `[admin-access] Pocket ID account "${user.username}" is disabled — no ` +
        "dashboard access.",
    );
    return {
      status: "decided",
      isAdmin: false,
      permissions: NO_PERMISSIONS,
      pocketUserId: user.id,
    };
  }

  const otpIds = otpGroupIds(groups);
  const role = primaryRole(user, groups, otpIds);
  const permissions = permissionsForUser(user, groups, otpIds);
  // Dashboard access is now the *consequence* of having a level somewhere, not
  // a separate flag: being in a `Team: OTP` group is necessary (only those
  // groups are read) but no longer sufficient — the group also has to grant
  // something. Right after this feature is deployed that is true of no group at
  // all, which is why ADMIN_EMAILS must be set before deploying.
  const isAdmin = hasAnyPermission(permissions);

  if (!isAdmin) {
    warnIfNoEmergencyAdmins();
    console.warn(
      role?.teamMember === true
        ? `[admin-access] Pocket ID account "${user.username}" is in a ` +
            "`Team: OTP` group, but none of its groups carries a " +
            "`Permission-<news|creators|team|apply>` claim with a value of 1, " +
            "2 or 3 — no dashboard access. Set the levels under Team → " +
            "Gruppen (or directly in Pocket ID)."
        : `[admin-access] Pocket ID account "${user.username}" is in no ` +
            "`Team: OTP` group — no dashboard access.",
    );
  }

  return {
    status: "decided",
    isAdmin,
    permissions,
    role,
    pocketUserId: user.id,
  };
}
