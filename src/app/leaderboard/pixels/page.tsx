import type { Metadata } from "next";
import { getServerLocale } from "@/lib/i18n/server";
import { buildLocalizedMetadata } from "@/lib/i18n/seo";
import PixelsLeaderboard from "./pixels-client";

const META_COPY = {
  en: {
    title: "Pixels Leaderboard",
    description:
      "The top Pixels earners on OnThePixel.net. Live ranking of the players with the most Pixels across the network.",
  },
  de: {
    title: "Pixels-Bestenliste",
    description:
      "Die besten Pixels-Sammler auf OnThePixel.net. Live-Rangliste der Spieler mit den meisten Pixels im gesamten Netzwerk.",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { title, description } = META_COPY[locale];
  return buildLocalizedMetadata({
    locale,
    path: "/leaderboard/pixels",
    title,
    description,
  });
}

export default function Page() {
  return <PixelsLeaderboard />;
}
