import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/i18n/seo";
import { SUPPORTED_LOCALES } from "@/lib/i18n/translations";

interface CmsNewsItem {
  url: string;
  date?: string;
}

const STATIC_PATHS: { path: string; priority: number; changeFreq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "/", priority: 1.0, changeFreq: "weekly" },
  { path: "/about", priority: 0.7, changeFreq: "monthly" },
  { path: "/team", priority: 0.6, changeFreq: "monthly" },
  { path: "/creators", priority: 0.6, changeFreq: "monthly" },
  { path: "/apply", priority: 0.7, changeFreq: "weekly" },
  { path: "/apply/builder", priority: 0.5, changeFreq: "monthly" },
  { path: "/apply/developer", priority: 0.5, changeFreq: "monthly" },
  { path: "/apply/supporter", priority: 0.5, changeFreq: "monthly" },
  { path: "/leaderboard", priority: 0.8, changeFreq: "daily" },
  { path: "/leaderboard/pixels", priority: 0.7, changeFreq: "daily" },
  { path: "/leaderboard/buildffa", priority: 0.7, changeFreq: "daily" },
  { path: "/leaderboard/duels", priority: 0.7, changeFreq: "daily" },
  { path: "/leaderboard/bedwars", priority: 0.6, changeFreq: "daily" },
  { path: "/leaderboard/parkour", priority: 0.6, changeFreq: "daily" },
  { path: "/stats", priority: 0.7, changeFreq: "weekly" },
  { path: "/bedwars", priority: 0.6, changeFreq: "monthly" },
  { path: "/buildffa", priority: 0.6, changeFreq: "monthly" },
  { path: "/tntrun", priority: 0.6, changeFreq: "monthly" },
  { path: "/sidequests", priority: 0.5, changeFreq: "monthly" },
  { path: "/redeem", priority: 0.4, changeFreq: "monthly" },
  { path: "/imprint", priority: 0.3, changeFreq: "yearly" },
  { path: "/privacy", priority: 0.3, changeFreq: "yearly" },
];

async function getNewsUrls(): Promise<CmsNewsItem[]> {
  try {
    const res = await fetch("https://cms.onthepixel.net/items/News", {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data || []) as CmsNewsItem[];
  } catch {
    return [];
  }
}

function buildLanguageAlternates(path: string): Record<string, string> {
  const cleanPath = path === "/" ? "" : path.replace(/\/$/, "");
  const langs: Record<string, string> = {};
  for (const loc of SUPPORTED_LOCALES) {
    langs[loc] =
      loc === "en"
        ? `${SITE_URL}${cleanPath || "/"}`
        : `${SITE_URL}/${loc}${cleanPath}`;
  }
  langs["x-default"] = `${SITE_URL}${cleanPath || "/"}`;
  return langs;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const news = await getNewsUrls();

  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.map(
    ({ path, priority, changeFreq }) => ({
      url: `${SITE_URL}${path === "/" ? "" : path}` || SITE_URL,
      lastModified: new Date(),
      changeFrequency: changeFreq,
      priority,
      alternates: { languages: buildLanguageAlternates(path) },
    }),
  );

  const newsEntries: MetadataRoute.Sitemap = news.map((n) => {
    const path = `/news/${n.url}`;
    return {
      url: `${SITE_URL}${path}`,
      lastModified: n.date ? new Date(n.date) : new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
      alternates: { languages: buildLanguageAlternates(path) },
    };
  });

  return [...staticEntries, ...newsEntries];
}
