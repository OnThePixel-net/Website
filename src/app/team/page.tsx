import React from "react";
import Team from "@/components/page/team";
import TopPage from "@/components/page/top";
import type { Metadata } from "next";
import { getServerLocale } from "@/lib/i18n/server";
import { buildLocalizedMetadata } from "@/lib/i18n/seo";

const META_COPY = {
  en: {
    title: "Team",
    description:
      "Meet the people behind OnThePixel.net — our developers, builders, supporters and more.",
  },
  de: {
    title: "Team",
    description:
      "Lerne die Menschen hinter OnThePixel.net kennen — unsere Entwickler, Builder, Supporter und mehr.",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { title, description } = META_COPY[locale];
  return buildLocalizedMetadata({ locale, path: "/team", title, description });
}

export default function Home() {
  return (
    <section className="min-h-screen bg-gray-950">
      <TopPage />
      <Team />
    </section>
  );
}
