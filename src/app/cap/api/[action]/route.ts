import { NextRequest, NextResponse } from "next/server";
import {
  CAP_WIDGET_ACTIONS,
  forwardCapRequest,
  type CapWidgetAction,
} from "@/lib/captcha";

/**
 * The Cap widget's API endpoint (`data-cap-api-endpoint="/cap/api/"`). The
 * widget posts to `/cap/api/challenge` and `/cap/api/redeem`; both are
 * forwarded to the Cap container, see `lib/captcha.ts`.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ action: string }> },
) {
  const { action } = await params;
  if (!(CAP_WIDGET_ACTIONS as readonly string[]).includes(action)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return forwardCapRequest(action as CapWidgetAction, req);
}
