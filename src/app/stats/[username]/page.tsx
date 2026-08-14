import React from "react";
import type { Metadata } from "next";
import TopPage from "@/components/page/top";
import PlayerStatistics from "@/components/page/PlayerStatistics";
import { getServerLocale } from "@/lib/i18n/server";
import { buildLocalizedMetadata } from "@/lib/i18n/seo";

interface PageProps {
  params: Promise<{
    username: string;
  }>;
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

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username } = await params;
  const locale = await getServerLocale();
  const copy = META_COPY[locale];
  return buildLocalizedMetadata({
    locale,
    path: `/stats/${username}`,
    title: copy.title(username),
    description: copy.description(username),
  });
}

// The page is rendered on-demand for each requested username — the root
// layout already reads the locale cookie/header and so the whole tree is
// dynamic.
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
