import { NextResponse } from "next/server";
import { BugReportValidationError } from "@/lib/bug-reports";

/**
 * Error translation for the bug report routes: a validation error is a 400
 * with its German message, everything else is logged and answered with a 500.
 */
export function bugReportError(e: unknown, scope: string): NextResponse {
  if (e instanceof BugReportValidationError) {
    return NextResponse.json(
      { error: e.message, code: e.code },
      { status: 400 },
    );
  }
  console.error(`[bugs ${scope}]`, e);
  return NextResponse.json(
    { error: e instanceof Error ? e.message : String(e) },
    { status: 500 },
  );
}
