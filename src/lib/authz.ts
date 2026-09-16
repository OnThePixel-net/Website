/**
 * Authorisation guard for the dashboard route handlers.
 *
 * Replaces the seven near-identical local `checkAuth()` copies that used to sit
 * in `src/app/api/dashboard/**`. Those only asked whether *a* session existed,
 * which meant every signed-in Discord account could write to the dashboard API
 * — the UI-only guard in `dashboard/auth-guard.tsx` was trivial to bypass with
 * a direct request. One shared helper means a route cannot accidentally be
 * shipped with a weaker check than its siblings.
 *
 * It also used to ask only "is this an admin", one boolean for the whole
 * dashboard. Rights are now per area and per level (see
 * `src/lib/permissions.ts`), so a handler states which area it belongs to and
 * what it needs:
 *
 *   GET     → {@link LEVEL_READ}   (1)
 *   POST/PUT/PATCH → {@link LEVEL_WRITE}  (2)
 *   DELETE  → {@link LEVEL_DELETE} (3)
 *
 * ── Two ways to authenticate ──────────────────────────────────────────────
 * A request may carry either
 *
 *  1. a **browser session** — what the dashboard itself uses. The decision is
 *     made at sign-in and refreshed periodically, and rides on the session (see
 *     `src/lib/admin-access.ts`), so the guard costs no upstream request; or
 *  2. an **API key** — `Authorization: Bearer otp_…`, for everything that is
 *     not a person at a browser (see `src/lib/api-keys.ts`). The key carries
 *     its own per-area levels, which is what stops "the bot may post news" from
 *     also meaning "the bot may delete team members".
 *
 * Both end up as the same {@link PermissionSet} against the same comparison, so
 * an endpoint cannot be stricter for one than for the other. A request that
 * presents a key does **not** fall back to the session cookie a browser would
 * also send: a bad key is an answer, not an invitation to try something else.
 *
 * Key management itself is session-only — see {@link requireSessionPermission}.
 */

import { headers } from "next/headers";
import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { auth } from "@/auth";
import { warnIfNoEmergencyAdmins } from "@/lib/admin-access";
import {
  API_KEY_REJECTION_MESSAGES,
  readApiKeyToken,
  touchApiKeyUsage,
  verifyApiKey,
} from "@/lib/api-keys";
import {
  hasPermission,
  NO_PERMISSIONS,
  permissionLevel,
  type PermissionArea,
  type PermissionLevel,
  type PermissionSet,
} from "@/lib/permissions";

/**
 * Who is making the request, once it has been authenticated.
 *
 * Routes that need a name for the audit trail (the news author, say) read
 * `name` and do not care which way in was used; the ones that genuinely need a
 * person — the API key editor — check `kind`.
 */
export type PermissionActor =
  | {
      kind: "session";
      /** Display name of the signed-in account, "" when it has none. */
      name: string;
      permissions: PermissionSet;
      session: Session;
    }
  | {
      kind: "api-key";
      /** The key's label, e.g. "Discord bot" — it authors what the key writes. */
      name: string;
      permissions: PermissionSet;
      /** Row id, for the log line naming which key was refused. */
      keyId: number;
      /** The key's public segment, e.g. `otp_a1b2c3d4e5f6a7b8`. */
      keyPrefix: string;
    };

/**
 * Result of {@link requirePermission}. A discriminated union so the happy path
 * hands the caller the actor it already resolved (several routes need the
 * caller's name) and the unhappy path hands it a finished response to return.
 */
export type PermissionGuard =
  { ok: true; actor: PermissionActor } | { ok: false; response: NextResponse };

/** 401 — "who are you?", i.e. signing in (or sending a key) may help. */
function unauthorized(message = "Unauthorized"): PermissionGuard {
  return {
    ok: false,
    response: NextResponse.json({ error: message }, { status: 401 }),
  };
}

/** 403 — "not you", i.e. authenticated but without the level. */
function forbidden(): PermissionGuard {
  return {
    ok: false,
    response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
  };
}

/**
 * Authenticate the caller, without yet asking what they may do.
 *
 * Returns null when the request carries no credential at all, so the caller can
 * tell "nobody is here" (401) from "this key is not allowed that" (403).
 */
async function resolveActor(): Promise<
  { actor: PermissionActor } | { rejected: PermissionGuard } | null
> {
  // `headers()` rather than a `Request` parameter: it reads the same incoming
  // request inside a route handler and means the ~25 existing call sites keep
  // their `requirePermission(area, level)` shape.
  const token = readApiKeyToken(await headers());

  if (token) {
    const verified = await verifyApiKey(token);
    if (!verified.ok) {
      // Deliberately no fallback to the session: a caller that presented a key
      // meant to use that key, and silently answering as whoever their cookie
      // happens to belong to would hide a rotated or revoked key until it
      // matters.
      console.warn(
        `[authz] Rejected dashboard API request: API key ${verified.reason}.`,
      );
      return {
        rejected: unauthorized(API_KEY_REJECTION_MESSAGES[verified.reason]),
      };
    }

    // Fire-and-forget: the "last used" stamp is an operator convenience and
    // must not add a write to the critical path of every API call.
    touchApiKeyUsage(verified.id);

    return {
      actor: {
        kind: "api-key",
        name: verified.name,
        permissions: verified.permissions,
        keyId: verified.id,
        keyPrefix: verified.prefix,
      },
    };
  }

  const session = await auth();
  if (!session?.user) return null;

  return {
    actor: {
      kind: "session",
      name: session.user.name ?? "",
      // Fail-closed: `permissions` is absent on a token minted before that
      // field existed, and every read below treats "absent" as level 0.
      permissions: session.user.permissions ?? NO_PERMISSIONS,
      session,
    },
  };
}

/** How the log line names whoever was refused. */
function describe(actor: PermissionActor): string {
  if (actor.kind === "api-key")
    return `API key "${actor.name}" (${actor.keyPrefix})`;
  const account = actor.session.user?.email ?? actor.name;
  return `"${account || "unknown account"}"`;
}

/**
 * Require a caller — a session **or** an API key — that reaches `minLevel` in
 * `area`.
 *
 * Usage in a route handler:
 *
 * ```ts
 * const gate = await requirePermission("news", LEVEL_WRITE);
 * if (!gate.ok) return gate.response;
 * ```
 *
 * The two failure modes are kept apart, unlike before, where both were 401:
 *  - no credential at all → 401 Unauthorized ("who are you?"), which tells a
 *    client that signing in, or sending a key, may help;
 *  - a credential without the level → 403 Forbidden ("not you"), which tells it
 *    that presenting the same one again will not.
 *
 * Fail-closed throughout: an absent or unrecognised permission set reads as 0
 * (see {@link permissionLevel}), so such a caller is refused rather than
 * grandfathered in.
 */
export async function requirePermission(
  area: PermissionArea,
  minLevel: PermissionLevel,
): Promise<PermissionGuard> {
  const resolved = await resolveActor();
  if (!resolved) return unauthorized();
  if ("rejected" in resolved) return resolved.rejected;

  const { actor } = resolved;
  if (!hasPermission(actor.permissions, area, minLevel)) {
    // Names the caller, the area and both levels so the operator can go
    // straight to the group in Pocket ID (or to the key in the dashboard) —
    // and, if no emergency list exists either, points that out once, because a
    // total lockout looks exactly like this from the outside.
    warnIfNoEmergencyAdmins();
    console.warn(
      `[authz] Rejected dashboard API request from ${describe(actor)}: needs level ${minLevel} for "${area}", has ${permissionLevel(
        actor.permissions,
        area,
      )}.`,
    );
    return forbidden();
  }

  return { ok: true, actor };
}

/**
 * Like {@link requirePermission}, but refuses API keys outright.
 *
 * For the endpoints that mint and revoke keys. A key that could mint keys would
 * be a key that can outlive its own revocation — pull it, and whatever it
 * created in the meantime keeps working — and one that could quietly widen the
 * blast radius of a leak, since the new key's rights are bounded by the
 * creator's, i.e. by the leaked key's. Both stop at "a person, signed in, is
 * the only one who hands out credentials".
 */
export async function requireSessionPermission(
  area: PermissionArea,
  minLevel: PermissionLevel,
): Promise<PermissionGuard> {
  const gate = await requirePermission(area, minLevel);
  if (!gate.ok) return gate;

  if (gate.actor.kind !== "session") {
    console.warn(
      `[authz] Refused API key management to ${describe(gate.actor)}: keys are managed by signed-in accounts only.`,
    );
    return {
      ok: false,
      response: NextResponse.json(
        {
          error:
            "API keys can only be managed from a signed-in dashboard session, not with an API key.",
        },
        { status: 403 },
      ),
    };
  }

  return gate;
}
