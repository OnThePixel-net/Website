#!/usr/bin/env tsx
/**
 * Fill a LOCAL development database with realistic sample content.
 *
 *   npm run db:up        start the PostgreSQL container from compose.yml
 *   npm run db:migrate   create the schema
 *   npm run db:seed      run this script
 *
 * The script is idempotent: articles and creators are keyed by their natural
 * unique column (slug / Minecraft UUID) and upserted, translations are upserted
 * per (article, language), and a creator's channels are replaced wholesale.
 * Running it twice changes nothing.
 *
 * It refuses to run against anything that is not obviously a local database —
 * see `assertLocalDatabase()`. That check is the only thing standing between a
 * stale shell variable and overwritten production content, so keep it strict.
 */

import { existsSync } from "node:fs";
import { resolve } from "node:path";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import * as schema from "../src/lib/db/schema";

// drizzle-kit reads `.env` by itself, plain tsx does not — so `npm run db:seed`
// picks up the same DATABASE_URL as `npm run db:migrate`. Real environment
// variables keep precedence over the file.
const envFile = resolve(process.cwd(), ".env");
if (existsSync(envFile)) process.loadEnvFile(envFile);

/**
 * Hostnames we accept: the loopback interface and the Compose service name (so
 * the script also works from inside a container on the Compose network).
 */
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1", "postgres"]);

function assertLocalDatabase(url: string): void {
  let host: string;
  try {
    // `new URL` keeps IPv6 hosts in brackets, hence the trim.
    host = new URL(url).hostname.replace(/^\[|\]$/g, "").toLowerCase();
  } catch {
    throw new Error(`DATABASE_URL is not a valid URL: ${url}`);
  }

  if (!LOCAL_HOSTS.has(host)) {
    throw new Error(
      `Refusing to seed "${host}". This script only ever runs against a local ` +
        `database (${[...LOCAL_HOSTS].join(", ")}). If you really meant to seed ` +
        `a remote database, do it by hand — not with this script.`,
    );
  }
}

/* ------------------------------------------------------------------ data -- */

/**
 * Article bodies use the block format the news editor produces, so the seeded
 * articles exercise the same rendering path as real content.
 */
type Block =
  | { id: string; type: "paragraph"; content: string }
  | { id: string; type: "heading"; level: 2 | 3; content: string }
  | { id: string; type: "image"; url: string; caption: string }
  | {
      id: string;
      type: "callout";
      variant: "info" | "warning" | "tip" | "success";
      title: string;
      content: string;
    }
  | { id: string; type: "divider" };

const blocks = (...items: Block[]): string => JSON.stringify(items);

interface SeedArticle {
  slug: string;
  title: string;
  short_description: string;
  content: string;
  image_url: string | null;
  published_at: string;
  author: string;
  translations: Record<
    string,
    { title: string; short_description: string; content: string }
  >;
}

const ARTICLES: SeedArticle[] = [
  {
    slug: "bedwars-season-3",
    title: "BedWars Season 3 is live",
    short_description:
      "New maps, a reworked shop and a fresh ranked ladder — season 3 of BedWars has started on play.onthepixel.net.",
    content: blocks(
      {
        id: "b1",
        type: "paragraph",
        content:
          "Season 3 is here. Three new maps rotate into the pool, the shop layout has been rebuilt around the items people actually buy, and the ranked ladder resets tonight at 20:00 CET.",
      },
      { id: "b2", type: "heading", level: 2, content: "New maps" },
      {
        id: "b3",
        type: "paragraph",
        content:
          "Ashfall, Driftwood and Terrace join the rotation. All three are built for four teams and keep the mid island small enough that fights start early.",
      },
      {
        id: "b4",
        type: "callout",
        variant: "tip",
        title: "Ladder reset",
        content:
          "Your season 2 rank is archived, not deleted — you can still look it up on your stats page.",
      },
      { id: "b5", type: "divider" },
      {
        id: "b6",
        type: "paragraph",
        content:
          "Feedback belongs in the #bedwars channel on [our Discord](https://discord.onthepixel.net).",
      },
    ),
    image_url: null,
    published_at: "2026-08-28",
    author: "OnThePixel",
    translations: {
      de: {
        title: "BedWars Season 3 ist gestartet",
        short_description:
          "Neue Maps, ein überarbeiteter Shop und eine frische Ranglisten-Saison — Season 3 von BedWars läuft auf play.onthepixel.net.",
        content: blocks(
          {
            id: "b1",
            type: "paragraph",
            content:
              "Season 3 ist da. Drei neue Maps kommen in die Rotation, der Shop wurde um die Items herum neu aufgebaut, die tatsächlich gekauft werden, und die Rangliste wird heute Abend um 20:00 Uhr zurückgesetzt.",
          },
          { id: "b2", type: "heading", level: 2, content: "Neue Maps" },
          {
            id: "b3",
            type: "paragraph",
            content:
              "Ashfall, Driftwood und Terrace kommen dazu. Alle drei sind für vier Teams gebaut und halten die Mitte klein genug, dass früh gekämpft wird.",
          },
          {
            id: "b4",
            type: "callout",
            variant: "tip",
            title: "Ranglisten-Reset",
            content:
              "Dein Rang aus Season 2 wird archiviert, nicht gelöscht — du findest ihn weiterhin auf deiner Statistikseite.",
          },
          { id: "b5", type: "divider" },
          {
            id: "b6",
            type: "paragraph",
            content:
              "Feedback gehört in den #bedwars-Kanal auf [unserem Discord](https://discord.onthepixel.net).",
          },
        ),
      },
    },
  },
  {
    slug: "duels-rework",
    title: "Duels: hit registration rework",
    short_description:
      "We rewrote how Duels handles hit registration. Here is what changed and why it should feel noticeably tighter.",
    content: blocks(
      {
        id: "b1",
        type: "paragraph",
        content:
          "Duels now resolves hits against the position the server saw the target at, rewound by the attacker's measured latency, instead of against the current server position.",
      },
      { id: "b2", type: "heading", level: 2, content: "What you will notice" },
      {
        id: "b3",
        type: "paragraph",
        content:
          "Hits that visually connected but did not register should be far rarer. Players on a high-latency connection no longer have to aim ahead of their opponent.",
      },
      {
        id: "b4",
        type: "callout",
        variant: "info",
        title: "Still tuning",
        content:
          "The rewind window is capped at 200 ms. If something feels wrong, report it with a clip.",
      },
    ),
    image_url: null,
    published_at: "2026-08-14",
    author: "OnThePixel",
    translations: {
      de: {
        title: "Duels: Überarbeitung der Trefferauswertung",
        short_description:
          "Wir haben die Trefferauswertung in Duels neu geschrieben. Was sich geändert hat und warum es sich deutlich direkter anfühlen sollte.",
        content: blocks(
          {
            id: "b1",
            type: "paragraph",
            content:
              "Duels wertet Treffer jetzt gegen die Position aus, an der der Server das Ziel gesehen hat — zurückgerechnet um die gemessene Latenz des Angreifers, statt gegen die aktuelle Serverposition.",
          },
          { id: "b2", type: "heading", level: 2, content: "Was du merkst" },
          {
            id: "b3",
            type: "paragraph",
            content:
              "Treffer, die optisch saßen, aber nicht gezählt wurden, sollten deutlich seltener werden. Wer eine hohe Latenz hat, muss nicht mehr vorhalten.",
          },
          {
            id: "b4",
            type: "callout",
            variant: "info",
            title: "Wird weiter angepasst",
            content:
              "Das Rückrechnungsfenster ist auf 200 ms begrenzt. Wenn sich etwas falsch anfühlt, melde es mit einem Clip.",
          },
        ),
      },
    },
  },
  {
    slug: "builder-applications-open",
    title: "Builder applications are open",
    short_description:
      "We are looking for builders for the next map season. Applications are open until the end of the month.",
    content: blocks(
      {
        id: "b1",
        type: "paragraph",
        content:
          "We are adding builders to the team for the next map season. You do not need a portfolio full of megabuilds — we care much more about clean, readable playable space.",
      },
      { id: "b2", type: "heading", level: 3, content: "What we ask for" },
      {
        id: "b3",
        type: "paragraph",
        content:
          "Two or three screenshots of something you built, and a sentence about what you would change if you built it again.",
      },
    ),
    image_url: null,
    published_at: "2026-07-30",
    author: "OnThePixel",
    translations: {
      de: {
        title: "Bewerbungen für Builder sind offen",
        short_description:
          "Wir suchen Builder für die nächste Map-Season. Bewerbungen sind bis Monatsende offen.",
        content: blocks(
          {
            id: "b1",
            type: "paragraph",
            content:
              "Wir holen für die nächste Map-Season Builder ins Team. Du brauchst kein Portfolio voller Megabuilds — uns ist sauberer, lesbarer Spielraum deutlich wichtiger.",
          },
          { id: "b2", type: "heading", level: 3, content: "Was wir sehen wollen" },
          {
            id: "b3",
            type: "paragraph",
            content:
              "Zwei, drei Screenshots von etwas, das du gebaut hast, und einen Satz dazu, was du beim nächsten Mal anders machen würdest.",
          },
        ),
      },
    },
  },
];

interface SeedCreator {
  minecraft_uuid: string;
  name: string;
  channels: { platform: string; url: string }[];
}

/**
 * The UUIDs are made up, so the avatar service will fall back to a default
 * skin locally. That is fine — nothing here should point at a real account.
 */
const CREATORS: SeedCreator[] = [
  {
    minecraft_uuid: "00000000-0000-4000-8000-0000000c0001",
    name: "PixelPilot",
    channels: [
      { platform: "youtube", url: "https://www.youtube.com/@example-pixelpilot" },
      { platform: "twitch", url: "https://www.twitch.tv/example-pixelpilot" },
      { platform: "discord", url: "https://discord.onthepixel.net" },
    ],
  },
  {
    minecraft_uuid: "00000000-0000-4000-8000-0000000c0002",
    name: "BlockAndBucket",
    channels: [
      { platform: "youtube", url: "https://www.youtube.com/@example-blockandbucket" },
      { platform: "tiktok", url: "https://www.tiktok.com/@example-blockandbucket" },
    ],
  },
  {
    minecraft_uuid: "00000000-0000-4000-8000-0000000c0003",
    name: "AshfallAce",
    channels: [
      { platform: "twitch", url: "https://www.twitch.tv/example-ashfallace" },
      { platform: "x_twitter", url: "https://x.com/example-ashfallace" },
      { platform: "website", url: "https://example.com/ashfallace" },
    ],
  },
];

/** Mirrors APPLY_POSITION_SEED in src/lib/db/migrate.ts. */
const APPLY_POSITIONS = [
  { name: "Builder", slug: "builder" },
  { name: "Supporter", slug: "supporter" },
  { name: "Java Developer", slug: "developer" },
];

/* ------------------------------------------------------------------ main -- */

async function main(): Promise<void> {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set.");
  assertLocalDatabase(url);

  const client = postgres(url, { max: 1, onnotice: () => {} });
  const db = drizzle(client, { schema });

  try {
    for (const article of ARTICLES) {
      const { translations, ...row } = article;
      const [item] = await db
        .insert(schema.news)
        .values(row)
        .onConflictDoUpdate({
          target: schema.news.slug,
          set: {
            title: row.title,
            short_description: row.short_description,
            content: row.content,
            image_url: row.image_url,
            published_at: row.published_at,
            author: row.author,
            updated_at: new Date(),
          },
        })
        .returning();

      for (const [language, tr] of Object.entries(translations)) {
        await db
          .insert(schema.newsTranslations)
          .values({ news_id: item.id, language, ...tr })
          .onConflictDoUpdate({
            target: [schema.newsTranslations.news_id, schema.newsTranslations.language],
            set: tr,
          });
      }
      console.log(`  news        ${article.slug}`);
    }

    for (const [i, creator] of CREATORS.entries()) {
      const [row] = await db
        .insert(schema.creators)
        .values({
          minecraft_uuid: creator.minecraft_uuid,
          name: creator.name,
          sort_order: i,
        })
        .onConflictDoUpdate({
          target: schema.creators.minecraft_uuid,
          set: { name: creator.name, sort_order: i, updated_at: new Date() },
        })
        .returning();

      // Replacing the channels wholesale keeps a re-run from accumulating
      // duplicates — there is no unique key to upsert against.
      await db
        .delete(schema.creatorChannels)
        .where(eq(schema.creatorChannels.creator_id, row.id));
      if (creator.channels.length > 0) {
        await db.insert(schema.creatorChannels).values(
          creator.channels.map((c, sort_order) => ({
            creator_id: row.id,
            platform: c.platform,
            url: c.url,
            sort_order,
          })),
        );
      }
      console.log(`  creator     ${creator.name}`);
    }

    // The baseline migration already seeds these as `closed`. Locally it is
    // more useful to have one of them open so the apply pages have something to
    // show, so the status is upserted rather than left alone — re-seeding puts
    // the positions back into this known state.
    for (const [i, position] of APPLY_POSITIONS.entries()) {
      const status = position.slug === "builder" ? "open" : "closed";
      await db
        .insert(schema.applyPositions)
        .values({ name: position.name, slug: position.slug, status, sort_order: i })
        .onConflictDoUpdate({
          target: schema.applyPositions.name,
          set: { slug: position.slug, status, sort_order: i, updated_at: new Date() },
        });
      console.log(`  position    ${position.name} (${status})`);
    }

    console.log(
      `\nSeeded ${ARTICLES.length} articles, ${CREATORS.length} creators and ` +
        `${APPLY_POSITIONS.length} apply positions.`,
    );
  } finally {
    await client.end();
  }
}

main().catch((e: unknown) => {
  console.error(`\nSeeding failed: ${e instanceof Error ? e.message : String(e)}`);
  process.exit(1);
});
