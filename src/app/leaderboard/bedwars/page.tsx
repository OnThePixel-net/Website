import type { Metadata } from "next";
import { getServerLocale } from "@/lib/i18n/server";
import { buildLocalizedMetadata } from "@/lib/i18n/seo";
import BWLeaderboard from "./bedwars-client";

const META_COPY = {
  en: {
    title: "BedWars Leaderboard",
    description:
      "The top BedWars players on OnThePixel.net. Live ranking by in-game balance and performance.",
  },
  de: {
    title: "BedWars-Bestenliste",
    description:
      "Die besten BedWars-Spieler auf OnThePixel.net. Live-Rangliste nach Ingame-Guthaben und Leistung.",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { title, description } = META_COPY[locale];
  return buildLocalizedMetadata({
    locale,
    path: "/leaderboard/bedwars",
    title,
    description,
  });
}

export default function Page() {
  return <BWLeaderboard />;
}
