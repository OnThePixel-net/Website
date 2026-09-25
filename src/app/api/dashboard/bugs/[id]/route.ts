import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/authz";
import { LEVEL_DELETE, LEVEL_WRITE } from "@/lib/permissions";
import { deleteBugReport, updateBugReport } from "@/lib/bug-reports";
import { invalidId, notFound, parseId } from "../../apply/errors";
import { bugReportError } from "../errors";

/** PATCH — set the status and/or the internal note of one report. */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const gate = await requirePermission("bugs", LEVEL_WRITE);
  if (!gate.ok) return gate.response;

  const { id } = await params;
  const reportId = parseId(id);
  if (reportId === null) return invalidId();

  try {
    const body = await req.json();
    const report = await updateBugReport(reportId, {
      ...(body.status !== undefined && { status: body.status }),
      ...(body.internalNote !== undefined && {
        internalNote: body.internalNote,
      }),
    });
    if (!report) return notFound();
    return NextResponse.json({ data: report });
  } catch (e) {
    return bugReportError(e, "PATCH");
  }
}

/** DELETE — remove a report for good. */
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const gate = await requirePermission("bugs", LEVEL_DELETE);
  if (!gate.ok) return gate.response;

  const { id } = await params;
  const reportId = parseId(id);
  if (reportId === null) return invalidId();

  try {
    if (!(await deleteBugReport(reportId))) return notFound();
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    return bugReportError(e, "DELETE");
  }
}
