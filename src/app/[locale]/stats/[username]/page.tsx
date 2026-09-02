import React from "react";
import type { Metadata } from "next";
import TopPage from "@/components/page/top";
import PlayerStatistics from "@/components/page/PlayerStatistics";
import {
  getRouteLocale,
  type LocaleRouteParams,
} from "@/lib/i18n/server";
import { buildLocalizedMetadata } from "@/lib/i18n/seo";

// The route sits under app/[locale], so its params carry the locale too.
interface PageProps {
  params: Promise<LocaleRouteParams & { username: string }>;
}

const META_COPY = {
  en: {
    title: (name: string) => `${name} — Player Stats`,
    description: (name: string) =>
      `Minecraft minigame statistics for ${name} on OnThePixel.net — Duels, BuildFFA, BedWars, Parkour and more.`,
  },
  de: {
    title: (name: string) => `${name} — Spielerstatistiken`,
    description: (name: string) =>
      `Minecraft-Minigame-Statistiken von ${name} auf OnThePixel.net — Duels, BuildFFA, BedWars, Parkour und mehr.`,
  },
} as const;

// Player profiles are generated on demand for any username string, so the
// route has an unbounded URL space of thin, mostly-empty pages. Letting
// crawlers loose on it wastes crawl budget without adding anything to the
// index — /stats/ is the entry point that belongs there. The pages stay
// crawlable (follow) so links out of them still count.
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username } = await params;
  const locale = await getRouteLocale(params);
  const copy = META_COPY[locale];
  return {
    ...buildLocalizedMetadata({
      locale,
      path: `/stats/${username}`,
      title: copy.title(username),
      description: copy.description(username),
    }),
    // The stats are fetched in the browser, so the server cannot tell an
    // existing player from a typo — every username renders the same shell.
    robots: { index: false, follow: true },
  };
}

// Deliberately dynamic: the username segment has an unbounded URL space, so
// there is nothing sensible to prerender. The page is noindex anyway (see
// generateMetadata) and its data is fetched in the browser.
export const dynamic = "force-dynamic";

const StatisticsPage: React.FC<PageProps> = async ({ params }) => {
  const { username } = await params;

  return (
    <section className="min-h-screen bg-gray-950">
      <TopPage />
      <PlayerStatistics initialUsername={username} />
    </section>
  );
};

export default StatisticsPage;
