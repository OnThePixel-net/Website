import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  pocketIdFetch,
  fetchAllPages,
  otpGroupIds,
  isOtpMember,
  getClaim,
  PocketIdError,
  type PocketUser,
  type UserGroup,
} from "@/lib/pocketid";

async function checkAuth() {
  const session = await auth();
  return !!session;
}

function handleError(e: unknown) {
  if (e instanceof PocketIdError) {
    return NextResponse.json(
      { error: e.message, detail: e.body },
      { status: e.status >= 400 ? e.status : 500 },
    );
  }
  const msg = e instanceof Error ? e.message : String(e);
  console.error("[team route]", e);
  return NextResponse.json({ error: msg }, { status: 500 });
}

/** GET — list OTP team members and the available OTP groups. */
export async function GET() {
  if (!(await checkAuth()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const [groups, users] = await Promise.all([
      fetchAllPages<UserGroup>("/api/user-groups"),
      fetchAllPages<PocketUser>("/api/users"),
    ]);

    const otpIds = otpGroupIds(groups);
    const otpGroups = groups
      .filter((g) => otpIds.has(g.id))
      .map((g) => ({ id: g.id, name: g.name, friendlyName: g.friendlyName }));

    const members = users
      .filter((u) => isOtpMember(u, otpIds))
      .map((u) => ({
        id: u.id,
        username: u.username,
        displayName: u.displayName ?? u.username,
        email: u.email ?? "",
        disabled: !!u.disabled,
        discordId: getClaim(u, "Discord-id"),
        minecraftUuid: getClaim(u, "Minecraft-uuid"),
        groups: (u.userGroups ?? [])
          .filter((g) => otpIds.has(g.id))
          .map((g) => ({ id: g.id, friendlyName: g.friendlyName ?? g.name })),
      }));

    return NextResponse.json({ users: members, groups: otpGroups });
  } catch (e) {
    return handleError(e);
  }
}

/** POST — create a new team member via /api/signup, then set custom claims. */
export async function POST(req: NextRequest) {
  if (!(await checkAuth()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const username = String(body.username ?? "").trim();
    const groupId = String(body.groupId ?? "").trim();
    const discordId = String(body.discordId ?? "").trim();
    const minecraftUuid = String(body.minecraftUuid ?? "").trim();
    const email =
      String(body.email ?? "").trim() ||
      `${username.toLowerCase()}@onthepixel.net`;

    if (!username)
      return NextResponse.json(
        { error: "Username ist erforderlich." },
        { status: 400 },
      );
    if (!groupId)
      return NextResponse.json(
        { error: "Eine Gruppe muss ausgewählt werden." },
        { status: 400 },
      );

    // Ensure the chosen group is actually an OTP-team group.
    const groups = await fetchAllPages<UserGroup>("/api/user-groups");
    const otpIds = otpGroupIds(groups);
    if (!otpIds.has(groupId))
      return NextResponse.json(
        { error: "Ungültige Gruppe (keine OTP-Gruppe)." },
        { status: 400 },
      );

    // 1) Create the user account.
    const signupRes = await pocketIdFetch("/api/signup", {
      method: "POST",
      body: JSON.stringify({
        username,
        email,
        emailVerified: true,
        displayName: username,
        userGroupIds: [groupId],
        disabled: false,
        isAdmin: false,
      }),
    });
    const created = (await signupRes.json()) as PocketUser;

    // 2) Set the Discord / Minecraft custom claims on the new user.
    const claims = [
      { key: "Discord-id", value: discordId },
      { key: "Minecraft-uuid", value: minecraftUuid },
    ].filter((c) => c.value);

    let claimsWarning: string | undefined;
    if (created?.id && claims.length > 0) {
      try {
        await pocketIdFetch(`/api/custom-claims/user/${created.id}`, {
          method: "PUT",
          body: JSON.stringify(claims),
        });
      } catch (e) {
        claimsWarning =
          e instanceof PocketIdError
            ? `Nutzer angelegt, aber Custom Claims fehlgeschlagen: ${e.body || e.message}`
            : `Nutzer angelegt, aber Custom Claims fehlgeschlagen: ${String(e)}`;
      }
    }

    return NextResponse.json(
      { data: created, warning: claimsWarning },
      { status: 201 },
    );
  } catch (e) {
    return handleError(e);
  }
}
