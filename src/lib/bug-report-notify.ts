import { DEFAULT_LOCALE } from "@/lib/i18n/translations";
import { localizedUrl } from "@/lib/i18n/seo";
import {
  createChannelMessage,
  getBugReportChannelId,
  isBugReportChannelConfigured,
  MESSAGE_FLAG_SUPPRESS_EMBEDS,
} from "@/lib/discord";
import type { BugReportCategory } from "@/lib/bug-reports";

/**
 * The Discord notice that a new bug report came in.
 *
 * Same shape and the same reasoning as `lib/apply-notify.ts`: only the
 * category and a link into the dashboard. Title and description are typed by
 * anonymous visitors and stay behind the dashboard's `bugs` permission rather
 * than being copied into a channel with no retention rules.
 */

const DASHBOARD_PATH = "/dashboard/bugs";

const CATEGORY_LABELS: Record<BugReportCategory, string> = {
  server: "Minecraft server",
  website: "Website",
  discord: "Discord",
  other: "Other",
};

/** The message body, kept separate from the sending so it can be read at a glance. */
export function buildBugReportNotification(
  category: BugReportCategory,
): string {
  const url = localizedUrl(DEFAULT_LOCALE, DASHBOARD_PATH);
  return `New bug report: **${CATEGORY_LABELS[category]}**\nClick here to open: ${url}`;
}

/**
 * Announce a new report in the configured channel. Never throws: the report is
 * already stored when this runs, so a Discord failure is logged and nothing
 * more. Without a configured channel this does nothing.
 */
export async function notifyNewBugReport(
  category: BugReportCategory,
): Promise<void> {
  if (!isBugReportChannelConfigured()) return;

  try {
    await createChannelMessage(getBugReportChannelId(), {
      content: buildBugReportNotification(category),
      flags: MESSAGE_FLAG_SUPPRESS_EMBEDS,
    });
  } catch (e) {
    console.error(
      "[bug-report] announcing the report in Discord failed " +
        "(the report itself was stored):",
      e,
    );
  }
}
