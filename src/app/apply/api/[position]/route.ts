import { auth } from "@/auth";
import { after, NextRequest, NextResponse } from "next/server";
import { ApplyValidationError, createApplySubmission } from "@/lib/apply";
import { notifyNewApplication } from "@/lib/apply-notify";
import { verifyCaptcha } from "@/lib/captcha";

/**
 * Endpoint the public application form posts to.
 *
 * `[position]` is the slug of the position, so the URLs the form has always
 * used (`/apply/api/builder`, `.../developer`, `.../supporter`) keep working
 * and a position added in the dashboard needs no code change.
 *
 * Applications used to be forwarded to api.onthepixel.net, which also verified
 * the captcha. They are stored locally now, so the captcha is verified here —
 * see {@link verifyCaptcha}.
 */

/** Rejected requests carry a stable `code` the form maps to a localized text. */
type Rejection = { status: number; code: string; message: string };

function reject({ status, code, message }: Rejection) {
  return NextResponse.json({ message, code }, { status });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ position: string }> },
) {
  const session = await auth();

  if (!session?.user) {
    return reject({
      status: 401,
      code: "login_required",
      message: "Unauthorized",
    });
  }

  const { position } = await params;

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return reject({
      status: 400,
      code: "answers_invalid",
      message: "Invalid request body",
    });
  }

  // Before anything touches the database: an unverified request must not be
  // able to make the server do work on its behalf.
  const captchaRejection = await verifyCaptcha(body?.captchaToken, "apply");
  if (captchaRejection) return reject(captchaRejection);

  try {
    // The Discord identity comes from the server-side session and is never
    // read from the request body — that is what makes the applications in the
    // inbox attributable. `createApplySubmission` re-checks that the position
    // exists and is open, so a form left open while it closed cannot post.
    const submission = await createApplySubmission({
      positionSlug: position,
      discord: {
        id: session.user.discordId,
        username: session.user.name,
        avatarUrl: session.user.image,
      },
      answers: body?.applicationData,
    });

    // Announced after the response is on its way, not before it: the applicant
    // waits for their own submission, never for Discord, and a channel that is
    // unreachable can then no longer show up as a failed application. The name
    // is taken from the stored row rather than the URL slug, so the notice says
    // "Java Developer" where the slug says "developer".
    after(() => notifyNewApplication(submission.positionName));
  } catch (e) {
    if (e instanceof ApplyValidationError) {
      return reject({
        // A closed (or unknown) position answered 403 while the submission was
        // still forwarded to the external API; that is kept.
        status: e.code === "position_closed" ? 403 : 400,
        code: e.code,
        message: e.message,
      });
    }
    console.error("[apply] storing the application failed:", e);
    return reject({
      status: 500,
      code: "server_error",
      message: "Submission failed",
    });
  }

  return NextResponse.json({ success: true });
}
