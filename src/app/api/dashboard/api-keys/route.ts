/**
 * `/api/dashboard/api-keys` — list and mint the dashboard API's access tokens.
 *
 * Gated on the `team` area, like the rank editor: handing out a credential is
 * team administration, and `src/lib/permissions.ts` already documents `team`
 * level 2 as "team administrator, i.e. equivalent to full rights". Whatever a
 * key is given is additionally capped at the creator's own levels, so this
 * cannot become a way around the areas somebody was not given.
 *
 * Session-only ({@link requireSessionPermission}): a key that could mint keys
 * would outlive its own revocation.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireSessionPermission } from "@/lib/authz";
import {
  ApiKeyValidationError,
  capPermissions,
  createApiKey,
  listApiKeys,
  normalizeApiKeyName,
  parseApiKeyExpiry,
} from "@/lib/api-keys";
import { coercePermissions, LEVEL_READ, LEVEL_WRITE } from "@/lib/permissions";

function handleError(e: unknown, scope: string) {
  if (e instanceof ApiKeyValidationError) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
  const msg = e instanceof Error ? e.message : String(e);
  console.error(`[api-keys ${scope}]`, e);
  return NextResponse.json({ error: msg }, { status: 500 });
}

/**
 * GET — every key, newest first.
 *
 * Tokens are not part of the answer and cannot be: only their SHA-256 is
 * stored. The list carries the prefix, which is what identifies a key to a
 * human without being usable as one.
 */
export async function GET() {
  const gate = await requireSessionPermission("team", LEVEL_READ);
  if (!gate.ok) return gate.response;

  try {
    return NextResponse.json({
      data: await listApiKeys(),
      // The creator's own levels, so the dialog can cap its selects at what
      // this account may actually delegate instead of offering rights the
      // server would then quietly trim.
      grantable: gate.actor.permissions,
    });
  } catch (e) {
    return handleError(e, "GET");
  }
}

/**
 * POST — mint a key and return its token once.
 *
 * The response is the only time the token exists outside the caller's hands;
 * there is no endpoint that reads it back, by design.
 */
export async function POST(req: NextRequest) {
  const gate = await requireSessionPermission("team", LEVEL_WRITE);
  if (!gate.ok) return gate.response;

  try {
    const body = await req.json();
    const created = await createApiKey({
      name: normalizeApiKeyName(body.name),
      // Coerced first (an unknown level becomes "no access") and then capped at
      // the creator's own rights — the client caps its selects too, but that is
      // guidance; this is the check that counts.
      permissions: capPermissions(
        coercePermissions(body.permissions),
        gate.actor.permissions,
      ),
      createdBy: gate.actor.name,
      expiresAt: parseApiKeyExpiry(body.expiresAt),
    });

    return NextResponse.json(
      { data: created.key, token: created.token },
      { status: 201 },
    );
  } catch (e) {
    return handleError(e, "POST");
  }
}
