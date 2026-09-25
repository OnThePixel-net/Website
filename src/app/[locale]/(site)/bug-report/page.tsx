import React from "react";
import type { Metadata } from "next";
import TopPage from "@/components/page/top";
import BugReportForm from "@/components/page/BugReportForm";
import {
  getRouteLocale,
  getRouteTranslations,
  type LocalePageProps,
} from "@/lib/i18n/server";
import { buildLocalizedMetadata } from "@/lib/i18n/seo";
import { buildBreadcrumbList, jsonLdScriptProps } from "@/lib/jsonld";

export async function generateMetadata({
  params,
}: LocalePageProps): Promise<Metadata> {
  const locale = await getRouteLocale(params);
  const { t } = await getRouteTranslations(params);
  return buildLocalizedMetadata({
    locale,
    path: "/bug-report",
    title: t.bugReport.metaTitle,
    description: t.bugReport.metaDescription,
  });
}

export default async function BugReportPage({ params }: LocalePageProps) {
  const { locale, t } = await getRouteTranslations(params);

  return (
    <>
      <script
        {...jsonLdScriptProps(
          buildBreadcrumbList(locale, [
            { name: t.bugReport.title, path: "/bug-report" },
          ]),
        )}
      />
      <TopPage />
      <BugReportForm />
    </>
  );
}
