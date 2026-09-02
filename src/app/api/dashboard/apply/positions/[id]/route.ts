import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/authz";
import { LEVEL_DELETE, LEVEL_WRITE } from "@/lib/permissions";
import { deleteApplyPosition, updateApplyPosition } from "@/lib/apply";
import { applyError, invalidId, notFound, parseId } from "../../errors";

/**
 * PATCH — change name, slug, descriptions, order and/or the open/closed status.
 *
 * Only the keys present in the body are written, which is what lets the
 * positions list flip a switch without resending the whole row.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const gate = await requirePermission("apply", LEVEL_WRITE);
  if (!gate.ok) return gate.response;

  const { id } = await params;
  const positionId = parseId(id);
  if (positionId === null) return invalidId();

  try {
    const body = await req.json();
    const position = await updateApplyPosition(positionId, {
      // `undefined` means "not sent"; the data layer distinguishes that from an
      // empty string, which clears a description.
      ...(body.name !== undefined && { name: body.name }),
      ...(body.slug !== undefined && { slug: body.slug }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.sortOrder !== undefined && { sortOrder: body.sortOrder }),
      ...(body.descriptionEn !== undefined && { descriptionEn: body.descriptionEn }),
      ...(body.descriptionDe !== undefined && { descriptionDe: body.descriptionDe }),
    });
    if (!position) return notFound();
    return NextResponse.json({ data: position });
  } catch (e) {
    return applyError(e, "positions PATCH");
  }
}

/**
 * DELETE — remove a position and its questions.
 *
 * The applications that were sent for it stay: their `position_id` becomes
 * `null` and they keep the position's name and slug in their own columns. The
 * dashboard says so before it asks for the confirmation.
 */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const gate = await requirePermission("apply", LEVEL_DELETE);
  if (!gate.ok) return gate.response;

  const { id } = await params;
  const positionId = parseId(id);
  if (positionId === null) return invalidId();

  try {
    if (!(await deleteApplyPosition(positionId))) return notFound();
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    return applyError(e, "positions DELETE");
  }
}
