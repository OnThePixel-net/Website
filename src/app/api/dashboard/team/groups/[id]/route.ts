import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  pocketIdFetch,
  isOtpGroup,
  OTP_TEAM_CLAIM,
  PocketIdError,
  type CustomClaim,
  type UserGroup,
} from "@/lib/pocketid";

async function checkAuth() {
  const session = await auth();
  return !!session;
}

function handleError(e: unknown) {
  if (e instanceof PocketIdError)
    return NextResponse.json(
      { error: e.message, detail: e.body },
      { status: e.status >= 400 ? e.status : 500 },
    );
  return NextResponse.json({ error: String(e) }, { status: 500 });
}

/** PUT — update an existing OTP-team group's name, prefix and weight. */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await checkAuth()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!id)
    return NextResponse.json({ error: "Missing group id" }, { status: 400 });

  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    const prefix = String(body.prefix ?? "").trim();
    const weight = String(body.weight ?? "").trim();

    if (!name)
      return NextResponse.json(
        { error: "Name ist erforderlich." },
        { status: 400 },
      );

    // Load the current group and confirm it is an OTP-team group.
    const groupRes = await pocketIdFetch(`/api/user-groups/${id}`);
    const current = (await groupRes.json()) as UserGroup;
    if (!isOtpGroup(current))
      return NextResponse.json({ error: "Keine OTP-Gruppe." }, { status: 403 });

    // 1) Update the display name (the technical `name` slug stays stable).
    await pocketIdFetch(`/api/user-groups/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        name: current.name,
        friendlyName: name,
      }),
    });

    // 2) Rebuild claims: keep the OTP marker and any unrelated claims, replace
    //    prefix / weight with the submitted values.
    const managed = new Set(["team", "prefix", "weight"]);
    const claims: CustomClaim[] = (current.customClaims ?? []).filter(
      (c) => !managed.has(c.key.toLowerCase()),
    );
    claims.push(OTP_TEAM_CLAIM);
    if (prefix) claims.push({ key: "prefix", value: prefix });
    if (weight) claims.push({ key: "weight", value: weight });

    await pocketIdFetch(`/api/custom-claims/user-group/${id}`, {
      method: "PUT",
      body: JSON.stringify(claims),
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
