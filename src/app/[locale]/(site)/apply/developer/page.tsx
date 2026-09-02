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
    title: "Apply as Java Developer",
    description:
      "Apply as a Java Developer at OnThePixel.net — build plugins and gameplay features for our Minecraft minigame network. Check the requirements and submit your application.",
  },
  de: {
    title: "Als Java-Developer bewerben",
    description:
      "Bewirb dich als Java-Developer bei OnThePixel.net — entwickle Plugins und Gameplay-Features für unser Minecraft-Minigame-Netzwerk. Anforderungen prüfen und Bewerbung absenden.",
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
    path: "/apply/developer",
    title,
    description,
  });
}


export default async function DeveloperApplicationPage({ params }: LocalePageProps) {
  const [open, { locale, t }] = await Promise.all([
    isPositionOpen("Java Developer"),
    getRouteTranslations(params),
  ]);
  const { title } = META_COPY[locale];

  const fields: ApplicationField[] = [
    {
      id: "minecraft_username",
      label: t.developerForm.labelUsername,
      type: "text",
      placeholder: t.developerForm.placeholderUsername,
    },
    {
      id: "github",
      label: t.developerForm.labelGithub,
      type: "text",
      placeholder: t.developerForm.placeholderGithub,
      description: t.developerForm.descriptionGithub,
    },
    {
      id: "motivation",
      label: t.developerForm.labelMotivation,
      type: "textarea",
      placeholder: t.developerForm.placeholderMotivation,
    },
  ];

  return (
    <>
      <script
        {...jsonLdScriptProps(
          buildBreadcrumbList(locale, [
            { name: BREADCRUMB_LABELS.apply[locale], path: "/apply" },
            { name: title, path: "/apply/developer" },
          ]),
        )}
      />
      <TopPage />
      {open ? (
        <ApplicationForm
          position="Java Developer"
          fields={fields}
          apiEndpoint="developer"
        />
      ) : (
        <ClosedNotice position="Java Developer" t={t} />
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
