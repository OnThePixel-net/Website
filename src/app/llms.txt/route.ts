import { desc } from "drizzle-orm";
import { SITE_URL, SITE_NAME } from "@/lib/i18n/seo";
import { getDb, schema } from "@/lib/db";
import { ensureTable } from "@/lib/db/migrate";

export const revalidate = 3600;

const NEWS_LIMIT = 20;

interface NewsEntry {
  slug: string;
  title: string;
  short_description: string;
  published_at: string;
}

// Best-effort fetch of the most recent news items for the News section.
// This route must never 500, so any DB error just means that section is
// omitted from the output.
async function getRecentNews(): Promise<NewsEntry[]> {
  try {
    await ensureTable();
    const db = getDb();
    return await db
      .select({
        slug: schema.news.slug,
        title: schema.news.title,
        short_description: schema.news.short_description,
        published_at: schema.news.published_at,
      })
      .from(schema.news)
      .orderBy(desc(schema.news.published_at))
      .limit(NEWS_LIMIT);
  } catch {
    return [];
  }
}

function buildLlmsTxt(news: NewsEntry[]): string {
  const lines: string[] = [];

  lines.push(`# ${SITE_NAME}`);
  lines.push("");
  lines.push(
    "> Minecraft minigame server, server address play.onthepixel.net, Java Edition.",
  );
  lines.push("");
  lines.push(
    `${SITE_NAME} is a Minecraft Java Edition minigame server offering Duels, ` +
      "BuildFFA, TNT Run, BedWars, Parkour, Pixels and SideQuests. The site " +
      "publishes public player statistics and leaderboards for these " +
      "minigames, and the server has an active Discord community. The team " +
      "accepts applications for Builder, Supporter and Java Developer roles.",
  );
  lines.push("");

  lines.push("## Minigames");
  lines.push(`- [BedWars](${SITE_URL}/bedwars/): Team vs. team minigame — protect your bed, break the others.`);
  lines.push(`- [BuildFFA](${SITE_URL}/buildffa/): Free-for-all creative building and PvP minigame.`);
  lines.push(`- [TNT Run](${SITE_URL}/tntrun/): Survive as the floor disappears beneath you.`);
  lines.push(`- [SideQuests](${SITE_URL}/sidequests/): Additional quest-based minigame content.`);
  lines.push("");

  lines.push("## Statistics & Leaderboards");
  lines.push(`- [Stats](${SITE_URL}/stats/): Look up public player statistics.`);
  lines.push(`- [Leaderboard](${SITE_URL}/leaderboard/): Overview of all server leaderboards.`);
  lines.push(`- [Pixels Leaderboard](${SITE_URL}/leaderboard/pixels/): Top players by Pixels.`);
  lines.push(`- [Duels Leaderboard](${SITE_URL}/leaderboard/duels/): Top players in Duels.`);
  lines.push(`- [BuildFFA Leaderboard](${SITE_URL}/leaderboard/buildffa/): Top players in BuildFFA.`);
  lines.push(`- [BedWars Leaderboard](${SITE_URL}/leaderboard/bedwars/): Top players in BedWars.`);
  lines.push(`- [Parkour Leaderboard](${SITE_URL}/leaderboard/parkour/): Top players in Parkour.`);
  lines.push("");

  lines.push("## Community");
  lines.push(`- [Team](${SITE_URL}/team/): Meet the staff team behind the server.`);
  lines.push(`- [Creators](${SITE_URL}/creators/): Content creators who play on the server.`);
  lines.push(`- [About](${SITE_URL}/about/): About OnThePixel.net.`);
  lines.push(`- [Discord](https://discord.onthepixel.net): Join the community Discord server.`);
  lines.push("");

  lines.push("## Get Involved");
  lines.push(`- [Apply](${SITE_URL}/apply/): Overview of open positions on the team.`);
  lines.push(`- [Builder Application](${SITE_URL}/apply/builder/): Apply to join as a builder.`);
  lines.push(`- [Supporter Application](${SITE_URL}/apply/supporter/): Apply to join as a supporter.`);
  lines.push(`- [Java Developer Application](${SITE_URL}/apply/developer/): Apply to join as a Java developer.`);
  lines.push("");

  if (news.length > 0) {
    lines.push("## News");
    for (const item of news) {
      const description = item.short_description
        ? `: ${item.short_description}`
        : "";
      lines.push(`- [${item.title}](${SITE_URL}/news/${item.slug}/)${description}`);
    }
    lines.push("");
  }

  lines.push("## Legal");
  lines.push(`- [Imprint](${SITE_URL}/imprint/): Legal notice / imprint.`);
  lines.push(`- [Privacy Policy](${SITE_URL}/privacy/): Privacy policy.`);

  return lines.join("\n") + "\n";
}

export async function GET() {
  const news = await getRecentNews();
  const body = buildLlmsTxt(news);

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
