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

export async function generateMetadata({
  params,
}: LocalePageProps): Promise<Metadata> {
  const locale = await getRouteLocale(params);
  const { title, description } = META_COPY[locale];
  return buildLocalizedMetadata({
    locale,
    path: "/leaderboard/buildffa",
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
            { name: title, path: "/leaderboard/buildffa" },
          ]),
        )}
      />
      <script
        {...jsonLdScriptProps(
          buildItemList({ locale, path: "/leaderboard/buildffa", name: title, description }),
        )}
      />
      <TopPage />
      <section className="bg-gray-950 pt-36">
        <div className="container mx-auto px-4 py-10">
          <h1 className="mb-5 text-2xl font-bold">
            {t.leaderboardBuildFFA.heading}
          </h1>
          <p className="mb-8 text-gray-400">{t.leaderboardBuildFFA.intro}</p>

          <LeaderboardTable
            locale={locale}
            title={t.leaderboardBuildFFA.title}
            description={t.leaderboardBuildFFA.description}
            endpoint="leaderbords/Buildffa"
            statColumns={[
              { key: "kills", label: t.leaderboardBuildFFA.colKills },
              { key: "deaths", label: t.leaderboardBuildFFA.colDeaths },
              { key: "kdRatio", label: t.leaderboardBuildFFA.colKD },
            ]}
          />
        </div>
      </section>
    </div>
  );
}
