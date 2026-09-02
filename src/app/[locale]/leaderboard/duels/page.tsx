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

export async function generateMetadata({
  params,
}: LocalePageProps): Promise<Metadata> {
  const locale = await getRouteLocale(params);
  const { title, description } = META_COPY[locale];
  return buildLocalizedMetadata({
    locale,
    path: "/leaderboard/duels",
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
            { name: title, path: "/leaderboard/duels" },
          ]),
        )}
      />
      <script
        {...jsonLdScriptProps(
          buildItemList({ locale, path: "/leaderboard/duels", name: title, description }),
        )}
      />
      <TopPage />
      <section className="bg-gray-950 pt-36">
        <div className="container mx-auto px-4 py-10">
          <h1 className="mb-5 text-2xl font-bold">
            {t.leaderboardDuels.heading}
          </h1>
          <p className="mb-8 text-gray-400">{t.leaderboardDuels.intro}</p>

          <LeaderboardTable
            locale={locale}
            title={t.leaderboardDuels.title}
            description={t.leaderboardDuels.description}
            endpoint="leaderbords/duels/wins"
            statColumns={[
              { key: "wins", label: t.leaderboardDuels.colWins },
              { key: "losses", label: t.leaderboardDuels.colLosses },
              {
                key: "total_games",
                label: t.leaderboardDuels.colTotalGames,
              },
              { key: "kd_ratio", label: t.leaderboardDuels.colKD },
            ]}
          />
        </div>
      </section>
    </div>
  );
}
