import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/authz";
import { LEVEL_DELETE, LEVEL_WRITE } from "@/lib/permissions";
import { deleteApplySubmission, updateApplySubmission } from "@/lib/apply";
import { applyError, invalidId, notFound, parseId } from "../../errors";

/**
 * PATCH — set the review status and/or the internal note of one application.
 *
 * `reviewed_at` follows the status in the data layer: stamped when the
 * application leaves `new`, cleared when it is put back. Saving only the note
 * leaves the decision date alone.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const gate = await requirePermission("apply", LEVEL_WRITE);
  if (!gate.ok) return gate.response;

  const { id } = await params;
  const submissionId = parseId(id);
  if (submissionId === null) return invalidId();

  try {
    const body = await req.json();
    const submission = await updateApplySubmission(submissionId, {
      ...(body.status !== undefined && { status: body.status }),
      ...(body.internalNote !== undefined && { internalNote: body.internalNote }),
    });
    if (!submission) return notFound();
    return NextResponse.json({ data: submission });
  } catch (e) {
    return applyError(e, "submissions PATCH");
  }
}

/**
 * DELETE — remove an application for good, answers and all.
 *
 * This is the one destructive action in the area that cannot be undone from
 * anywhere else: the applicant's own copy is not stored, so the dashboard asks
 * for a confirmation before calling it.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const gate = await requirePermission("apply", LEVEL_DELETE);
  if (!gate.ok) return gate.response;

  const { id } = await params;
  const submissionId = parseId(id);
  if (submissionId === null) return invalidId();

  try {
    if (!(await deleteApplySubmission(submissionId))) return notFound();
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    return applyError(e, "submissions DELETE");
  }
}
