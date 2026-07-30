/**
 * Server-side helper for the PocketID admin API (https://auth.onthepixel.net).
 *
 * All requests must send an `X-API-KEY` header. The key is read from the
 * `pocketid-apikey` system/environment variable (with a `POCKETID_APIKEY`
 * fallback for environments that disallow dashes in variable names).
 *
 * This module is server-only — the API key must never reach the browser.
 */

export const POCKETID_BASE =
  process.env.POCKETID_API_URL ?? "https://auth.onthepixel.net";

/** The custom claim key/value that marks a group as belonging to the OTP team. */
const TEAM_CLAIM_KEY = "Team";
const TEAM_CLAIM_VALUE = "OTP";

export interface CustomClaim {
  key: string;
  value: string;
}

export interface UserGroup {
  id: string;
  friendlyName: string;
  name: string;
  customClaims?: CustomClaim[];
  userCount?: number;
  createdAt?: string;
}

export interface PocketUser {
  id: string;
  username: string;
  email?: string | null;
  emailVerified?: boolean;
  displayName?: string;
  isAdmin?: boolean;
  customClaims?: CustomClaim[];
  userGroups?: UserGroup[];
  disabled?: boolean;
}

interface Paginated<T> {
  data: T[];
  pagination?: {
    totalPages?: number;
    totalItems?: number;
    currentPage?: number;
    itemsPerPage?: number;
  };
}

export function getApiKey(): string {
  return process.env["pocketid-apikey"] ?? process.env.POCKETID_APIKEY ?? "";
}

/**
 * Thrown when an upstream PocketID request fails. Carries the upstream status
 * code and response body so the calling route can forward them to the client.
 */
export class PocketIdError extends Error {
  status: number;
  body: string;
  constructor(message: string, status: number, body: string) {
    super(message);
    this.name = "PocketIdError";
    this.status = status;
    this.body = body;
  }
}

/** Optional caching behaviour for a PocketID request. */
export interface PocketIdFetchOpts {
  /**
   * When set, the request participates in Next.js data caching with this
   * revalidation window (seconds) instead of the default `no-store`. Use for
   * public, read-only calls that don't need per-request freshness.
   */
  revalidate?: number;
}

export async function pocketIdFetch(
  path: string,
  init: RequestInit = {},
  opts: PocketIdFetchOpts = {},
): Promise<Response> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new PocketIdError(
      "PocketID API key is not configured (set the `pocketid-apikey` environment variable).",
      500,
      "",
    );
  }

  const headers = new Headers(init.headers);
  headers.set("X-API-KEY", apiKey);
  headers.set("Accept", "application/json");
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const cacheInit: RequestInit =
    opts.revalidate != null
      ? { next: { revalidate: opts.revalidate } }
      : { cache: "no-store" };

  const res = await fetch(`${POCKETID_BASE}${path}`, {
    ...init,
    ...cacheInit,
    headers,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new PocketIdError(
      `PocketID request failed: ${res.status} ${res.statusText}`,
      res.status,
      body,
    );
  }

  return res;
}

/** Fetch every page of a paginated PocketID collection endpoint. */
export async function fetchAllPages<T>(
  path: string,
  opts: PocketIdFetchOpts = {},
): Promise<T[]> {
  const items: T[] = [];
  let page = 1;
  let totalPages: number;
  const sep = path.includes("?") ? "&" : "?";

  do {
    const res = await pocketIdFetch(
      `${path}${sep}pagination[page]=${page}&pagination[limit]=100`,
      {},
      opts,
    );
    const json = (await res.json()) as Paginated<T>;
    items.push(...(json.data ?? []));
    totalPages = json.pagination?.totalPages ?? 1;
    page += 1;
  } while (page <= totalPages);

  return items;
}

/** The custom claim that marks a group as belonging to the OTP team. */
export const OTP_TEAM_CLAIM: CustomClaim = {
  key: TEAM_CLAIM_KEY,
  value: TEAM_CLAIM_VALUE,
};

/** True when a group carries the `Team=OTP` custom claim. */
export function isOtpGroup(group: UserGroup): boolean {
  return (group.customClaims ?? []).some(
    (c) => c.key === TEAM_CLAIM_KEY && c.value === TEAM_CLAIM_VALUE,
  );
}

/** Set of group IDs that belong to the OTP team. */
export function otpGroupIds(groups: UserGroup[]): Set<string> {
  return new Set(groups.filter(isOtpGroup).map((g) => g.id));
}

/** True when a user is a member of at least one OTP-team group. */
export function isOtpMember(user: PocketUser, otpIds: Set<string>): boolean {
  return (user.userGroups ?? []).some((g) => otpIds.has(g.id));
}

/** Read a custom-claim value from any claim list by key (case-insensitive). */
export function readClaim(
  claims: CustomClaim[] | undefined,
  key: string,
): string {
  const claim = (claims ?? []).find(
    (c) => c.key.toLowerCase() === key.toLowerCase(),
  );
  return claim?.value ?? "";
}

/** Read a custom-claim value off a user by key (case-insensitive). */
export function getClaim(user: PocketUser, key: string): string {
  return readClaim(user.customClaims, key);
}

/**
 * Slugify a display name into a PocketID group `name` (lowercase, digits and
 * single hyphens). Falls back to `group` when nothing usable remains.
 */
export function slugifyGroupName(input: string): string {
  const slug = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "group";
}

/* -------------------------------------------------------------------------- */
/*  Public team listing                                                       */
/* -------------------------------------------------------------------------- */

/** Numeric `weight` claim of a group (0 when unset/invalid). */
export function groupWeight(group: UserGroup | undefined): number {
  const raw = readClaim(group?.customClaims, "weight");
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : 0;
}

/** Legacy Minecraft colour codes → hex. */
const MC_COLORS: Record<string, string> = {
  "0": "#000000",
  "1": "#0000AA",
  "2": "#00AA00",
  "3": "#00AAAA",
  "4": "#AA0000",
  "5": "#AA00AA",
  "6": "#FFAA00",
  "7": "#AAAAAA",
  "8": "#555555",
  "9": "#5555FF",
  a: "#55FF55",
  b: "#55FFFF",
  c: "#FF5555",
  d: "#FF55FF",
  e: "#FFFF55",
  f: "#FFFFFF",
};

/** Fallback rank colour when a prefix carries no usable colour information. */
const DEFAULT_RANK_COLOR = "#AAAAAA";

/**
 * Derive a display colour from a Minecraft-style group prefix. Supports hex
 * codes (`&#RRGGBB`) and legacy colour codes (`&c`, `§a`, …); falls back to a
 * neutral grey when no colour is present.
 */
export function prefixColor(prefix: string | undefined): string {
  if (!prefix) return DEFAULT_RANK_COLOR;
  const hex = prefix.match(/[&§]?#([0-9a-fA-F]{6})/);
  if (hex) return `#${hex[1]}`;
  const code = prefix.match(/[&§]([0-9a-fA-F])/);
  if (code) return MC_COLORS[code[1].toLowerCase()] ?? DEFAULT_RANK_COLOR;
  return DEFAULT_RANK_COLOR;
}

/** A team member shaped for the public `/team` page. Carries no email/PII. */
export interface PublicTeamMember {
  /** PocketID user id (stable React key). */
  id: string;
  /** Display name, falling back to the username. */
  name: string;
  /** Login name — used for the skin avatar when no Minecraft UUID is set. */
  username: string;
  /** Minecraft UUID custom claim (preferred avatar lookup). */
  minecraftUuid: string;
  /** Friendly name of the member's highest-weight OTP group. */
  rankName: string;
  /** Colour derived from that group's prefix. */
  rankColor: string;
  /** Weight of that group (used for ordering, highest first). */
  weight: number;
}

/**
 * Fetch the OTP team members for the public `/team` page from PocketID.
 *
 * Replaces the legacy Directus CMS `Team` collection. Only enabled accounts in
 * an OTP-team group are returned, ranked by their group's weight (highest
 * first), and no email/PII leaves the server. Results are cached for 5 minutes.
 */
export async function getPublicTeamMembers(): Promise<PublicTeamMember[]> {
  const [groups, users] = await Promise.all([
    fetchAllPages<UserGroup>("/api/user-groups", { revalidate: 300 }),
    fetchAllPages<PocketUser>("/api/users", { revalidate: 300 }),
  ]);

  const otpIds = otpGroupIds(groups);
  const groupById = new Map(groups.map((g) => [g.id, g]));

  return users
    .filter((u) => !u.disabled && isOtpMember(u, otpIds))
    .map((u) => {
      // Resolve the user's OTP groups to their full definitions (the group
      // objects embedded on the user may omit custom claims / friendly names).
      const memberGroups = (u.userGroups ?? [])
        .filter((g) => otpIds.has(g.id))
        .map((g) => groupById.get(g.id) ?? g);

      // Highest weight wins as the member's primary rank.
      const primary = memberGroups
        .slice()
        .sort((a, b) => groupWeight(b) - groupWeight(a))[0];

      return {
        id: u.id,
        name: u.displayName ?? u.username,
        username: u.username,
        minecraftUuid: getClaim(u, "Minecraft-uuid"),
        rankName: primary?.friendlyName ?? primary?.name ?? "",
        rankColor: prefixColor(readClaim(primary?.customClaims, "prefix")),
        weight: groupWeight(primary),
      } satisfies PublicTeamMember;
    })
    .sort((a, b) => b.weight - a.weight);
}
