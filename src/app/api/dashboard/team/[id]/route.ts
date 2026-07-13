import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  pocketIdFetch,
  fetchAllPages,
  otpGroupIds,
  PocketIdError,
  type PocketUser,
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

/** PUT — update an existing team member in PocketID. */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await checkAuth()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!id)
    return NextResponse.json({ error: "Missing user id" }, { status: 400 });

  try {
    const body = await req.json();

    // Load the current user and the group catalogue in parallel.
    const [userRes, groups] = await Promise.all([
      pocketIdFetch(`/api/users/${id}`),
      fetchAllPages<UserGroup>("/api/user-groups"),
    ]);
    const current = (await userRes.json()) as PocketUser;
    const otpIds = otpGroupIds(groups);

    // Resolve the target group set: OTP groups come from the request, every
    // non-OTP group the user already belongs to is preserved untouched.
    let newGroupIds: string[] | null = null;
    if (Array.isArray(body.groupIds)) {
      const selectedOtp = body.groupIds
        .map((g: unknown) => String(g))
        .filter((g: string) => otpIds.has(g));
      if (selectedOtp.length === 0)
        return NextResponse.json(
          { error: "Mindestens eine Gruppe muss ausgewählt werden." },
          { status: 400 },
        );
      const keptNonOtp = (current.userGroups ?? [])
        .map((g) => g.id)
        .filter((gid) => !otpIds.has(gid));
      newGroupIds = Array.from(new Set([...keptNonOtp, ...selectedOtp]));
    }

    // 1) Core user fields (mirrors the create payload shape).
    const email =
      body.email !== undefined
        ? String(body.email).trim()
        : (current.email ?? "");
    const displayName =
      body.displayName !== undefined
        ? String(body.displayName).trim() || current.username
        : (current.displayName ?? current.username);
    const disabled =
      body.disabled !== undefined ? !!body.disabled : !!current.disabled;

    await pocketIdFetch(`/api/users/${id}`, {
      method: "PUT",
      body: JSON.stringify({
        username: current.username,
        email,
        emailVerified: current.emailVerified ?? true,
        displayName,
        disabled,
        isAdmin: current.isAdmin ?? false,
      }),
    });

    // 2) Group membership.
    if (newGroupIds) {
      await pocketIdFetch(`/api/users/${id}/user-groups`, {
        method: "PUT",
        body: JSON.stringify({ userGroupIds: newGroupIds }),
      });
    }

    // 3) Custom claims — rebuild Discord/Minecraft while preserving any others.
    if (body.discordId !== undefined || body.minecraftUuid !== undefined) {
      const managed = new Set(["discord-id", "minecraft-uuid"]);
      const claims = (current.customClaims ?? []).filter(
        (c) => !managed.has(c.key.toLowerCase()),
      );
      const discordId = String(body.discordId ?? "").trim();
      const minecraftUuid = String(body.minecraftUuid ?? "").trim();
      if (discordId) claims.push({ key: "Discord-id", value: discordId });
      if (minecraftUuid)
        claims.push({ key: "Minecraft-uuid", value: minecraftUuid });

      await pocketIdFetch(`/api/custom-claims/user/${id}`, {
        method: "PUT",
        body: JSON.stringify(claims),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}

/** DELETE — remove a team member from PocketID. */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await checkAuth()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!id)
    return NextResponse.json({ error: "Missing user id" }, { status: 400 });

  try {
    await pocketIdFetch(`/api/users/${id}`, { method: "DELETE" });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return handleError(e);
  }
}
