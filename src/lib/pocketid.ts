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

export async function pocketIdFetch(
  path: string,
  init: RequestInit = {},
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

  const res = await fetch(`${POCKETID_BASE}${path}`, {
    ...init,
    headers,
    cache: "no-store",
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
export async function fetchAllPages<T>(path: string): Promise<T[]> {
  const items: T[] = [];
  let page = 1;
  let totalPages: number;
  const sep = path.includes("?") ? "&" : "?";

  do {
    const res = await pocketIdFetch(
      `${path}${sep}pagination[page]=${page}&pagination[limit]=100`,
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
