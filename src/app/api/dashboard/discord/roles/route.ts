import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/authz";
import { LEVEL_READ } from "@/lib/permissions";
import {
  DiscordError,
  getGuildId,
  isDiscordConfigured,
  listGuildRoles,
} from "@/lib/discord";

/**
 * GET — the roles of the OTP Discord server, for the rank editor's role picker.
 *
 * Always answers 200, even when Discord cannot be reached. This endpoint feeds
 * a picker, and "the bot is not set up" or "Discord is down" are states of that
 * picker, not failures of the request: the dashboard renders the hint or falls
 * back to typing a role id by hand, and role ids typed that way keep working
 * long after this call stopped answering. Returning a 5xx instead would make
 * the rank editor unusable for the entire outage, for a list it only needs to
 * offer a convenience.
 *
 * The response therefore carries the state alongside the data:
 *  - `configured` — whether a bot token and guild id are set at all;
 *  - `roles` — the pickable roles, highest position first;
 *  - `error` — set when the listing failed, already phrased for an operator.
 */
export async function GET() {
  // Belongs to the `team` area: this list only ever fills the Discord-role
  // picker inside the rank editor under Team → Gruppen, so whoever may see the
  // team area may see it, and nobody else.
  const gate = await requirePermission("team", LEVEL_READ);
  if (!gate.ok) return gate.response;

  if (!isDiscordConfigured()) {
    return NextResponse.json({ configured: false, roles: [] });
  }

  try {
    const guildId = getGuildId();
    const roles = (await listGuildRoles())
      // `@everyone` shares the guild's id and cannot be assigned; `managed`
      // roles belong to a bot, an integration or Nitro boosting and Discord
      // refuses to hand them out through the API. Offering either would only
      // produce a puzzling failure later, so they never reach the picker.
      .filter((r) => r.id !== guildId && !r.managed)
      .map((r) => ({
        id: r.id,
        name: r.name,
        color: r.color,
        position: r.position,
      }));

    return NextResponse.json({ configured: true, roles });
  } catch (e) {
    const message =
      e instanceof DiscordError
        ? e.message
        : e instanceof Error
          ? e.message
          : String(e);
    console.error("[discord roles route]", e);
    return NextResponse.json({ configured: true, roles: [], error: message });
  }
}
