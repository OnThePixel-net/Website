import type { Metadata } from "next";
import { getServerLocale } from "@/lib/i18n/server";
import { buildLocalizedMetadata } from "@/lib/i18n/seo";
import Leaderboards from "./leaderboard-client";

const META_COPY = {
  en: {
    title: "Leaderboards",
    description:
      "See who's on top at OnThePixel.net. Live rankings for Pixels, BuildFFA, Duels, BedWars and more Minecraft minigames.",
  },
  de: {
    title: "Bestenlisten",
    description:
      "Sieh, wer bei OnThePixel.net an der Spitze steht. Live-Ranglisten für Pixels, BuildFFA, Duels, BedWars und weitere Minecraft-Minigames.",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { title, description } = META_COPY[locale];
  return buildLocalizedMetadata({
    locale,
    path: "/leaderboard",
    title,
    description,
  });
}

export default function Page() {
  return <Leaderboards />;
}
