import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/authz";
import { LEVEL_READ } from "@/lib/permissions";
import { listBugReports } from "@/lib/bug-reports";
import { bugReportError } from "./errors";

/**
 * GET — the bug reports that came in, newest first.
 *
 * Query parameters, all optional: `status` (`new` / `in_progress` / `fixed` /
 * `rejected`), `category`, `limit` and `offset`. The answer carries `total` so
 * the overview tile can ask for the number of new reports with
 * `?status=new&limit=1`.
 */
export async function GET(req: NextRequest) {
  const gate = await requirePermission("bugs", LEVEL_READ);
  if (!gate.ok) return gate.response;

  const params = req.nextUrl.searchParams;
  const status = params.get("status") || undefined;
  const category = params.get("category") || undefined;
  const limit = params.get("limit") || undefined;
  const offset = params.get("offset") || undefined;

  try {
    const page = await listBugReports({
      ...(status !== undefined && { status }),
      ...(category !== undefined && { category }),
      ...(limit !== undefined && { limit: Number(limit) }),
      ...(offset !== undefined && { offset: Number(offset) }),
    });

    return NextResponse.json({
      data: page.items,
      total: page.total,
      limit: page.limit,
      offset: page.offset,
    });
  } catch (e) {
    return bugReportError(e, "GET");
  }
}
