import { auth } from "@/auth";
import { after, NextRequest, NextResponse } from "next/server";
import { ApplyValidationError, createApplySubmission } from "@/lib/apply";
import { notifyNewApplication } from "@/lib/apply-notify";

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

/** https://docs.hcaptcha.com — POST, application/x-www-form-urlencoded. */
const HCAPTCHA_VERIFY_URL = "https://api.hcaptcha.com/siteverify";

/**
 * Cap on the siteverify round trip. Without it a hanging hCaptcha would hold
 * the request (and its database connection) open for as long as the platform
 * allows.
 */
const VERIFY_TIMEOUT_MS = 10_000;

/** Rejected requests carry a stable `code` the form maps to a localized text. */
type Rejection = { status: number; code: string; message: string };

function reject({ status, code, message }: Rejection) {
  return NextResponse.json({ message, code }, { status });
}

/**
 * Verify an hCaptcha token with hCaptcha itself.
 *
 * A missing secret rejects the application. That is deliberate: without the
 * secret the captcha is decoration, and accepting unverified submissions would
 * turn the application inbox into a spam target that nobody notices until it is
 * full. A refused application is loud and recoverable; a silently unprotected
 * form is neither. The log line names the variable so whoever reads it knows
 * the fix.
 */
async function verifyCaptcha(token: unknown): Promise<Rejection | null> {
  const response = typeof token === "string" ? token.trim() : "";
  if (!response)
    return {
      status: 400,
      code: "captcha_required",
      message: "Captcha token is required",
    };

  const secret = process.env.HCAPTCHA_SECRET?.trim();
  if (!secret) {
    console.error(
      "[apply] HCAPTCHA_SECRET is not set — rejecting the application. " +
        "Set the hCaptcha secret key (server-side, never NEXT_PUBLIC_) or the " +
        "application form stays closed.",
    );
    return {
      status: 503,
      code: "captcha_unavailable",
      message: "Captcha verification is not configured",
    };
  }

  let payload: { success?: boolean; "error-codes"?: unknown };
  try {
    const res = await fetch(HCAPTCHA_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response }),
      cache: "no-store",
      signal: AbortSignal.timeout(VERIFY_TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`siteverify answered ${res.status}`);
    payload = await res.json();
  } catch (e) {
    // Unreachable or malformed: the token stays unverified, so the application
    // is refused rather than waved through.
    console.error("[apply] hCaptcha verification failed:", e);
    return {
      status: 502,
      code: "captcha_unavailable",
      message: "Captcha verification is currently unavailable",
    };
  }

  if (payload?.success !== true) {
    console.warn(
      "[apply] hCaptcha rejected a token:",
      payload?.["error-codes"] ?? [],
    );
    return {
      status: 400,
      code: "captcha_invalid",
      message: "Captcha verification failed",
    };
  }

  return null;
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
  const captchaRejection = await verifyCaptcha(body?.captchaToken);
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
