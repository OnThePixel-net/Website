import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/authz";
import { LEVEL_WRITE } from "@/lib/permissions";
import { reorderApplyQuestions } from "@/lib/apply";
import { applyError, invalidId, parseId } from "../../errors";

/**
 * PUT — persist the order of one position's questions. The body carries the
 * position and the full list of its question ids in the wanted order; each
 * index becomes that question's `sort_order`, which is the order the public
 * form renders the fields in.
 *
 * Reordering changes rows, it does not remove any — so this is LEVEL_WRITE, not
 * LEVEL_DELETE, despite being a PUT on a list. Levels follow what a handler
 * does, never its HTTP verb (same reasoning as `creators/order`).
 */
export async function PUT(req: NextRequest) {
  const gate = await requirePermission("apply", LEVEL_WRITE);
  if (!gate.ok) return gate.response;

  try {
    const body = await req.json();
    const positionId = parseId(String(body.positionId ?? ""));
    if (positionId === null) return invalidId();

    if (!Array.isArray(body.ids))
      return NextResponse.json(
        { error: "ids muss eine Liste von Frage-IDs sein." },
        { status: 400 },
      );

    // Ids that do not belong to this position are dropped by the data layer
    // rather than rejected, and unmentioned questions keep their relative order
    // behind the listed ones — a second open tab cannot lose a question here.
    return NextResponse.json({
      data: await reorderApplyQuestions(positionId, body.ids),
    });
  } catch (e) {
    return applyError(e, "questions order PUT");
  }
}
