/**
 * `/api/dashboard/api-keys/<id>` — rename and revoke one key.
 *
 * Session-only, like the collection route: see `../route.ts` for why a key may
 * not manage keys.
 *
 * Rights are deliberately not editable. Re-pointing an existing token at a
 * different set of areas changes what a credential already in somebody's CI
 * config may do, without that token ever changing — and without anybody who
 * holds it noticing. Widening rights is "revoke and issue a new one", which
 * leaves both halves of the change visible in the list.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireSessionPermission } from "@/lib/authz";
import {
  ApiKeyValidationError,
  normalizeApiKeyName,
  renameApiKey,
  revokeApiKey,
} from "@/lib/api-keys";
import { LEVEL_WRITE } from "@/lib/permissions";

/** Parse the path segment, rejecting anything that is not a positive integer. */
function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function invalidId() {
  return NextResponse.json({ error: "Ungültige ID." }, { status: 400 });
}

function notFound() {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

function handleError(e: unknown, scope: string) {
  if (e instanceof ApiKeyValidationError) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
  const msg = e instanceof Error ? e.message : String(e);
  console.error(`[api-keys ${scope}]`, e);
  return NextResponse.json({ error: msg }, { status: 500 });
}

/** PATCH — rename a key. The token and its rights are untouched. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const gate = await requireSessionPermission("team", LEVEL_WRITE);
  if (!gate.ok) return gate.response;

  const { id } = await params;
  const keyId = parseId(id);
  if (keyId === null) return invalidId();

  try {
    const body = await req.json();
    const key = await renameApiKey(keyId, normalizeApiKeyName(body.name));
    if (!key) return notFound();
    return NextResponse.json({ data: key });
  } catch (e) {
    return handleError(e, "PATCH");
  }
}

/**
 * DELETE — revoke a key.
 *
 * The row survives: a revoked key's name, prefix and last use are exactly what
 * is wanted after one has had to be pulled, and a deleted row answers none of
 * it. The key stops authenticating on the next request either way. Revoking an
 * already-revoked key keeps its original timestamp and still answers 200, so a
 * retried request is not an error.
 *
 * {@link LEVEL_WRITE}, not {@link LEVEL_DELETE}, which breaks this file's
 * DELETE-needs-level-3 convention on purpose: revocation is the containment
 * action for a leaked credential, and whoever was trusted to issue a key must
 * not have to find somebody with a higher level to pull it again. Nothing is
 * lost by it — the row is kept, so this deletes no data.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const gate = await requireSessionPermission("team", LEVEL_WRITE);
  if (!gate.ok) return gate.response;

  const { id } = await params;
  const keyId = parseId(id);
  if (keyId === null) return invalidId();

  try {
    const key = await revokeApiKey(keyId);
    if (!key) return notFound();
    return NextResponse.json({ data: key });
  } catch (e) {
    return handleError(e, "DELETE");
  }
}
