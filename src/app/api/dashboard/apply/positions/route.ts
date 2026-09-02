import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/authz";
import { LEVEL_READ, LEVEL_WRITE } from "@/lib/permissions";
import {
  createApplyPosition,
  listApplyPositionsWithQuestions,
} from "@/lib/apply";
import { applyError } from "../errors";

/**
 * GET — every position with its questions, open and closed alike.
 *
 * The dashboard edits both, so unlike the public site this does not pass
 * `onlyOpen`. The questions ride along because the editor needs them anyway and
 * a position without its questions is not something any view here shows.
 */
export async function GET() {
  const gate = await requirePermission("apply", LEVEL_READ);
  if (!gate.ok) return gate.response;
  try {
    return NextResponse.json({ data: await listApplyPositionsWithQuestions() });
  } catch (e) {
    return applyError(e, "positions GET");
  }
}

/** POST — create a position. It starts closed; see `createApplyPosition`. */
export async function POST(req: NextRequest) {
  const gate = await requirePermission("apply", LEVEL_WRITE);
  if (!gate.ok) return gate.response;
  try {
    const body = await req.json();
    const position = await createApplyPosition({
      name: body.name,
      slug: body.slug,
      status: body.status,
      sortOrder: body.sortOrder,
      descriptionEn: body.descriptionEn,
      descriptionDe: body.descriptionDe,
    });
    return NextResponse.json({ data: { ...position, questions: [] } }, { status: 201 });
  } catch (e) {
    return applyError(e, "positions POST");
  }
}
