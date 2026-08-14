import type { Metadata } from "next";
import { getServerLocale } from "@/lib/i18n/server";
import { buildLocalizedMetadata } from "@/lib/i18n/seo";
import BuildFFALeaderboard from "./buildffa-client";

const META_COPY = {
  en: {
    title: "BuildFFA Leaderboard",
    description:
      "The best BuildFFA fighters on OnThePixel.net. Live ranking by kills, deaths and K/D ratio.",
  },
  de: {
    title: "BuildFFA-Bestenliste",
    description:
      "Die besten BuildFFA-Kämpfer auf OnThePixel.net. Live-Rangliste nach Kills, Toden und K/D-Verhältnis.",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { title, description } = META_COPY[locale];
  return buildLocalizedMetadata({
    locale,
    path: "/leaderboard/buildffa",
    title,
    description,
  });
}

export default function Page() {
  return <BuildFFALeaderboard />;
}
