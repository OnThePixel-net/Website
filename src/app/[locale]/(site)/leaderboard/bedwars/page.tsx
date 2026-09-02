import type { Metadata } from "next";
import TopPage from "@/components/page/top";
import LeaderboardTable from "@/components/page/LeaderboardTable";
import {
  getRouteLocale,
  getRouteTranslations,
  type LocalePageProps,
} from "@/lib/i18n/server";
import { buildLocalizedMetadata } from "@/lib/i18n/seo";
import {
  BREADCRUMB_LABELS,
  buildBreadcrumbList,
  buildItemList,
  jsonLdScriptProps,
} from "@/lib/jsonld";

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

export async function generateMetadata({
  params,
}: LocalePageProps): Promise<Metadata> {
  const locale = await getRouteLocale(params);
  const { title, description } = META_COPY[locale];
  return buildLocalizedMetadata({
    locale,
    path: "/leaderboard/bedwars",
    title,
    description,
  });
}

export default async function Page({ params }: LocalePageProps) {
  const { locale, t } = await getRouteTranslations(params);
  const { title, description } = META_COPY[locale];

  return (
    <div className="min-h-screen bg-gray-950">
      <script
        {...jsonLdScriptProps(
          buildBreadcrumbList(locale, [
            {
              name: BREADCRUMB_LABELS.leaderboard[locale],
              path: "/leaderboard",
            },
            { name: title, path: "/leaderboard/bedwars" },
          ]),
        )}
      />
      <script
        {...jsonLdScriptProps(
          buildItemList({ locale, path: "/leaderboard/bedwars", name: title, description }),
        )}
      />
      <TopPage />
      <section className="bg-gray-950 pt-36">
        <div className="container mx-auto px-4 py-10">
          <h1 className="mb-5 text-2xl font-bold">
            {t.leaderboardBedwars.heading}
          </h1>
          <p className="mb-8 text-gray-400">{t.leaderboardBedwars.intro}</p>

          <LeaderboardTable
            locale={locale}
            title={t.leaderboardBedwars.title}
            description={t.leaderboardBedwars.description}
            endpoint="leaderboard/bedwars"
            statColumns={[
              { key: "balance", label: t.leaderboardBedwars.colBalance },
            ]}
          />
        </div>
      </section>
    </div>
  );
}
