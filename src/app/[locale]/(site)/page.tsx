import React from "react";
import type { Metadata } from "next";
import Header from "@/components/page/header";
import Trailer from "@/components/page/trailer";
import Team from "@/components/page/team";
import News from "@/components/page/news";
import { getRouteLocale, type LocalePageProps } from "@/lib/i18n/server";
import { buildLocalizedMetadata } from "@/lib/i18n/seo";

const COPY = {
  en: {
    title: "OnThePixel.net — Minecraft Minigame Server",
    description:
      "The best Minecraft minigame server — Duels, BuildFFA, TNT Run, BedWars and more. Join thousands of players on play.onthepixel.net.",
  },
  de: {
    title: "OnThePixel.net — Minecraft-Minigame-Server",
    description:
      "Der beste Minecraft-Minigame-Server — Duels, BuildFFA, TNT Run, BedWars und mehr. Spiele jetzt auf play.onthepixel.net.",
  },
} as const;

// News comes straight from the database, not through `fetch`, so it carries
// no cache hint of its own. Without a revalidate window the page would be
// prerendered once at build time and then never pick up a new article again.
export const revalidate = 60;

export async function generateMetadata({
  params,
}: LocalePageProps): Promise<Metadata> {
  const locale = await getRouteLocale(params);
  const { title, description } = COPY[locale];
  return buildLocalizedMetadata({ locale, path: "/", title, description });
}

export default async function Home({ params }: LocalePageProps) {
  const locale = await getRouteLocale(params);

  return (
    <>
      <Header />
      <Trailer />
      <News locale={locale} />
      <Team as="h2" locale={locale} />
    </>
  );
}
