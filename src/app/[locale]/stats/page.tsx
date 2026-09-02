import React from "react";
import type { Metadata } from "next";
import TopPage from "@/components/page/top";
import PlayerStatistics from "@/components/page/PlayerStatistics";
import { getRouteLocale, type LocalePageProps } from "@/lib/i18n/server";
import { buildLocalizedMetadata } from "@/lib/i18n/seo";
import { buildBreadcrumbList, jsonLdScriptProps } from "@/lib/jsonld";

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

export async function generateMetadata({
  params,
}: LocalePageProps): Promise<Metadata> {
  const locale = await getRouteLocale(params);
  const { title, description } = META_COPY[locale];
  return buildLocalizedMetadata({ locale, path: "/stats", title, description });
}

export default async function StatisticsPage({ params }: LocalePageProps) {
  const locale = await getRouteLocale(params);
  const { title } = META_COPY[locale];

  return (
    <>
      <script
        {...jsonLdScriptProps(
          buildBreadcrumbList(locale, [{ name: title, path: "/stats" }]),
        )}
      />
      <TopPage />
      <PlayerStatistics />
    </>
  );
}
