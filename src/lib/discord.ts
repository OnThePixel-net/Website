/**
 * Server-side helper for the Discord REST API (v10).
 *
 * Deliberately REST-only — plain `fetch`, no discord.js, no gateway
 * (WebSocket) connection:
 *
 *  - Every call here is a point operation triggered by a dashboard HTTP
 *    request ("this creator now has that role"). Request/response is exactly
 *    the right shape for that; there is nothing to listen for.
 *  - A gateway bot would be a second, permanently running process with its own
 *    lifecycle next to the Next.js server. For handing out roles that buys
 *    nothing and costs operations.
 *  - The Next.js server may exist more than once (container restarts, several
 *    replicas), while a bot account may hold only one gateway connection at a
 *    time. A stateless REST call has no such constraint.
 *
 * The same reasoning covers the dependency: `fetch` is enough, so this module
 * stays a single file with no third-party code in the trust path of a token
 * that can hand out roles on the whole server.
 *
 * This module is server-only — the bot token must never reach the browser.
 *
 * ## What the operator has to set up once
 *
 * 1. Discord Developer Portal → Applications → <app> → Bot → "Reset Token".
 *    Put the value in `DISCORD_BOT_TOKEN`.
 * 2. Invite the bot with the `bot` OAuth2 scope and the `Manage Roles`
 *    permission (`MANAGE_ROLES`, bit `0x10000000` = 268435456):
 *    `https://discord.com/oauth2/authorize?client_id=<APP_ID>&scope=bot&permissions=268435456`
 *    No privileged gateway intent is required. `GET /guilds/{id}/members/{id}`
 *    reads a single member without `GUILD_MEMBERS`; that intent only gates the
 *    gateway member events and the *list*-members endpoint, neither of which
 *    this module uses.
 * 3. Server Settings → Roles: drag the bot's own role ABOVE every role it is
 *    supposed to hand out. Discord refuses any role change on a role that sits
 *    at or above the bot's highest role, even with `MANAGE_ROLES`, and answers
 *    403 with JSON code 50013. This is by far the most common failure of an
 *    integration like this, so {@link DiscordError} spells the fix out in its
 *    message instead of just reporting "Forbidden".
 * 4. Enable Developer Mode (User Settings → Advanced), right-click the server →
 *    "Copy Server ID" and put that into `DISCORD_GUILD_ID`.
 *
 * Both variables are read on the server only. A `NEXT_PUBLIC_` prefix would
 * publish the bot token to every visitor and hand over the whole guild.
 *
 * Endpoints, status codes and rate-limit semantics used below were taken from
 * the official documentation (docs.discord.com/developers): "Resources /
 * Guild", "Topics / Rate Limits" and "Topics / Opcodes and Status Codes".
 */

/** Base URL of the Discord REST API. The version is pinned on purpose. */
export const DISCORD_API_BASE =
  process.env.DISCORD_API_URL ?? "https://discord.com/api/v10";

/**
 * Discord requires a `DiscordBot ($url, $version)` user agent and lets its
 * Cloudflare layer block requests that do not identify themselves.
 */
const USER_AGENT = "DiscordBot (https://onthepixel.net, 1.0)";

/** Budget for a single attempt. Discord must never stall a dashboard request. */
const REQUEST_TIMEOUT_MS = 10_000;

/** First try plus two retries. */
const MAX_ATTEMPTS = 3;

/**
 * Longest `retry_after` we are willing to sit out. Beyond this the 429 is
 * surfaced as an error rather than parked in front of a user's request; the
 * dashboard can say "try again in a moment" instead of hanging.
 */
const MAX_RETRY_WAIT_MS = 5_000;

/** `X-Audit-Log-Reason` accepts 1–512 URL-encoded UTF-8 characters. */
const MAX_AUDIT_REASON_LENGTH = 512;

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * The slice of a guild-member object this project needs. Discord returns a good
 * deal more; typing only what is consumed keeps the module from pretending to
 * be a complete Discord type model.
 */
export interface DiscordGuildMember {
  /** Ids of every role the member currently carries. */
  roles: string[];
  /** Server nickname, `null` when the member has none. */
  nick?: string | null;
  /** ISO timestamp of when the member joined the guild. */
  joined_at?: string;
  /** The underlying user. Always present on this REST route. */
  user?: {
    id: string;
    username: string;
    global_name?: string | null;
    avatar?: string | null;
  };
}

/** The slice of a role object the dashboard's role picker needs. */
export interface DiscordRole {
  /** Role snowflake. */
  id: string;
  /** Display name. */
  name: string;
  /** Integer RGB value; `0` means "no colour" and inherits from lower roles. */
  color: number;
  /** Position in the hierarchy — a higher number sits higher in the list. */
  position: number;
  /** True for roles Discord manages itself (bot roles, boosters, …). */
  managed?: boolean;
  /** True when the role is shown separately in the member list. */
  hoist?: boolean;
}

/** The error payload Discord sends with a non-2xx response. */
interface DiscordErrorBody {
  message?: string;
  /** Discord's own numeric error code, e.g. 50013 "Missing Permissions". */
  code?: number;
  /** Seconds (fractional) to wait, on a 429. */
  retry_after?: number;
  /** True when the 429 came from the global 50-requests-per-second limit. */
  global?: boolean;
}

/**
 * Thrown when a Discord request fails. Carries the upstream status code, the
 * raw body and Discord's own JSON error code so a calling route can log or
 * forward them.
 */
export class DiscordError extends Error {
  /** Upstream HTTP status, or 500/504 for configuration/transport failures. */
  status: number;
  /** Raw upstream response body (may be empty). */
  body: string;
  /** Discord's JSON error code, when the response carried one. */
  code?: number;
  constructor(message: string, status: number, body: string, code?: number) {
    super(message);
    this.name = "DiscordError";
    this.status = status;
    this.body = body;
    this.code = code;
  }
}

/* -------------------------------------------------------------------------- */
/*  Configuration                                                             */
/* -------------------------------------------------------------------------- */

export function getBotToken(): string {
  return process.env.DISCORD_BOT_TOKEN ?? "";
}

export function getGuildId(): string {
  return process.env.DISCORD_GUILD_ID ?? "";
}

/**
 * True when both the bot token and the guild id are present. Lets a caller
 * decide up front whether to offer the Discord parts of a form at all —
 * everything below throws a {@link DiscordError} rather than doing nothing
 * quietly when the configuration is incomplete.
 */
export function isDiscordConfigured(): boolean {
  return Boolean(getBotToken() && getGuildId());
}

function requireConfig(): { token: string; guildId: string } {
  const token = getBotToken();
  if (!token) {
    throw new DiscordError(
      "Discord bot token is not configured (set the `DISCORD_BOT_TOKEN` environment variable to the token from the Developer Portal).",
      500,
      "",
    );
  }
  const guildId = getGuildId();
  if (!guildId) {
    throw new DiscordError(
      'Discord guild id is not configured (set the `DISCORD_GUILD_ID` environment variable to the server id; enable Developer Mode in Discord and use right-click → "Copy Server ID").',
      500,
      "",
    );
  }
  return { token, guildId };
}

/* -------------------------------------------------------------------------- */
/*  Low-level request handling                                                */
/* -------------------------------------------------------------------------- */

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

function parseErrorBody(body: string): DiscordErrorBody {
  try {
    const json: unknown = JSON.parse(body);
    return json && typeof json === "object" ? (json as DiscordErrorBody) : {};
  } catch {
    return {};
  }
}

/**
 * Percent-encode an audit-log reason and keep it inside Discord's 512-character
 * limit. Truncation happens on the raw string, never on the encoded one — that
 * would risk cutting a `%XX` escape in half and producing an invalid header.
 */
function encodeAuditReason(reason: string): string | null {
  let raw = reason.trim();
  if (!raw) return null;
  let encoded = encodeURIComponent(raw);
  while (encoded.length > MAX_AUDIT_REASON_LENGTH && raw.length > 0) {
    raw = raw.slice(0, Math.max(0, Math.floor(raw.length * 0.8)));
    encoded = encodeURIComponent(raw);
  }
  return encoded || null;
}

/**
 * How long to wait after a 429.
 *
 * The JSON body's `retry_after` is a fractional value in SECONDS and the most
 * precise signal; `X-RateLimit-Reset-After` carries the same information and
 * `Retry-After` a rounded-up version of it. A small cushion is added so a
 * marginally early retry does not immediately earn a second 429 — those count
 * towards Discord's invalid-request budget (10 000 per 10 minutes across 401,
 * 403 and non-shared 429 answers) which ends in a Cloudflare IP ban.
 */
function retryAfterMs(res: Response, err: DiscordErrorBody): number | null {
  const header =
    res.headers.get("x-ratelimit-reset-after") ??
    res.headers.get("retry-after");
  const fromHeader = header != null ? Number.parseFloat(header) : Number.NaN;
  const seconds =
    typeof err.retry_after === "number" && Number.isFinite(err.retry_after)
      ? err.retry_after
      : Number.isFinite(fromHeader)
        ? fromHeader
        : null;
  if (seconds == null || seconds < 0) return null;
  return Math.ceil(seconds * 1000) + 50;
}

/** True when a 429 came from the global limit rather than from one bucket. */
function isGlobalLimit(res: Response, err: DiscordErrorBody): boolean {
  return (
    err.global === true ||
    res.headers.get("x-ratelimit-global") != null ||
    res.headers.get("x-ratelimit-scope") === "global"
  );
}

/**
 * Turn an upstream failure into a message an operator can act on. The 403 case
 * gets the most attention on purpose: it is almost always the role hierarchy,
 * and a bare "403 Forbidden" sends people looking in the wrong place.
 *
 * @param what short description of the attempted operation, e.g.
 *   `adding role 123 to member 456`.
 */
function describeFailure(
  status: number,
  err: DiscordErrorBody,
  what: string,
  res?: Response,
): string {
  const detail = err.message
    ? ` Discord says: ${err.message}${err.code != null ? ` (code ${err.code})` : ""}.`
    : "";

  switch (status) {
    case 401:
      return `Discord rejected the bot token while ${what}. Check DISCORD_BOT_TOKEN — resetting the token in the Developer Portal invalidates the previous one immediately.${detail}`;

    case 403:
      if (err.code === 50013) {
        return `Discord denied ${what}: the bot is missing permissions. Give the bot's role the "Manage Roles" permission AND drag that role ABOVE every role it hands out (Server Settings → Roles). A bot can never modify a role that sits at or above its own highest role, no matter which permissions it has.${detail}`;
      }
      if (err.code === 50001) {
        return `Discord denied ${what}: the bot has no access to guild ${getGuildId()}. Make sure the bot is actually a member of that server and that DISCORD_GUILD_ID names the right one.${detail}`;
      }
      return `Discord denied ${what} (403). The usual cause is the bot's role sitting too low in Server Settings → Roles, or a missing "Manage Roles" permission.${detail}`;

    case 404:
      if (err.code === 10004) {
        return `Discord does not know guild ${getGuildId()} while ${what}. Either DISCORD_GUILD_ID is wrong or the bot was removed from that server.${detail}`;
      }
      if (err.code === 10011) {
        return `Discord does not know the role referenced while ${what}. It was probably deleted on the server — pick an existing role.${detail}`;
      }
      if (err.code === 10007 || err.code === 10013) {
        return `That user is not a member of the Discord server (while ${what}). They have to join the OTP Discord before a role can be assigned — or the entered Discord user id is wrong.${detail}`;
      }
      return `Discord returned 404 while ${what}.${detail}`;

    case 429: {
      const scope = res && isGlobalLimit(res, err) ? "global " : "";
      return `Discord ${scope}rate limit hit while ${what} and it did not clear within the retry budget. Try again in a moment.${detail}`;
    }

    default:
      if (status >= 500) {
        return `Discord is having trouble (${status}) while ${what}. This is an upstream outage — retry later; https://discordstatus.com shows the current state.${detail}`;
      }
      return `Discord request failed with ${status} while ${what}.${detail}`;
  }
}

interface DiscordFetchOpts {
  /** Short description of the operation, used verbatim in error messages. */
  what: string;
  /**
   * Statuses that are a legitimate outcome rather than a failure. Used for the
   * 404 of a member lookup, which means "not on this server".
   */
  allow?: number[];
  /** Reason recorded in the server's audit log (audit-capable routes only). */
  reason?: string;
}

/**
 * Perform one Discord API request with a timeout, bounded retries and
 * rate-limit handling.
 *
 * Retries cover exactly the transient cases: a 429 whose cooldown is short
 * enough to wait out, a 5xx, and a timeout or transport error. Everything else
 * — a bad token, a missing permission, an unknown role — is deterministic and
 * is raised immediately instead of being hammered at Discord three times.
 */
async function discordFetch(
  path: string,
  init: RequestInit,
  opts: DiscordFetchOpts,
): Promise<Response> {
  const { token } = requireConfig();

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bot ${token}`);
  headers.set("Accept", "application/json");
  headers.set("User-Agent", USER_AGENT);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (opts.reason) {
    const encoded = encodeAuditReason(opts.reason);
    if (encoded) headers.set("X-Audit-Log-Reason", encoded);
  }

  for (let attempt = 1; ; attempt++) {
    let res: Response;
    try {
      res = await fetch(`${DISCORD_API_BASE}${path}`, {
        ...init,
        // Role changes and membership checks must never be served from a cache.
        cache: "no-store",
        headers,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (e) {
      // An abort (timeout) or a transport error. Worth one more try, but not
      // an endless one — the caller is a user-facing dashboard request.
      if (attempt < MAX_ATTEMPTS) {
        await sleep(250 * 2 ** (attempt - 1));
        continue;
      }
      throw new DiscordError(
        `Discord did not answer within ${REQUEST_TIMEOUT_MS} ms while ${opts.what} (${MAX_ATTEMPTS} attempts).`,
        504,
        e instanceof Error ? e.message : String(e),
      );
    }

    if (res.ok || opts.allow?.includes(res.status)) return res;

    const body = await res.text().catch(() => "");
    const err = parseErrorBody(body);

    if (res.status === 429 && attempt < MAX_ATTEMPTS) {
      const waitMs = retryAfterMs(res, err);
      if (waitMs != null && waitMs <= MAX_RETRY_WAIT_MS) {
        if (isGlobalLimit(res, err)) {
          // The global limit (50 req/s per bot) is shared by every route, so
          // this is worth a log line: it means something else is hammering the
          // API, not that this particular call is too chatty.
          console.warn(
            `[discord] global rate limit hit while ${opts.what}; waiting ${waitMs} ms`,
          );
        }
        await sleep(waitMs);
        continue;
      }
    }

    if (res.status >= 500 && attempt < MAX_ATTEMPTS) {
      await sleep(250 * 2 ** (attempt - 1));
      continue;
    }

    throw new DiscordError(
      describeFailure(res.status, err, opts.what, res),
      res.status,
      body,
      err.code,
    );
  }
}

/* -------------------------------------------------------------------------- */
/*  Guild members                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Read a guild member. Returns `null` when the user is not on the server.
 *
 * `GET /guilds/{guild.id}/members/{user.id}` answers 200 with the member object
 * or 404 (JSON code 10007 "Unknown Member" / 10013 "Unknown User") when they
 * are not a member. That 404 is a regular result, not an error — a 404 carrying
 * code 10004 ("Unknown Guild") is a misconfiguration and still throws, as does
 * every 401/403/5xx.
 */
export async function getGuildMember(
  userId: string,
): Promise<DiscordGuildMember | null> {
  const { guildId } = requireConfig();
  const res = await discordFetch(
    `/guilds/${encodeURIComponent(guildId)}/members/${encodeURIComponent(userId)}`,
    {},
    { what: `looking up member ${userId}`, allow: [404] },
  );

  if (res.status === 404) {
    const body = await res.text().catch(() => "");
    const err = parseErrorBody(body);
    if (err.code === 10004) {
      throw new DiscordError(
        describeFailure(404, err, `looking up member ${userId}`, res),
        404,
        body,
        err.code,
      );
    }
    return null;
  }

  return (await res.json()) as DiscordGuildMember;
}

/**
 * True when the user is on the configured Discord server. Use this before
 * creating a team member or creator so the failure can be reported as "this
 * person is not in our Discord" instead of surfacing later as a role error.
 */
export async function isGuildMember(userId: string): Promise<boolean> {
  return (await getGuildMember(userId)) !== null;
}

/**
 * Give a member a role.
 *
 * `PUT /guilds/{guild.id}/members/{user.id}/roles/{role.id}` answers 204 and is
 * idempotent: assigning a role the member already has succeeds just the same.
 * We rely on that instead of reading the member first — one request instead of
 * two, and no race between the read and the write.
 *
 * Requires `MANAGE_ROLES` and a bot role above the target role; otherwise
 * Discord answers 403/50013 and {@link DiscordError} explains the hierarchy.
 */
export async function addMemberRole(
  userId: string,
  roleId: string,
  reason?: string,
): Promise<void> {
  const { guildId } = requireConfig();
  await discordFetch(
    `/guilds/${encodeURIComponent(guildId)}/members/${encodeURIComponent(userId)}/roles/${encodeURIComponent(roleId)}`,
    { method: "PUT" },
    { what: `adding role ${roleId} to member ${userId}`, reason },
  );
}

/**
 * Take a role away from a member.
 *
 * `DELETE /guilds/{guild.id}/members/{user.id}/roles/{role.id}` answers 204 and
 * is idempotent as well: removing a role the member never had is a no-op, so no
 * "does the member have it?" check is needed. A 404 here means the member, user
 * or role is unknown — not "the role was not assigned".
 */
export async function removeMemberRole(
  userId: string,
  roleId: string,
  reason?: string,
): Promise<void> {
  const { guildId } = requireConfig();
  await discordFetch(
    `/guilds/${encodeURIComponent(guildId)}/members/${encodeURIComponent(userId)}/roles/${encodeURIComponent(roleId)}`,
    { method: "DELETE" },
    { what: `removing role ${roleId} from member ${userId}`, reason },
  );
}

/**
 * Move a member from one managed role to another.
 *
 * The new role is granted BEFORE the old one is dropped, so a failure leaves
 * the member with the role they had rather than with none at all. Both halves
 * are tolerant by construction (see {@link addMemberRole} /
 * {@link removeMemberRole}): passing a `fromRoleId` the member never carried,
 * or `null` for either side, is fine. Passing the same id twice does nothing.
 *
 * @param fromRoleId role to drop; `null`/`undefined` when there is none yet.
 * @param toRoleId   role to grant; `null`/`undefined` to only drop the old one.
 */
export async function switchMemberRole(
  userId: string,
  fromRoleId: string | null | undefined,
  toRoleId: string | null | undefined,
  reason?: string,
): Promise<void> {
  const from = fromRoleId || null;
  const to = toRoleId || null;
  if (from === to) return;

  if (to) await addMemberRole(userId, to, reason);
  if (from) await removeMemberRole(userId, from, reason);
}

/* -------------------------------------------------------------------------- */
/*  Guild roles                                                               */
/* -------------------------------------------------------------------------- */

/**
 * List every role of the configured guild, highest position first — the order
 * Discord itself shows in Server Settings → Roles, which is what a picker in
 * the dashboard wants.
 *
 * `GET /guilds/{guild.id}/roles` answers 200 with the role array and needs no
 * special permission beyond the bot being a member of the guild. The result is
 * deliberately not cached: an operator who just created a role expects to find
 * it in the picker on the next page load.
 */
export async function listGuildRoles(): Promise<DiscordRole[]> {
  const { guildId } = requireConfig();
  const res = await discordFetch(
    `/guilds/${encodeURIComponent(guildId)}/roles`,
    {},
    { what: "listing the server's roles" },
  );
  const roles = (await res.json()) as DiscordRole[];
  return roles.slice().sort((a, b) => b.position - a.position);
}
