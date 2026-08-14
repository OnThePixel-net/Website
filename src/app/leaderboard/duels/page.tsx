import type { Metadata } from "next";
import { getServerLocale } from "@/lib/i18n/server";
import { buildLocalizedMetadata } from "@/lib/i18n/seo";
import DuelsLeaderboard from "./duels-client";

const META_COPY = {
  en: {
    title: "Duels Leaderboard",
    description:
      "The top Duels players on OnThePixel.net. Live ranking by wins, losses, games played and K/D ratio.",
  },
  de: {
    title: "Duels-Bestenliste",
    description:
      "Die besten Duels-Spieler auf OnThePixel.net. Live-Rangliste nach Siegen, Niederlagen, Spielen und K/D-Verhältnis.",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { title, description } = META_COPY[locale];
  return buildLocalizedMetadata({
    locale,
    path: "/leaderboard/duels",
    title,
    description,
  });
}

export default function Page() {
  return <DuelsLeaderboard />;
}
