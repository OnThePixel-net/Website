import type { Metadata } from "next";
import { getServerLocale } from "@/lib/i18n/server";
import { buildLocalizedMetadata } from "@/lib/i18n/seo";
import ParkourLeaderboard from "./parkour-client";

const META_COPY = {
  en: {
    title: "Parkour Leaderboard",
    description:
      "The fastest Parkour runners on OnThePixel.net. Live ranking by best time, completions, difficulty and checkpoints.",
  },
  de: {
    title: "Parkour-Bestenliste",
    description:
      "Die schnellsten Parkour-Läufer auf OnThePixel.net. Live-Rangliste nach Bestzeit, Abschlüssen, Schwierigkeit und Checkpoints.",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { title, description } = META_COPY[locale];
  return buildLocalizedMetadata({
    locale,
    path: "/leaderboard/parkour",
    title,
    description,
  });
}

export default function Page() {
  return <ParkourLeaderboard />;
}
