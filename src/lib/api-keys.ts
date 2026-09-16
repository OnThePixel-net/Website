/**
 * API keys for the dashboard API.
 *
 * Until now `/api/dashboard/**` could only be reached with a browser session:
 * sign in with Pocket ID, get a cookie, send requests from the dashboard. That
 * is the right shape for a person and the wrong one for everything else that
 * wants to talk to those endpoints — a Discord bot posting a release note, a
 * deploy script opening an application position, a status page counting new
 * applications. None of them can hold a browser session, and handing one a
 * team member's cookie would give it every right that member has.
 *
 * An API key is the second way in. Same endpoints, same per-area levels (see
 * `lib/permissions.ts`), no cookie — and rights of its own, so the bot that
 * writes news gets `news` and nothing else.
 *
 * ── The token ─────────────────────────────────────────────────────────────
 *
 *   otp_a1b2c3d4e5f6a7b8_Xk4c…                (one line, no spaces)
 *   └┬─┘ └──────┬───────┘ └─┬──────────────┘
 *    │          │           └ secret: 32 bytes from `crypto.randomBytes`,
 *    │          │             base64url — 256 bits, so it cannot be guessed
 *    │          │             and there is nothing to brute-force offline.
 *    │          └ prefix: 8 random bytes, hex. NOT secret. It is what the
 *    │            dashboard lists ("otp_a1b2c3d4e5f6a7b8"), so an operator can
 *    │            tell which key a script or a log line means, and it is what
 *    │            a request is looked up by — one indexed row rather than
 *    │            hashing the candidate against every key in the table.
 *    └ a fixed marker, so a leaked token is recognisable as one. Secret
 *      scanners key off exactly this kind of prefix.
 *
 * Only `sha256(token)` is stored. The token itself is shown once, by the dialog
 * that created it, and is unrecoverable afterwards — a dumped `api_keys` table
 * hands nobody a working key. SHA-256 and not bcrypt/argon2 on purpose: the
 * secret is 256 random bits, so there is no dictionary to run against it, while
 * a key is verified on *every* API request — a deliberately slow hash would put
 * ~100 ms in front of each one. This is the same reasoning GitHub and Stripe
 * publish for their own tokens.
 *
 * ── What a key may do ─────────────────────────────────────────────────────
 * A {@link PermissionSet}, exactly as a Pocket ID group carries one, and read
 * back through `coercePermissions()` so a level nobody recognises comes out as
 * "no access" rather than as an unknown the guard might misread. A key can
 * never exceed its creator's own rights ({@link capPermissions}): otherwise
 * `news` level 2 would be enough to mint a key with `team` level 3 and, with
 * it, the run of Pocket ID.
 */

import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { and, desc, eq, isNull, lt, or } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import type { ApiKeyRecord } from "@/lib/db/schema";
import { ensureApiKeyTable } from "@/lib/db/migrate";
import {
  coercePermissions,
  LEVEL_NONE,
  PERMISSION_AREAS,
  type PermissionLevel,
  type PermissionSet,
} from "@/lib/permissions";

/** Marker every token starts with, so a leaked one is recognisable. */
export const API_KEY_TOKEN_PREFIX = "otp";

/** Bytes of the non-secret prefix segment; hex, so the segment is 16 chars. */
const PREFIX_BYTES = 8;

/** Bytes of the secret segment — 256 bits. */
const SECRET_BYTES = 32;

/** Longest accepted key name, so the list stays readable. */
export const API_KEY_NAME_MAX_LENGTH = 60;

/**
 * How stale `last_used_at` may get before a request writes it again.
 *
 * Without this every authenticated GET would also be an UPDATE — an integration
 * polling once a second would turn a read-only endpoint into a write-heavy one
 * and keep a row permanently hot. A minute's resolution is far more than "when
 * was this key last used, and can I delete it?" needs.
 */
const LAST_USED_RESOLUTION_MS = 60_000;

/** A key as the dashboard lists it. Never carries the token or its hash. */
export interface ApiKeySummary {
  id: number;
  name: string;
  /** The token's public segment, e.g. `otp_a1b2c3d4e5f6a7b8`. */
  prefix: string;
  permissions: PermissionSet;
  createdBy: string;
  createdAt: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  revokedAt: string | null;
  /** Derived, so the UI does not repeat the expiry/revocation rules. */
  status: ApiKeyStatus;
}

/** What a key is right now. `active` is the only one that authenticates. */
export type ApiKeyStatus = "active" | "expired" | "revoked";

/** A freshly created key: the summary plus the one and only look at the token. */
export interface CreatedApiKey {
  key: ApiKeySummary;
  /** The full token. Never stored, never recoverable — show it once. */
  token: string;
}

/** SHA-256 of a token, hex — the only form that reaches the database. */
export function hashApiKeyToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

/**
 * Mint a token.
 *
 * The prefix is random rather than derived from the secret: deriving it would
 * publish a piece of the secret's hash, and there is no reason to. A collision
 * on 8 random bytes is caught by the UNIQUE constraint on `api_keys.prefix`,
 * which the caller retries — see {@link createApiKey}.
 */
function mintToken(): { token: string; prefix: string; tokenHash: string } {
  const prefix = `${API_KEY_TOKEN_PREFIX}_${randomBytes(PREFIX_BYTES).toString("hex")}`;
  const secret = randomBytes(SECRET_BYTES).toString("base64url");
  const token = `${prefix}_${secret}`;
  return { token, prefix, tokenHash: hashApiKeyToken(token) };
}

/**
 * The shape a token has to have: the marker, then exactly `PREFIX_BYTES` bytes
 * of hex, then a non-empty secret.
 *
 * A regex rather than `token.split("_")`: base64url's alphabet includes the
 * underscore, so roughly half of all real secrets contain one and a split would
 * hand back four or more segments and reject a perfectly good token. Only the
 * first two underscores are structural; everything after them is the secret,
 * underscores and all.
 */
const TOKEN_PATTERN = new RegExp(
  `^${API_KEY_TOKEN_PREFIX}_([0-9a-f]{${PREFIX_BYTES * 2}})_(.+)$`,
);

/**
 * Split a presented token into its prefix and the whole string.
 *
 * Returns null for anything that is not shaped like one of our tokens, so a
 * stray `Authorization: Bearer <a JWT>` is refused before it reaches the
 * database instead of costing a query.
 */
export function parseApiKeyToken(
  raw: string | null | undefined,
): { prefix: string; token: string } | null {
  const token = String(raw ?? "").trim();
  if (!token) return null;

  const match = TOKEN_PATTERN.exec(token);
  if (!match) return null;

  return { prefix: `${API_KEY_TOKEN_PREFIX}_${match[1]}`, token };
}

/**
 * The token carried by a request, or null.
 *
 * Two spellings are accepted — `Authorization: Bearer <token>` (the standard
 * one) and `X-API-Key: <token>` (what most webhook senders and no-code tools
 * can be told to send). A query parameter deliberately is not: URLs end up in
 * access logs, browser history and `Referer` headers, which is exactly where a
 * long-lived credential must not be.
 */
export function readApiKeyToken(headers: Headers): string | null {
  const authorization = headers.get("authorization");
  if (authorization) {
    const match = /^Bearer\s+(.+)$/i.exec(authorization.trim());
    // An Authorization header that is not a Bearer token (Basic, a session
    // cookie's scheme, anything) is not ours to interpret.
    return match ? match[1].trim() : null;
  }
  const direct = headers.get("x-api-key");
  return direct ? direct.trim() : null;
}

/** Constant-time comparison of two hex digests of equal length. */
function hashesMatch(a: string, b: string): boolean {
  const left = Buffer.from(a, "hex");
  const right = Buffer.from(b, "hex");
  // `timingSafeEqual` throws on a length mismatch, which would itself leak the
  // answer through an exception; a differing length is simply "no match".
  if (left.length !== right.length || left.length === 0) return false;
  return timingSafeEqual(left, right);
}

/** Why a presented token did not authenticate. The caller turns this into 401. */
export type ApiKeyRejection = "malformed" | "unknown" | "revoked" | "expired";

/** Outcome of {@link verifyApiKey}. */
export type ApiKeyVerification =
  | {
      ok: true;
      id: number;
      name: string;
      prefix: string;
      permissions: PermissionSet;
    }
  | { ok: false; reason: ApiKeyRejection };

/** What an expired/revoked key is, in words the API can hand back. */
export const API_KEY_REJECTION_MESSAGES: Record<ApiKeyRejection, string> = {
  malformed: "Invalid API key.",
  unknown: "Invalid API key.",
  revoked: "This API key has been revoked.",
  expired: "This API key has expired.",
};

/**
 * Check a presented token and report what it may do.
 *
 * `malformed` and `unknown` share one message on purpose: telling a caller
 * "that key exists but is not yours to use" would confirm a guess. Revoked and
 * expired are named, because those are the states an operator has to be able to
 * diagnose from the other end of an integration that stopped working, and both
 * only ever appear to somebody already holding the real token.
 */
export async function verifyApiKey(
  rawToken: string | null | undefined,
): Promise<ApiKeyVerification> {
  const parsed = parseApiKeyToken(rawToken);
  if (!parsed) return { ok: false, reason: "malformed" };

  await ensureApiKeyTable();
  const db = getDb();
  const [row] = await db
    .select()
    .from(schema.apiKeys)
    .where(eq(schema.apiKeys.prefix, parsed.prefix))
    .limit(1);

  // The hash is compared even when no row was found — against a throwaway
  // digest — so "unknown prefix" and "wrong secret" take the same path and the
  // same time.
  const expected = row?.token_hash ?? hashApiKeyToken("no such key");
  if (!hashesMatch(hashApiKeyToken(parsed.token), expected) || !row) {
    return { ok: false, reason: "unknown" };
  }

  if (row.revoked_at) return { ok: false, reason: "revoked" };
  if (row.expires_at && row.expires_at.getTime() <= Date.now()) {
    return { ok: false, reason: "expired" };
  }

  return {
    ok: true,
    id: row.id,
    name: row.name,
    prefix: row.prefix,
    permissions: coercePermissions(row.permissions),
  };
}

/**
 * Record that a key was used, at most once per {@link LAST_USED_RESOLUTION_MS}.
 *
 * The throttle is a WHERE clause rather than an in-process cache so it also
 * holds across several server instances. Deliberately not awaited by the
 * request path: the stamp is an operator convenience, and a database hiccup
 * while writing it must never turn an otherwise fine API call into a 500.
 */
export function touchApiKeyUsage(id: number): void {
  const db = getDb();
  void db
    .update(schema.apiKeys)
    .set({ last_used_at: new Date() })
    .where(
      and(
        eq(schema.apiKeys.id, id),
        or(
          isNull(schema.apiKeys.last_used_at),
          lt(
            schema.apiKeys.last_used_at,
            new Date(Date.now() - LAST_USED_RESOLUTION_MS),
          ),
        ),
      ),
    )
    .catch((e) => {
      console.error("[api-keys] could not record usage:", e);
    });
}

/** Current state of a row, from its two timestamps. */
function statusOf(row: ApiKeyRecord): ApiKeyStatus {
  if (row.revoked_at) return "revoked";
  if (row.expires_at && row.expires_at.getTime() <= Date.now())
    return "expired";
  return "active";
}

/** Row → the shape the dashboard receives. Never includes the hash. */
function toSummary(row: ApiKeyRecord): ApiKeySummary {
  return {
    id: row.id,
    name: row.name,
    prefix: row.prefix,
    permissions: coercePermissions(row.permissions),
    createdBy: row.created_by,
    createdAt: row.created_at.toISOString(),
    lastUsedAt: row.last_used_at?.toISOString() ?? null,
    expiresAt: row.expires_at?.toISOString() ?? null,
    revokedAt: row.revoked_at?.toISOString() ?? null,
    status: statusOf(row),
  };
}

/** Every key, newest first. Revoked ones stay in the list as the record they are. */
export async function listApiKeys(): Promise<ApiKeySummary[]> {
  await ensureApiKeyTable();
  const db = getDb();
  const rows = await db
    .select()
    .from(schema.apiKeys)
    .orderBy(desc(schema.apiKeys.created_at));
  return rows.map(toSummary);
}

/**
 * Cap `requested` at `granter`, area by area.
 *
 * A key is a credential its creator hands out, so it can carry at most what its
 * creator holds — otherwise `news` level 2 would be enough to mint a key with
 * `team` level 3 and, through the rank editor, full control of Pocket ID. The
 * dialog pre-filters the selects to the same ceiling; this is the one that
 * counts, because it runs on the server.
 */
export function capPermissions(
  requested: PermissionSet,
  granter: PermissionSet | undefined,
): PermissionSet {
  const result: Record<string, PermissionLevel> = {};
  for (const area of PERMISSION_AREAS) {
    const ceiling = granter?.[area] ?? LEVEL_NONE;
    result[area] = (
      requested[area] < ceiling ? requested[area] : ceiling
    ) as PermissionLevel;
  }
  return result as PermissionSet;
}

/** True when a set grants nothing anywhere — a key like that could do nothing. */
export function isEmptyPermissionSet(permissions: PermissionSet): boolean {
  return PERMISSION_AREAS.every((area) => permissions[area] <= LEVEL_NONE);
}

/** Validation failures {@link createApiKey} reports to the route as a 400. */
export class ApiKeyValidationError extends Error {}

/**
 * Normalise a name: trimmed, length-capped, never empty.
 *
 * The name is the only thing distinguishing two keys in the list once both are
 * a fortnight old, so an unnamed key is refused rather than stored as "".
 */
export function normalizeApiKeyName(raw: unknown): string {
  const name = String(raw ?? "")
    .trim()
    .slice(0, API_KEY_NAME_MAX_LENGTH);
  if (!name) throw new ApiKeyValidationError("Ein Name ist erforderlich.");
  return name;
}

/**
 * Read an optional expiry off a request body.
 *
 * Accepts an ISO timestamp or a plain `YYYY-MM-DD` date (what an `<input
 * type="date">` posts); `null`, `undefined` and `""` all mean "no expiry",
 * which is a valid answer for a key an integration is meant to keep using.
 */
export function parseApiKeyExpiry(raw: unknown): Date | null {
  if (raw === null || raw === undefined || raw === "") return null;
  const value = new Date(String(raw));
  if (Number.isNaN(value.getTime()))
    throw new ApiKeyValidationError("Ungültiges Ablaufdatum.");
  if (value.getTime() <= Date.now())
    throw new ApiKeyValidationError(
      "Das Ablaufdatum muss in der Zukunft liegen.",
    );
  return value;
}

/**
 * Create a key and hand back its token — the only time it exists in plain text.
 *
 * `permissions` is expected to be capped by the caller already
 * ({@link capPermissions}); a set that grants nothing is refused, because such
 * a key authenticates and is then forbidden everywhere, which looks exactly
 * like a broken key from the other end.
 */
export async function createApiKey(input: {
  name: string;
  permissions: PermissionSet;
  createdBy: string;
  expiresAt: Date | null;
}): Promise<CreatedApiKey> {
  if (isEmptyPermissionSet(input.permissions)) {
    throw new ApiKeyValidationError(
      "Der Key braucht mindestens einen Bereich mit Zugriff.",
    );
  }

  await ensureApiKeyTable();
  const db = getDb();

  // A collision on 8 random bytes is a 1-in-2^64 event, but the UNIQUE
  // constraint decides that, not this comment: on the (im)possible clash the
  // insert is simply retried with a fresh token.
  for (let attempt = 0; attempt < 3; attempt++) {
    const { token, prefix, tokenHash } = mintToken();
    try {
      const [row] = await db
        .insert(schema.apiKeys)
        .values({
          name: input.name,
          prefix,
          token_hash: tokenHash,
          permissions: input.permissions,
          created_by: input.createdBy,
          expires_at: input.expiresAt,
        })
        .returning();
      return { key: toSummary(row), token };
    } catch (e) {
      const err = e as { code?: string; cause?: { code?: string } };
      const unique = err?.code === "23505" || err?.cause?.code === "23505";
      if (!unique || attempt === 2) throw e;
    }
  }

  // Unreachable: the loop either returns or rethrows on its last attempt.
  throw new Error("Could not generate a unique API key.");
}

/** Rename a key. Returns null when there is no such key. */
export async function renameApiKey(
  id: number,
  name: string,
): Promise<ApiKeySummary | null> {
  await ensureApiKeyTable();
  const db = getDb();
  const [row] = await db
    .update(schema.apiKeys)
    .set({ name })
    .where(eq(schema.apiKeys.id, id))
    .returning();
  return row ? toSummary(row) : null;
}

/**
 * Revoke a key: it stops authenticating immediately and stays in the list.
 *
 * Keeping the row is the point. After a key has had to be pulled, its name,
 * its prefix and when it was last used are precisely what somebody needs, and
 * a deleted row answers none of it. Already-revoked keys keep their original
 * timestamp, so revoking twice is a no-op rather than a rewritten history.
 */
export async function revokeApiKey(id: number): Promise<ApiKeySummary | null> {
  await ensureApiKeyTable();
  const db = getDb();
  const [row] = await db
    .update(schema.apiKeys)
    .set({ revoked_at: new Date() })
    .where(and(eq(schema.apiKeys.id, id), isNull(schema.apiKeys.revoked_at)))
    .returning();

  if (row) return toSummary(row);

  // Either it never existed or it was already revoked — tell those apart, so
  // the route can answer 404 for the first and "fine, nothing to do" for the
  // second.
  const [existing] = await db
    .select()
    .from(schema.apiKeys)
    .where(eq(schema.apiKeys.id, id))
    .limit(1);
  return existing ? toSummary(existing) : null;
}
