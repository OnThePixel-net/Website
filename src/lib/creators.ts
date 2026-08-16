import { asc } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { ensureCreatorTables } from "@/lib/db/migrate";

/**
 * Platform keys understood by the icon mapping in `components/page/creators.tsx`
 * and by the dashboard's channel editor. Keep both in sync when adding one.
 */
export const CHANNEL_PLATFORMS = [
  "youtube",
  "twitch",
  "tiktok",
  "instagram",
  "x_twitter",
  "discord",
  "whatsapp",
  "website",
] as const;

export type ChannelPlatform = (typeof CHANNEL_PLATFORMS)[number];

/** A channel as stored and edited in the dashboard. */
export interface CreatorChannel {
  id?: number;
  platform: string;
  url: string;
}

/** A creator as returned by the dashboard API. */
export interface CreatorEntry {
  id: number;
  name: string;
  minecraftUuid: string;
  sortOrder: number;
  channels: CreatorChannel[];
}

/**
 * The shape the public site consumes. It mirrors the legacy Directus payload
 * (`Minecraft_username` / `Name` / `Platforms`) so the existing components keep
 * working unchanged; `Minecraft_username` carries the Minecraft UUID, which the
 * avatar service accepts just like a name.
 */
export interface PublicCreator {
  Minecraft_username: string;
  Name: string;
  Platforms: { Icons: string; Link: string }[];
}

/**
 * Accept a Minecraft UUID with or without dashes and return it in the canonical
 * dashed lower-case form, or `null` when it is not a valid UUID.
 */
export function normalizeMinecraftUuid(input: unknown): string | null {
  const raw = String(input ?? "").trim().toLowerCase().replace(/-/g, "");
  if (!/^[0-9a-f]{32}$/.test(raw)) return null;
  return [
    raw.slice(0, 8),
    raw.slice(8, 12),
    raw.slice(12, 16),
    raw.slice(16, 20),
    raw.slice(20),
  ].join("-");
}

/**
 * Normalise the channel list coming from the dashboard: keep the submitted
 * order (that order is what gets persisted as `sort_order`), trim the values
 * and drop entries without a usable http(s) link.
 */
export function sanitizeChannels(input: unknown): CreatorChannel[] {
  if (!Array.isArray(input)) return [];
  return input
    .map((raw) => {
      const entry = raw as { platform?: unknown; url?: unknown };
      return {
        platform: String(entry?.platform ?? "").trim().toLowerCase() || "website",
        url: String(entry?.url ?? "").trim(),
      };
    })
    .filter((c) => /^https?:\/\/\S+$/i.test(c.url));
}

/** Read every creator with its channels, ordered by the configured sort order. */
export async function listCreators(): Promise<CreatorEntry[]> {
  await ensureCreatorTables();
  const db = getDb();

  const [rows, channels] = await Promise.all([
    db
      .select()
      .from(schema.creators)
      .orderBy(asc(schema.creators.sort_order), asc(schema.creators.id)),
    db
      .select()
      .from(schema.creatorChannels)
      .orderBy(asc(schema.creatorChannels.sort_order), asc(schema.creatorChannels.id)),
  ]);

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    minecraftUuid: row.minecraft_uuid,
    sortOrder: row.sort_order,
    channels: channels
      .filter((c) => c.creator_id === row.id)
      .map((c) => ({ id: c.id, platform: c.platform, url: c.url })),
  }));
}

export function toPublicCreator(entry: CreatorEntry): PublicCreator {
  return {
    Minecraft_username: entry.minecraftUuid,
    Name: entry.name,
    Platforms: entry.channels.map((c) => ({ Icons: c.platform, Link: c.url })),
  };
}

/**
 * Creators in the public payload shape. Returns an empty list when the database
 * is unreachable or not seeded yet so callers can fall back to the CMS.
 */
export async function getPublicCreators(): Promise<PublicCreator[]> {
  try {
    return (await listCreators()).map(toPublicCreator);
  } catch (e) {
    console.error("[creators] database read failed:", e);
    return [];
  }
}
