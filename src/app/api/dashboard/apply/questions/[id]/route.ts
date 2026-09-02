import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/authz";
import { LEVEL_DELETE, LEVEL_WRITE } from "@/lib/permissions";
import { deleteApplyQuestion, updateApplyQuestion } from "@/lib/apply";
import { applyError, invalidId, notFound, parseId } from "../../errors";

/**
 * PATCH — change a question. Every field is optional; what is not sent stays.
 *
 * Editing a question does not touch the applications that already answered it:
 * each of them carries its own copy of the wording (see `apply_submissions`).
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const gate = await requirePermission("apply", LEVEL_WRITE);
  if (!gate.ok) return gate.response;

  const { id } = await params;
  const questionId = parseId(id);
  if (questionId === null) return invalidId();

  try {
    const body = await req.json();
    const question = await updateApplyQuestion(questionId, {
      ...(body.fieldKey !== undefined && { fieldKey: body.fieldKey }),
      ...(body.type !== undefined && { type: body.type }),
      ...(body.required !== undefined && { required: body.required }),
      ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
      ...(body.labelEn !== undefined && { labelEn: body.labelEn }),
      ...(body.labelDe !== undefined && { labelDe: body.labelDe }),
      ...(body.placeholderEn !== undefined && { placeholderEn: body.placeholderEn }),
      ...(body.placeholderDe !== undefined && { placeholderDe: body.placeholderDe }),
      ...(body.descriptionEn !== undefined && { descriptionEn: body.descriptionEn }),
      ...(body.descriptionDe !== undefined && { descriptionDe: body.descriptionDe }),
    });
    if (!question) return notFound();
    return NextResponse.json({ data: question });
  } catch (e) {
    return applyError(e, "questions PATCH");
  }
}

/**
 * DELETE — remove a question from its position's form.
 *
 * Applications that answered it keep the answer and its label; only the form
 * stops asking.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const gate = await requirePermission("apply", LEVEL_DELETE);
  if (!gate.ok) return gate.response;

  const { id } = await params;
  const questionId = parseId(id);
  if (questionId === null) return invalidId();

  try {
    if (!(await deleteApplyQuestion(questionId))) return notFound();
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    return applyError(e, "questions DELETE");
  }
}
