import React from "react";
import type { Metadata } from "next";
import Header from "@/components/page/header";
import Trailer from "@/components/page/trailer";
import Team from "@/components/page/team";
import News from "@/components/page/news";
import { getServerLocale } from "@/lib/i18n/server";
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

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { title, description } = COPY[locale];
  return buildLocalizedMetadata({ locale, path: "/", title, description });
}

export default function Home() {
  return (
    <>
      <Header />
      <Trailer />
      <News />
      <Team />
    </>
  );
}
