import { auth } from "@/auth";
import { after, NextRequest, NextResponse } from "next/server";
import { BugReportValidationError, createBugReport } from "@/lib/bug-reports";
import { notifyNewBugReport } from "@/lib/bug-report-notify";
import { verifyCaptcha } from "@/lib/captcha";

/**
 * Endpoint the public bug report form posts to.
 *
 * No login is required — the captcha is the spam barrier. When the reporter is
 * signed in with Discord, that identity is attached from the server-side
 * session so the team can ask back; it is never read from the request body.
 */

/** Rejected requests carry a stable `code` the form maps to a localized text. */
type Rejection = { status: number; code: string; message: string };

function reject({ status, code, message }: Rejection) {
  return NextResponse.json({ message, code }, { status });
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return reject({
      status: 400,
      code: "report_invalid",
      message: "Invalid request body",
    });
  }

  // Before anything touches the database: an unverified request must not be
  // able to make the server do work on its behalf.
  const captchaRejection = await verifyCaptcha(
    body?.captchaToken,
    "bug-report",
  );
  if (captchaRejection) return reject(captchaRejection);

  const session = await auth();

  try {
    const report = await createBugReport({
      category: body?.category,
      title: body?.title,
      description: body?.description,
      steps: body?.steps,
      minecraftName: body?.minecraftName,
      discord: session?.user
        ? {
            id: session.user.discordId,
            username: session.user.name,
            avatarUrl: session.user.image,
          }
        : null,
    });

    after(() => notifyNewBugReport(report.category));
  } catch (e) {
    if (e instanceof BugReportValidationError) {
      return reject({ status: 400, code: e.code, message: e.message });
    }
    console.error("[bug-report] storing the report failed:", e);
    return reject({
      status: 500,
      code: "server_error",
      message: "Submission failed",
    });
  }

  return NextResponse.json({ success: true });
}
