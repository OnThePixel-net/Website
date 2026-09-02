import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/authz";
import { LEVEL_WRITE } from "@/lib/permissions";
import { createApplyQuestion } from "@/lib/apply";
import { applyError, invalidId, parseId } from "../errors";

/**
 * POST — add a question to the position named by `positionId` in the body.
 *
 * The position lives in the body rather than in the path because a question is
 * addressed by its own id everywhere else; nesting it under
 * `/positions/[id]/questions` would give the same resource two names.
 */
export async function POST(req: NextRequest) {
  const gate = await requirePermission("apply", LEVEL_WRITE);
  if (!gate.ok) return gate.response;

  try {
    const body = await req.json();
    const positionId = parseId(String(body.positionId ?? ""));
    if (positionId === null) return invalidId();

    const question = await createApplyQuestion(positionId, {
      fieldKey: body.fieldKey,
      type: body.type,
      required: body.required,
      sortOrder: body.sortOrder,
      labelEn: body.labelEn,
      labelDe: body.labelDe,
      placeholderEn: body.placeholderEn,
      placeholderDe: body.placeholderDe,
      descriptionEn: body.descriptionEn,
      descriptionDe: body.descriptionDe,
    });
    return NextResponse.json({ data: question }, { status: 201 });
  } catch (e) {
    return applyError(e, "questions POST");
  }
}
