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
 * The decision itself is made at sign-in and refreshed periodically, and rides
 * on the session (see `src/lib/admin-access.ts`); this only reads the resulting
 * levels, so the guard costs no upstream request.
 */

import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { auth } from "@/auth";
import { warnIfNoEmergencyAdmins } from "@/lib/admin-access";
import {
  hasPermission,
  permissionLevel,
  type PermissionArea,
  type PermissionLevel,
} from "@/lib/permissions";

/**
 * Result of {@link requirePermission}. A discriminated union so the happy path
 * hands the caller the session it already loaded (several routes need the
 * signed-in user's name) and the unhappy path hands it a finished response to
 * return.
 */
export type PermissionGuard =
  { ok: true; session: Session } | { ok: false; response: NextResponse };

/**
 * Require an authenticated session that reaches `minLevel` in `area`.
 *
 * Usage in a route handler:
 *
 * ```ts
 * const gate = await requirePermission("news", LEVEL_WRITE);
 * if (!gate.ok) return gate.response;
 * ```
 *
 * The two failure modes are kept apart, unlike before, where both were 401:
 *  - no session at all → 401 Unauthorized ("who are you?"), which tells a
 *    client that signing in may help;
 *  - a session without the level → 403 Forbidden ("not you"), which tells it
 *    that signing in again will not.
 *
 * Fail-closed throughout: `session.user.permissions` is absent on a token
 * minted before this feature existed, and {@link permissionLevel} reads that as
 * 0, so such a session is refused rather than grandfathered in.
 */
export async function requirePermission(
  area: PermissionArea,
  minLevel: PermissionLevel,
): Promise<PermissionGuard> {
  const session = await auth();

  if (!session?.user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (!hasPermission(session.user.permissions, area, minLevel)) {
    // Names the account, the area and both levels so the operator can go
    // straight to the group in Pocket ID — and, if no emergency list exists
    // either, points that out once, because a total lockout looks exactly like
    // this from the outside.
    warnIfNoEmergencyAdmins();
    console.warn(
      `[authz] Rejected dashboard API request from "${
        session.user.email ?? session.user.name ?? "unknown account"
      }": needs level ${minLevel} for "${area}", has ${permissionLevel(
        session.user.permissions,
        area,
      )}.`,
    );
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true, session };
}
