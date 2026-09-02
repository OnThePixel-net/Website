import type { MetadataRoute } from "next";
import { localizedUrl } from "@/lib/i18n/seo";
import { DEFAULT_LOCALE, SUPPORTED_LOCALES } from "@/lib/i18n/translations";
import { getDb, schema } from "@/lib/db";
import { APPLY_POSITION_SEED, ensureTable } from "@/lib/db/migrate";
import { listApplyPositions } from "@/lib/apply";

// Static pages have no content source we could derive a modification date
// from, so their `lastModified` is maintained by hand. Emitting `new Date()`
// instead would tell crawlers on every single fetch that every page just
// changed — Google learns to ignore the field entirely. Bump the date of a
// page (or this default) whenever its content actually changes.
const DEFAULT_LAST_MODIFIED = "2026-09-02";

const STATIC_PATHS: {
  path: string;
  priority: number;
  changeFreq: MetadataRoute.Sitemap[number]["changeFrequency"];
  lastModified: string;
}[] = [
  {
    path: "/",
    priority: 1.0,
    changeFreq: "weekly",
    lastModified: DEFAULT_LAST_MODIFIED,
  },
  {
    path: "/about",
    priority: 0.7,
    changeFreq: "monthly",
    lastModified: DEFAULT_LAST_MODIFIED,
  },
  {
    path: "/team",
    priority: 0.6,
    changeFreq: "monthly",
    lastModified: DEFAULT_LAST_MODIFIED,
  },
  {
    path: "/creators",
    priority: 0.6,
    changeFreq: "monthly",
    lastModified: DEFAULT_LAST_MODIFIED,
  },
  {
    path: "/apply",
    priority: 0.7,
    changeFreq: "weekly",
    lastModified: DEFAULT_LAST_MODIFIED,
  },
  {
    path: "/leaderboard",
    priority: 0.8,
    changeFreq: "daily",
    lastModified: DEFAULT_LAST_MODIFIED,
  },
  {
    path: "/leaderboard/pixels",
    priority: 0.7,
    changeFreq: "daily",
    lastModified: DEFAULT_LAST_MODIFIED,
  },
  {
    path: "/leaderboard/buildffa",
    priority: 0.7,
    changeFreq: "daily",
    lastModified: DEFAULT_LAST_MODIFIED,
  },
  {
    path: "/leaderboard/duels",
    priority: 0.7,
    changeFreq: "daily",
    lastModified: DEFAULT_LAST_MODIFIED,
  },
  {
    path: "/leaderboard/bedwars",
    priority: 0.6,
    changeFreq: "daily",
    lastModified: DEFAULT_LAST_MODIFIED,
  },
  {
    path: "/leaderboard/parkour",
    priority: 0.6,
    changeFreq: "daily",
    lastModified: DEFAULT_LAST_MODIFIED,
  },
  {
    path: "/stats",
    priority: 0.7,
    changeFreq: "weekly",
    lastModified: DEFAULT_LAST_MODIFIED,
  },
  {
    path: "/bedwars",
    priority: 0.6,
    changeFreq: "monthly",
    lastModified: DEFAULT_LAST_MODIFIED,
  },
  {
    path: "/buildffa",
    priority: 0.6,
    changeFreq: "monthly",
    lastModified: DEFAULT_LAST_MODIFIED,
  },
  {
    path: "/tntrun",
    priority: 0.6,
    changeFreq: "monthly",
    lastModified: DEFAULT_LAST_MODIFIED,
  },
  {
    path: "/sidequests",
    priority: 0.5,
    changeFreq: "monthly",
    lastModified: DEFAULT_LAST_MODIFIED,
  },
  {
    path: "/api-docs",
    priority: 0.4,
    changeFreq: "monthly",
    lastModified: DEFAULT_LAST_MODIFIED,
  },
  {
    path: "/imprint",
    priority: 0.3,
    changeFreq: "yearly",
    lastModified: DEFAULT_LAST_MODIFIED,
  },
  {
    path: "/privacy",
    priority: 0.3,
    changeFreq: "yearly",
    lastModified: DEFAULT_LAST_MODIFIED,
  },
];

async function getNewsUrls(): Promise<
  { slug: string; published_at: string }[]
> {
  try {
    await ensureTable();
    const db = getDb();
    return await db
      .select({
        slug: schema.news.slug,
        published_at: schema.news.published_at,
      })
      .from(schema.news);
  } catch {
    return [];
  }
}

/**
 * The slugs of the application pages, which are the slugs of the positions.
 * They used to be three fixed entries in STATIC_PATHS; a position added in the
 * dashboard now shows up here on its own.
 *
 * Closed positions are listed as well — their pages answer 200 with the closed
 * notice, and dropping a URL from the sitemap because applications are paused
 * for a month would throw away its indexing. `listApplyPositions` swallows a
 * database fault and answers with an empty list, in which case the slugs the
 * schema ships with keep the indexed URLs in the sitemap.
 */
async function getApplyPaths(): Promise<string[]> {
  const positions = await listApplyPositions();
  const slugs =
    positions.length > 0
      ? positions.map((p) => p.slug)
      : APPLY_POSITION_SEED.map((p) => p.slug);
  return slugs.map((slug) => `/apply/${slug}`);
}

// URLs come from localizedUrl() so the sitemap, the canonical tags and the
// hreflang alternates all spell a page the same way (trailing slash included).
function buildLanguageAlternates(path: string): Record<string, string> {
  const langs: Record<string, string> = {};
  for (const loc of SUPPORTED_LOCALES) {
    langs[loc] = localizedUrl(loc, path);
  }
  langs["x-default"] = localizedUrl(DEFAULT_LOCALE, path);
  return langs;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [news, applyPaths] = await Promise.all([
    getNewsUrls(),
    getApplyPaths(),
  ]);

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map(
    ({ path, priority, changeFreq, lastModified }) => ({
      url: localizedUrl(DEFAULT_LOCALE, path),
      lastModified: new Date(lastModified),
      changeFrequency: changeFreq,
      priority,
      alternates: { languages: buildLanguageAlternates(path) },
    }),
  );

  // Same priority and change frequency the three fixed entries carried, and
  // the same hand-maintained date: a position row does expose an updated_at,
  // but it changes when the dashboard toggles a status, not when the page's
  // content does.
  const applyEntries: MetadataRoute.Sitemap = applyPaths.map((path) => ({
    url: localizedUrl(DEFAULT_LOCALE, path),
    lastModified: new Date(DEFAULT_LAST_MODIFIED),
    changeFrequency: "monthly",
    priority: 0.5,
    alternates: { languages: buildLanguageAlternates(path) },
  }));

  // News articles do have a real modification date, so they keep it.
  const newsEntries: MetadataRoute.Sitemap = news.map((n) => {
    const path = `/news/${n.slug}`;
    return {
      url: localizedUrl(DEFAULT_LOCALE, path),
      lastModified: n.published_at ? new Date(n.published_at) : new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: { languages: buildLanguageAlternates(path) },
    };
  });

  return [...staticEntries, ...applyEntries, ...newsEntries];
}
