import Link from "next/link";
import React from "react";
import TopPage from "@/components/page/top";
import type { Metadata } from "next";
import { getServerLocale, getServerTranslations } from "@/lib/i18n/server";
import { buildLocalizedMetadata } from "@/lib/i18n/seo";

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

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { title, description } = META_COPY[locale];
  return buildLocalizedMetadata({ locale, path: "/apply", title, description });
}

interface Position {
  id: number;
  status: string;
  name: string;
}

const POSITION_ROUTES: Record<string, string> = {
  "Builder": "/apply/builder",
  "Supporter": "/apply/supporter",
  "Java Developer": "/apply/developer",
};

async function getPositions(): Promise<Position[]> {
  try {
    const res = await fetch("https://cms.onthepixel.net/items/Apply", {
      next: { revalidate: 60 },
    });
    const data = await res.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export default async function ApplyPage() {
  const [positions, { t }] = await Promise.all([
    getPositions(),
    getServerTranslations(),
  ]);

  const descriptions: Record<string, string> = {
    "Builder": t.apply.builderDesc,
    "Supporter": t.apply.supporterDesc,
    "Java Developer": t.apply.developerDesc,
  };

  return (
    <>
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
                    <Link key={position.id} href={route} className="block h-full">
                      {card}
                    </Link>
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
