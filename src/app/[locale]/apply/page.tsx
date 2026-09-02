import { LocaleLink } from "@/components/LocaleLink";
import React from "react";
import TopPage from "@/components/page/top";
import type { Metadata } from "next";
import {
  getRouteLocale,
  getRouteTranslations,
  type LocalePageProps,
} from "@/lib/i18n/server";
import { buildLocalizedMetadata } from "@/lib/i18n/seo";
import { buildBreadcrumbList, jsonLdScriptProps } from "@/lib/jsonld";
import { listApplyPositions, POSITION_ROUTES } from "@/lib/apply";

const META_COPY = {
  en: {
    title: "Apply",
    description:
      "Join the OnThePixel.net team! Apply as a Builder, Supporter or Java Developer and help shape the server.",
  },
  de: {
    title: "Bewerben",
    description:
      "Werde Teil des OnThePixel.net-Teams! Bewirb dich als Builder, Supporter oder Java-Developer und gestalte den Server mit.",
  },
} as const;

// Whether a position is open is read straight from the database, not through
// `fetch`, so it carries no cache hint of its own. Without a revalidate
// window the page would freeze at whatever the status was at build time.
export const revalidate = 60;

export async function generateMetadata({
  params,
}: LocalePageProps): Promise<Metadata> {
  const locale = await getRouteLocale(params);
  const { title, description } = META_COPY[locale];
  return buildLocalizedMetadata({ locale, path: "/apply", title, description });
}

interface Position {
  id: number;
  status: string;
  name: string;
}

async function getPositions(): Promise<Position[]> {
  const positions = await listApplyPositions();
  return positions.map((p) => ({ id: p.id, name: p.name, status: p.status }));
}

export default async function ApplyPage({ params }: LocalePageProps) {
  const [positions, { locale, t }] = await Promise.all([
    getPositions(),
    getRouteTranslations(params),
  ]);
  const { title } = META_COPY[locale];

  const descriptions: Record<string, string> = {
    "Builder": t.apply.builderDesc,
    "Supporter": t.apply.supporterDesc,
    "Java Developer": t.apply.developerDesc,
  };

  return (
    <>
      <script
        {...jsonLdScriptProps(
          buildBreadcrumbList(locale, [{ name: title, path: "/apply" }]),
        )}
      />
      <TopPage />
      <section className="bg-gray-950 pt-36">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-2xl font-bold mb-5">{t.apply.heading}</h1>
          <p className="mb-8">{t.apply.intro}</p>

          {positions.length === 0 ? (
            <div className="text-gray-400">{t.apply.empty}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {positions.map((position) => {
                const isOpen = position.status === "open";
                const route = POSITION_ROUTES[position.name];
                const description = descriptions[position.name] ?? "";

                const card = (
                  <div
                    className={`h-full flex flex-col bg-white/5 rounded-lg overflow-hidden transition-all duration-300 ${
                      isOpen && route
                        ? "hover:scale-105 hover:bg-white/10 border border-transparent hover:border-green-500/50 group"
                        : "opacity-50"
                    }`}
                  >
                    <div className="flex flex-col flex-1 p-5">
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-xl font-bold">{position.name}</h2>
                        <span
                          className={`text-xs font-bold px-2 py-0.5 rounded border ${
                            isOpen
                              ? "bg-green-500/20 text-green-400 border-green-500/30"
                              : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                          }`}
                        >
                          {isOpen ? t.apply.open : t.apply.closed}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 flex-1">{description}</p>
                      <span
                        className={`text-sm mt-4 ${
                          isOpen && route
                            ? "text-green-400 group-hover:text-green-300 transition-colors"
                            : "invisible"
                        }`}
                      >
                        {t.apply.applyNow} →
                      </span>
                    </div>
                  </div>
                );

                if (isOpen && route) {
                  return (
                    <LocaleLink key={position.id} href={route} className="block h-full">
                      {card}
                    </LocaleLink>
                  );
                }

                return (
                  <div key={position.id} className="h-full">
                    {card}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
