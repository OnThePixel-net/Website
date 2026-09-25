/**
 * Server side of Cap (https://trycap.dev), the self-hosted proof-of-work
 * captcha that protects the public forms (applications, bug reports).
 *
 * Cap runs as its own container, "Cap Standalone". The site talks to it in two
 * ways, both server-side:
 *
 *  - The widget's challenge/redeem requests go through `/cap/api/<action>`
 *    ({@link forwardCapRequest}), so the browser only ever talks to this
 *    origin. The Cap container therefore does not need to be reachable from
 *    the internet — which it must not be anyway, because it trusts
 *    `X-Forwarded-For` for its rate limiting.
 *  - Tokens are checked with {@link verifyCaptcha} against `/siteverify`.
 *
 * Configuration, all server-side and read at request time:
 *
 *   CAP_URL       base URL of the Cap container, e.g. http://cap:3000
 *   CAP_SITE_KEY  the site key created in the Cap dashboard
 *   CAP_SECRET    that key's secret (not the dashboard's ADMIN_KEY)
 */

/** Cap on each round trip to the Cap container. */
const CAP_TIMEOUT_MS = 10_000;

/** Largest widget request forwarded; a redeem body is a few kilobytes. */
const MAX_FORWARD_BYTES = 256 * 1024;

/** The two widget endpoints that are forwarded. */
export const CAP_WIDGET_ACTIONS = ["challenge", "redeem"] as const;
export type CapWidgetAction = (typeof CAP_WIDGET_ACTIONS)[number];

/** Rejected requests carry a stable `code` the form maps to a localized text. */
export type CaptchaRejection = {
  status: number;
  code: string;
  message: string;
};

interface CapConfig {
  url: string;
  siteKey: string;
  secret: string;
}

function readCapConfig(): CapConfig | null {
  const url = process.env.CAP_URL?.trim().replace(/\/+$/, "");
  const siteKey = process.env.CAP_SITE_KEY?.trim();
  const secret = process.env.CAP_SECRET?.trim();
  if (!url || !siteKey || !secret) return null;
  return { url, siteKey, secret };
}

function siteKeyUrl(config: CapConfig, path: string): string {
  return `${config.url}/${encodeURIComponent(config.siteKey)}/${path}`;
}

/**
 * The client IP as seen by the reverse proxy in front of the site, handed on
 * to Cap so its per-IP rate limit does not put every visitor in one bucket.
 */
function clientIp(headers: Headers): string | null {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || headers.get("x-real-ip")?.trim() || null;
}

/**
 * Forward one widget request (`challenge` or `redeem`) to the Cap container
 * and hand its answer back unchanged.
 */
export async function forwardCapRequest(
  action: CapWidgetAction,
  req: Request,
): Promise<Response> {
  const config = readCapConfig();
  if (!config) {
    console.error(
      "[captcha] CAP_URL, CAP_SITE_KEY or CAP_SECRET is not set — the captcha " +
        "widget cannot load and the protected forms stay closed.",
    );
    return Response.json(
      { success: false, error: "Captcha is not configured" },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  const body = await req.text();
  if (body.length > MAX_FORWARD_BYTES) {
    return Response.json(
      { success: false, error: "Request too large" },
      { status: 413, headers: { "Cache-Control": "no-store" } },
    );
  }

  const headers: Record<string, string> = {
    "Content-Type": req.headers.get("content-type") ?? "application/json",
  };
  const ip = clientIp(req.headers);
  if (ip) headers["X-Forwarded-For"] = ip;

  try {
    const res = await fetch(siteKeyUrl(config, action), {
      method: "POST",
      headers,
      body: body || undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(CAP_TIMEOUT_MS),
    });
    return new Response(await res.text(), {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("content-type") ?? "application/json",
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error(`[captcha] forwarding ${action} to Cap failed:`, e);
    return Response.json(
      { success: false, error: "Captcha is currently unavailable" },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}

/**
 * Verify a Cap token with the Cap container. Tokens are single-use: a verified
 * token is spent, so this runs exactly once per submission.
 *
 * Missing configuration rejects the submission. That is deliberate: without
 * verification the captcha is decoration, and a form open to scripted spam is
 * worse than one that is temporarily closed. The log line names the variables.
 *
 * `logTag` prefixes the log lines ("apply", "bug-report").
 */
export async function verifyCaptcha(
  token: unknown,
  logTag: string,
): Promise<CaptchaRejection | null> {
  const response = typeof token === "string" ? token.trim() : "";
  if (!response)
    return {
      status: 400,
      code: "captcha_required",
      message: "Captcha token is required",
    };

  const config = readCapConfig();
  if (!config) {
    console.error(
      `[${logTag}] CAP_URL, CAP_SITE_KEY or CAP_SECRET is not set — rejecting ` +
        "the submission. Set all three (server-side, never NEXT_PUBLIC_) or " +
        "the form stays closed.",
    );
    return {
      status: 503,
      code: "captcha_unavailable",
      message: "Captcha verification is not configured",
    };
  }

  let payload: { success?: boolean };
  try {
    const res = await fetch(siteKeyUrl(config, "siteverify"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: config.secret, response }),
      cache: "no-store",
      signal: AbortSignal.timeout(CAP_TIMEOUT_MS),
    });
    // A rejected token may come back as a non-2xx with a JSON body, so the
    // body decides, not the status — unless there is no JSON at all.
    payload = await res.json();
  } catch (e) {
    // Unreachable or malformed: the token stays unverified, so the submission
    // is refused rather than waved through.
    console.error(`[${logTag}] Cap verification failed:`, e);
    return {
      status: 502,
      code: "captcha_unavailable",
      message: "Captcha verification is currently unavailable",
    };
  }

  if (payload?.success !== true) {
    console.warn(`[${logTag}] Cap rejected a token.`);
    return {
      status: 400,
      code: "captcha_invalid",
      message: "Captcha verification failed",
    };
  }

  return null;
}
