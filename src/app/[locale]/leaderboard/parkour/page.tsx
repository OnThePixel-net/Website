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

export async function generateMetadata({
  params,
}: LocalePageProps): Promise<Metadata> {
  const locale = await getRouteLocale(params);
  const { title, description } = META_COPY[locale];
  return buildLocalizedMetadata({
    locale,
    path: "/leaderboard/parkour",
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
            { name: title, path: "/leaderboard/parkour" },
          ]),
        )}
      />
      <script
        {...jsonLdScriptProps(
          buildItemList({ locale, path: "/leaderboard/parkour", name: title, description }),
        )}
      />
      <TopPage />
      <section className="bg-gray-950 pt-36">
        <div className="container mx-auto px-4 py-10">
          <h1 className="mb-5 text-2xl font-bold">
            {t.leaderboardParkour.heading}
          </h1>
          <p className="mb-8 text-gray-400">{t.leaderboardParkour.intro}</p>

          <LeaderboardTable
            locale={locale}
            title={t.leaderboardParkour.title}
            description={t.leaderboardParkour.description}
            endpoint="leaderboard/parkour"
            statColumns={[
              { key: "bestTime", label: t.leaderboardParkour.colBestTime },
              {
                key: "completions",
                label: t.leaderboardParkour.colCompletions,
              },
              { key: "difficulty", label: t.leaderboardParkour.colDifficulty },
              {
                key: "checkpoints",
                label: t.leaderboardParkour.colCheckpoints,
              },
            ]}
          />
        </div>
      </section>
    </div>
  );
}
