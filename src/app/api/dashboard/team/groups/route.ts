import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  pocketIdFetch,
  OTP_TEAM_CLAIM,
  slugifyGroupName,
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
  const msg = e instanceof Error ? e.message : String(e);
  console.error("[team groups route]", e);
  return NextResponse.json({ error: msg }, { status: 500 });
}

/** POST — create a new OTP-team group (marked with the `Team=OTP` claim). */
export async function POST(req: NextRequest) {
  if (!(await checkAuth()))
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

    // 1) Create the group. `name` is the technical slug, `friendlyName` the
    //    display label the user typed.
    const res = await pocketIdFetch("/api/user-groups", {
      method: "POST",
      body: JSON.stringify({
        name: slugifyGroupName(name),
        friendlyName: name,
      }),
    });
    const created = (await res.json()) as UserGroup;

    // 2) Mark it as an OTP group and attach the prefix / weight claims.
    const claims: CustomClaim[] = [OTP_TEAM_CLAIM];
    if (prefix) claims.push({ key: "prefix", value: prefix });
    if (weight) claims.push({ key: "weight", value: weight });

    let claimsWarning: string | undefined;
    if (created?.id) {
      try {
        await pocketIdFetch(`/api/custom-claims/user-group/${created.id}`, {
          method: "PUT",
          body: JSON.stringify(claims),
        });
      } catch (e) {
        claimsWarning =
          e instanceof PocketIdError
            ? `Gruppe angelegt, aber Claims fehlgeschlagen: ${e.body || e.message}`
            : `Gruppe angelegt, aber Claims fehlgeschlagen: ${String(e)}`;
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
