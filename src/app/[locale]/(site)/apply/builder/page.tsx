import React from "react";
import { LocaleLink } from "@/components/LocaleLink";
import type { Metadata } from "next";
import TopPage from "@/components/page/top";
import ApplicationForm, {
  ApplicationField,
} from "@/components/page/ApplicationForm";
import {
  getRouteLocale,
  getRouteTranslations,
  type LocalePageProps,
} from "@/lib/i18n/server";
import { buildLocalizedMetadata } from "@/lib/i18n/seo";
import {
  BREADCRUMB_LABELS,
  buildBreadcrumbList,
  jsonLdScriptProps,
} from "@/lib/jsonld";
import type { Translations } from "@/lib/i18n/translations";
import { isPositionOpen } from "@/lib/apply";

const META_COPY = {
  en: {
    title: "Apply as Builder",
    description:
      "Apply to join the OnThePixel.net team as a Builder — design maps, arenas and game worlds for our Minecraft minigame server. See the requirements and apply online.",
  },
  de: {
    title: "Als Builder bewerben",
    description:
      "Bewirb dich als Builder im OnThePixel.net-Team — gestalte Maps, Arenen und Spielwelten für unseren Minecraft-Minigame-Server. Anforderungen ansehen und direkt bewerben.",
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
  return buildLocalizedMetadata({
    locale,
    path: "/apply/builder",
    title,
    description,
  });
}


export default async function BuilderApplicationPage({ params }: LocalePageProps) {
  const [open, { locale, t }] = await Promise.all([
    isPositionOpen("Builder"),
    getRouteTranslations(params),
  ]);
  const { title } = META_COPY[locale];

  const fields: ApplicationField[] = [
    {
      id: "minecraft_username",
      label: t.builderForm.labelUsername,
      type: "text",
      placeholder: t.builderForm.placeholderUsername,
    },
    {
      id: "portfolio",
      label: t.builderForm.labelPortfolio,
      type: "textarea",
      placeholder: t.builderForm.placeholderPortfolio,
      description: t.builderForm.descriptionPortfolio,
    },
    {
      id: "motivation",
      label: t.builderForm.labelMotivation,
      type: "textarea",
      placeholder: t.builderForm.placeholderMotivation,
    },
  ];

  return (
    <>
      <script
        {...jsonLdScriptProps(
          buildBreadcrumbList(locale, [
            { name: BREADCRUMB_LABELS.apply[locale], path: "/apply" },
            { name: title, path: "/apply/builder" },
          ]),
        )}
      />
      <TopPage />
      {open ? (
        <ApplicationForm
          position="Builder"
          fields={fields}
          apiEndpoint="builder"
        />
      ) : (
        <ClosedNotice position="Builder" t={t} />
      )}
    </>
  );
}

// Rendered inside the page, so it is handed the dictionary the page
// already resolved rather than resolving it a second time.
function ClosedNotice({
  position,
  t,
}: {
  position: string;
  t: Translations;
}) {
  return (
    <section className="min-h-screen bg-gray-950">
      <div className="container mx-auto px-4 py-10">
        <div className="mx-auto max-w-xl">
          <LocaleLink
            href="/apply"
            className="mb-6 inline-block text-sm text-gray-400 transition-colors duration-200 hover:text-green-400"
          >
            ← {t.applyClosed.backToPositions}
          </LocaleLink>
          <div className="rounded-lg bg-white/5 p-8 text-center">
            <h1 className="mb-3 text-2xl font-bold">
              {position} {t.applyClosed.titleSuffix}
            </h1>
            <p className="mb-6 text-gray-400">
              {t.applyClosed.message.replace("{position}", position)}
            </p>
            <LocaleLink
              href="/apply"
              className="inline-block rounded-lg bg-green-600 px-6 py-3 text-white transition-colors hover:bg-green-700"
            >
              {t.applyClosed.viewAll}
            </LocaleLink>
          </div>
        </div>
      </div>
    </section>
  );
}
