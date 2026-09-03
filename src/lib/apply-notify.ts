import { DEFAULT_LOCALE } from "@/lib/i18n/translations";
import { localizedUrl } from "@/lib/i18n/seo";
import {
  createChannelMessage,
  getApplyChannelId,
  isApplyChannelConfigured,
  MESSAGE_FLAG_SUPPRESS_EMBEDS,
} from "@/lib/discord";

/**
 * The Discord notice that a new application came in.
 *
 * Deliberately the thinnest possible message: which position was applied for
 * and a link into the dashboard. No name, no Discord id, no answers. The
 * channel this lands in is a team channel, not the application inbox — the
 * applications themselves stay behind the dashboard's permission check, where
 * only the people with the `apply` right can read them. A notice that carried
 * the applicant's answers would hand everyone with access to the channel a
 * copy of data they are not otherwise allowed to see, and it would do so
 * permanently, in a place with no retention rules and no way to take it back.
 *
 * Posting goes through the bot that already exists for the role sync — the
 * same `DISCORD_BOT_TOKEN`, one more `.env` variable for the channel. No
 * webhook: a webhook URL is a second credential to store and rotate, and it
 * carries send rights to that channel for anyone who ever sees it.
 */

/**
 * Where "click here to open" points. The applications tab of the dashboard;
 * there is no per-submission URL to link to, the newest application is the
 * first row of that list.
 */
const DASHBOARD_PATH = "/dashboard/apply";

/**
 * Longest position name the notice repeats. Positions are named in the
 * dashboard and the column allows more than fits a chat line, so the name is
 * capped rather than trusted to be short.
 */
const MAX_POSITION_LENGTH = 80;

/**
 * Flatten a position name into something that reads as one line of chat.
 *
 * Line breaks would let a name split the message into several lines and put
 * text under the heading that looks like it belongs to us; backticks and
 * asterisks would leak out of the bold span and re-format the rest. Mentions
 * are already defused by `allowed_mentions`, so they need no handling here.
 */
function inlinePositionName(name: string): string {
  const flat = name.replace(/\s+/gu, " ").replace(/[`*_~|\\]/gu, "").trim();
  return flat.length > MAX_POSITION_LENGTH
    ? `${flat.slice(0, MAX_POSITION_LENGTH - 1)}…`
    : flat;
}

/** The message body, kept separate from the sending so it can be read at a glance. */
export function buildApplyNotification(positionName: string): string {
  const position = inlinePositionName(positionName) || "position";
  const url = localizedUrl(DEFAULT_LOCALE, DASHBOARD_PATH);
  return `New applicant as a **${position}**\nClick here to open: ${url}`;
}

/**
 * Announce a new application in the configured channel.
 *
 * Never throws. This runs after the application is already stored and the
 * applicant has their confirmation, so a Discord outage, a missing permission
 * or a channel id pointing at nothing must not turn a successful application
 * into a failed one. Every failure is logged with enough context to fix it —
 * the message from {@link DiscordError} names the cause, including the 403
 * that means the bot cannot post in that channel.
 *
 * With no channel configured this does nothing at all, which is what every
 * deployment that never sets the variable gets.
 */
export async function notifyNewApplication(positionName: string): Promise<void> {
  if (!isApplyChannelConfigured()) return;

  try {
    await createChannelMessage(getApplyChannelId(), {
      content: buildApplyNotification(positionName),
      // The dashboard link would otherwise pull a preview card of the login
      // page under every notice.
      flags: MESSAGE_FLAG_SUPPRESS_EMBEDS,
    });
  } catch (e) {
    console.error(
      "[apply] announcing the application in Discord failed " +
        "(the application itself was stored):",
      e,
    );
  }
}
