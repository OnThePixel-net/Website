/**
 * Per-area permission levels for the admin dashboard.
 *
 * Dashboard rights used to be one boolean: `session.user.isAdmin`, derived from
 * "is a member of a `Team=OTP` group". Everybody who got in could do
 * everything — write news, reorder creators, create and delete Pocket ID
 * accounts. That is wrong for a team where some ranks are meant to write
 * articles but must never touch the team roster.
 *
 * This module replaces the boolean with four independent levels, one per
 * dashboard area, expressed as custom claims on the Pocket ID GROUP — right
 * next to the `Team`, `prefix`, `weight`, `Discord-role-id` and `Creator`
 * claims the group editor already maintains:
 *
 * | Claim                 | Area                       |
 * | --------------------- | -------------------------- |
 * | `Permission-news`     | `/dashboard/news`          |
 * | `Permission-creators` | `/dashboard/creators`      |
 * | `Permission-team`     | `/dashboard/team`          |
 * | `Permission-apply`    | `/dashboard/apply`         |
 *
 * with the value being a level:
 *
 * | Value | Level             | May                                  |
 * | ----- | ----------------- | ------------------------------------ |
 * | unset | {@link LEVEL_NONE}      | nothing — the area does not exist    |
 * | `1`   | {@link LEVEL_READ}      | read (GET)                           |
 * | `2`   | {@link LEVEL_WRITE}     | read + create/change (POST/PUT/PATCH)|
 * | `3`   | {@link LEVEL_DELETE}    | read + write + delete (DELETE)       |
 *
 * ── Rules ─────────────────────────────────────────────────────────────────
 *  - Fail-closed: a claim that is missing, empty, non-numeric or out of range
 *    is {@link LEVEL_NONE}, with no special cases. "Not set" and "nonsense" are the
 *    same answer, because the safe one is the only defensible one.
 *  - Several groups: the HIGHEST level per area wins across all of the user's
 *    OTP groups. That mirrors the existing rule that the highest `weight`
 *    decides the primary rank, and it means an extra group can only ever add
 *    rights, never silently take them away.
 *  - Dashboard access is "at least one area at {@link LEVEL_READ} or above". All
 *    four at {@link LEVEL_NONE} means the same "Access Denied" view as before.
 *
 * ── Accepted risk: `team` >= LEVEL_WRITE can escalate itself ─────────────────────
 * The `Permission-*` claims live on Pocket ID groups, and editing groups IS the
 * `team` area. So anybody at `team` level 2 or higher can open Team → Gruppen,
 * give their own rank level 3 in every area, and hold it after the next
 * re-check. This is deliberate and not a hole to be plugged here: managing
 * ranks is administering the team, and the same person can already add
 * themselves to any group directly in Pocket ID. Treat `team` >= 2 as "team
 * administrator", i.e. as equivalent to full rights, and hand it out on that
 * basis — a rank that should only write articles gets `Permission-news` and
 * nothing else. (Documented in the README under "Dashboard authorisation".)
 *
 * This module deliberately has no imports: it is referenced from the session
 * type augmentation in `src/auth.ts` and therefore reaches client components,
 * which must not pull in server-only code. Compare `src/lib/session-role.ts`.
 */

/** The four dashboard areas, one per section of the dashboard navigation. */
export const PERMISSION_AREAS = ["news", "creators", "team", "apply"] as const;

/** One dashboard area. */
export type PermissionArea = (typeof PERMISSION_AREAS)[number];

/** No access at all — the area is hidden and every request is refused. */
export const LEVEL_NONE = 0;
/** May read (GET). */
export const LEVEL_READ = 1;
/** May read and create/change (POST, PUT, PATCH). */
export const LEVEL_WRITE = 2;
/** May read, write and delete (HTTP DELETE). */
export const LEVEL_DELETE = 3;

/** A permission level: 0 (none), 1 (read), 2 (write) or 3 (delete). */
export type PermissionLevel = 0 | 1 | 2 | 3;

/** A complete set of levels — every area always has one, even if it is 0. */
export type PermissionSet = Readonly<Record<PermissionArea, PermissionLevel>>;

/** The fail-closed default: no access anywhere. */
export const NO_PERMISSIONS: PermissionSet = Object.freeze({
  news: LEVEL_NONE,
  creators: LEVEL_NONE,
  team: LEVEL_NONE,
  apply: LEVEL_NONE,
});

/**
 * Key of the Pocket ID group custom claim carrying an area's level. Kept as a
 * function so the four keys cannot drift apart from {@link PERMISSION_AREAS};
 * matching is case-insensitive everywhere (`readClaim`), so a hand-typed
 * `permission-news` in Pocket ID works just as well.
 */
export function permissionClaimKey(area: PermissionArea): string {
  return `Permission-${area}`;
}

/** All four claim keys, lower-cased — for the group editor's claim rebuild. */
export const PERMISSION_CLAIM_KEYS: readonly string[] = PERMISSION_AREAS.map(
  (area) => permissionClaimKey(area).toLowerCase(),
);

/**
 * Parse a claim value into a level, fail-closed.
 *
 * Everything that is not exactly the text of 1, 2 or 3 becomes {@link LEVEL_NONE}:
 * absent, empty, `"true"`, `"4"`, `"-1"`, `"2.5"`, an object. A typo in Pocket
 * ID therefore removes access rather than inventing some. `Number.parseInt`
 * is avoided on purpose — it would read `"2abc"` and `"3 apples"` as levels.
 */
export function parsePermissionLevel(raw: unknown): PermissionLevel {
  if (typeof raw === "number") {
    return raw === LEVEL_READ || raw === LEVEL_WRITE || raw === LEVEL_DELETE
      ? raw
      : LEVEL_NONE;
  }
  if (typeof raw !== "string") return LEVEL_NONE;
  switch (raw.trim()) {
    case "1":
      return LEVEL_READ;
    case "2":
      return LEVEL_WRITE;
    case "3":
      return LEVEL_DELETE;
    default:
      return LEVEL_NONE;
  }
}

/** A `{ key, value }` custom claim, as Pocket ID stores them. */
interface ClaimLike {
  key: string;
  value: string;
}

/**
 * Read all four levels off one group's custom claims. A group with no
 * permission claims — every group right after this feature is deployed —
 * yields {@link NO_PERMISSIONS} and grants nothing.
 */
export function permissionsFromClaims(
  claims: readonly ClaimLike[] | undefined,
): PermissionSet {
  const result: Record<PermissionArea, PermissionLevel> = {
    news: LEVEL_NONE,
    creators: LEVEL_NONE,
    team: LEVEL_NONE,
    apply: LEVEL_NONE,
  };

  for (const area of PERMISSION_AREAS) {
    const wanted = permissionClaimKey(area).toLowerCase();
    const claim = (claims ?? []).find((c) => c.key?.toLowerCase() === wanted);
    result[area] = parsePermissionLevel(claim?.value);
  }

  return result;
}

/**
 * Turn a set back into the custom claims a Pocket ID group stores.
 *
 * Level 0 produces NO claim rather than `"0"`: "unset" is the model's own
 * spelling of "no access" (see the module header), so clearing an area in the
 * group editor removes the claim instead of leaving a `Permission-team=0`
 * behind that means the same thing in a second way.
 */
export function permissionClaims(
  permissions: PermissionSet,
): { key: string; value: string }[] {
  return PERMISSION_AREAS.filter((area) => permissions[area] > LEVEL_NONE).map(
    (area) => ({
      key: permissionClaimKey(area),
      value: String(permissions[area]),
    }),
  );
}

/**
 * Combine two sets by taking the higher level per area.
 *
 * Used to fold a user's several OTP groups into one answer. Order-independent
 * and idempotent, so it can be reduced over any number of groups.
 */
export function mergePermissions(
  a: PermissionSet,
  b: PermissionSet,
): PermissionSet {
  const result: Record<PermissionArea, PermissionLevel> = { ...NO_PERMISSIONS };
  for (const area of PERMISSION_AREAS) {
    result[area] = (a[area] >= b[area] ? a[area] : b[area]) as PermissionLevel;
  }
  return result;
}

/** A set with the same level everywhere — used by the `ADMIN_EMAILS` path. */
export function uniformPermissions(level: PermissionLevel): PermissionSet {
  return { news: level, creators: level, team: level, apply: level };
}

/**
 * The level for one area, from a possibly absent set.
 *
 * The `undefined` case is not defensive noise: a JWT minted before this feature
 * existed carries no permissions at all, and it must come out as "nothing"
 * rather than as an unknown a caller might misread.
 */
export function permissionLevel(
  permissions: PermissionSet | undefined,
  area: PermissionArea,
): PermissionLevel {
  return permissions?.[area] ?? LEVEL_NONE;
}

/** True when `permissions` reaches `minLevel` in `area`. */
export function hasPermission(
  permissions: PermissionSet | undefined,
  area: PermissionArea,
  minLevel: PermissionLevel,
): boolean {
  return permissionLevel(permissions, area) >= minLevel;
}

/** True when at least one area is at {@link LEVEL_READ} or above — i.e. may open the dashboard. */
export function hasAnyPermission(
  permissions: PermissionSet | undefined,
): boolean {
  return PERMISSION_AREAS.some(
    (area) => permissionLevel(permissions, area) > LEVEL_NONE,
  );
}

/**
 * Re-read a value that came off a JWT / session back into a {@link PermissionSet}.
 *
 * A JWT round-trips through JSON, so what comes back is `unknown` — possibly a
 * set written by an older version of this code, possibly nothing. Each area is
 * parsed on its own with the same fail-closed rule as a claim value.
 */
export function coercePermissions(raw: unknown): PermissionSet {
  if (!raw || typeof raw !== "object") return NO_PERMISSIONS;
  const source = raw as Record<string, unknown>;
  const result: Record<PermissionArea, PermissionLevel> = { ...NO_PERMISSIONS };
  for (const area of PERMISSION_AREAS) {
    result[area] = parsePermissionLevel(source[area]);
  }
  return result;
}
