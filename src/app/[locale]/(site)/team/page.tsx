import React from "react";
import Team from "@/components/page/team";
import TopPage from "@/components/page/top";
import type { Metadata } from "next";
import { getRouteLocale, type LocalePageProps } from "@/lib/i18n/server";
import { buildLocalizedMetadata } from "@/lib/i18n/seo";
import { buildBreadcrumbList, jsonLdScriptProps } from "@/lib/jsonld";

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

export async function generateMetadata({
  params,
}: LocalePageProps): Promise<Metadata> {
  const locale = await getRouteLocale(params);
  const { title, description } = META_COPY[locale];
  return buildLocalizedMetadata({ locale, path: "/team", title, description });
}

export default async function Home({ params }: LocalePageProps) {
  const locale = await getRouteLocale(params);
  const { title } = META_COPY[locale];

  return (
    <section className="min-h-screen bg-gray-950">
      <script
        {...jsonLdScriptProps(
          buildBreadcrumbList(locale, [{ name: title, path: "/team" }]),
        )}
      />
      <TopPage />
      {/* Standalone page — the team heading is this page's only h1. */}
      <Team as="h1" locale={locale} />
    </section>
  );
}
