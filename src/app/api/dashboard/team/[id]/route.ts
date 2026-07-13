import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { pocketIdFetch, PocketIdError } from "@/lib/pocketid";

async function checkAuth() {
  const session = await auth();
  return !!session;
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
    if (e instanceof PocketIdError)
      return NextResponse.json(
        { error: e.message, detail: e.body },
        { status: e.status >= 400 ? e.status : 500 },
      );
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
