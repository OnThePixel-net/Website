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

export async function generateMetadata({
  params,
}: LocalePageProps): Promise<Metadata> {
  const locale = await getRouteLocale(params);
  const { title, description } = META_COPY[locale];
  return buildLocalizedMetadata({
    locale,
    path: "/leaderboard/pixels",
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
            { name: title, path: "/leaderboard/pixels" },
          ]),
        )}
      />
      <script
        {...jsonLdScriptProps(
          buildItemList({ locale, path: "/leaderboard/pixels", name: title, description }),
        )}
      />
      <TopPage />
      <section className="bg-gray-950 pt-36">
        <div className="container mx-auto px-4 py-10">
          <h1 className="mb-5 text-2xl font-bold">
            {t.leaderboardPixels.heading}
          </h1>
          <p className="mb-8 text-gray-400">{t.leaderboardPixels.intro}</p>

          <LeaderboardTable
            locale={locale}
            title={t.leaderboardPixels.title}
            description={t.leaderboardPixels.description}
            endpoint="leaderbords/pixels"
            statColumns={[
              { key: "pixels", label: t.leaderboardPixels.colPixels },
            ]}
          />
        </div>
      </section>
    </div>
  );
}
