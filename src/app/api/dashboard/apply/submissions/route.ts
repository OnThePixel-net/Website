import { NextRequest, NextResponse } from "next/server";
import { requirePermission } from "@/lib/authz";
import { LEVEL_READ } from "@/lib/permissions";
import { listApplySubmissions } from "@/lib/apply";
import { applyError, invalidId, parseId } from "../errors";

/**
 * GET — the applications that came in, newest first.
 *
 * Query parameters, all optional: `positionId`, `status` (`new` / `accepted` /
 * `rejected`), `limit` and `offset`. The answer carries `total` next to the
 * page so the dashboard can show "31–40 von 57" without fetching everything —
 * and so the overview tile can ask for the number of unread applications with
 * `?status=new&limit=1` instead of downloading them.
 *
 * There is no filter for applications whose position was deleted: their
 * `position_id` is `null`, which the data layer's positive-integer filter
 * cannot express. They show up unfiltered, labelled with the position name and
 * slug they were sent for.
 */
export async function GET(req: NextRequest) {
  const gate = await requirePermission("apply", LEVEL_READ);
  if (!gate.ok) return gate.response;

  const params = req.nextUrl.searchParams;
  // An absent *or empty* `positionId` means "every position" — the filter
  // select posts an empty value for its "Alle" option.
  const rawPositionId = params.get("positionId");
  const positionId = rawPositionId ? parseId(rawPositionId) : undefined;
  if (positionId === null) return invalidId();

  const status = params.get("status") || undefined;
  const limit = params.get("limit") || undefined;
  const offset = params.get("offset") || undefined;

  try {
    // `limit` and `offset` are clamped to the allowed page size by the data
    // layer, and an unknown `status` is rejected there as a validation error.
    const page = await listApplySubmissions({
      ...(positionId !== undefined && { positionId }),
      ...(status !== undefined && { status }),
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
    return applyError(e, "submissions GET");
  }
}
