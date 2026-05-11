// ⚠️ INTENTIONALLY VULNERABLE FILE FOR SECURITY REVIEW TESTING ⚠️

import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // VULN: Open redirect - user-controlled URL with no validation
  const next = searchParams.get("next") || "/";
  return NextResponse.redirect(next);
}
