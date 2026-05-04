import React from "react";
import type { Metadata } from "next";
import TopPage from "@/components/page/top";
import PlayerStatistics from "@/components/page/PlayerStatistics";
import { getServerLocale } from "@/lib/i18n/server";
import { buildLocalizedMetadata } from "@/lib/i18n/seo";

const META_COPY = {
  en: {
    title: "Player Statistics",
    description:
      "Look up detailed statistics for any player on OnThePixel.net — playtime, rank, Duels, BuildFFA and more.",
  },
  de: {
    title: "Spieler-Statistiken",
    description:
      "Sieh dir detaillierte Statistiken für jeden Spieler auf OnThePixel.net an — Spielzeit, Rang, Duels, BuildFFA und mehr.",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { title, description } = META_COPY[locale];
  return buildLocalizedMetadata({ locale, path: "/stats", title, description });
}

export default function StatisticsPage() {
  return (
    <>
      <TopPage />
      <PlayerStatistics />
    </>
  );
}
