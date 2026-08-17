import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import TopPage from "@/components/page/top";
import ApplicationForm, {
  ApplicationField,
} from "@/components/page/ApplicationForm";
import { getServerLocale, getServerTranslations } from "@/lib/i18n/server";
import { buildLocalizedMetadata } from "@/lib/i18n/seo";
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

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { title, description } = META_COPY[locale];
  return buildLocalizedMetadata({
    locale,
    path: "/apply/developer",
    title,
    description,
  });
}


export default async function DeveloperApplicationPage() {
  const [open, { t }] = await Promise.all([
    isPositionOpen("Java Developer"),
    getServerTranslations(),
  ]);

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
      <TopPage />
      {open ? (
        <ApplicationForm
          position="Java Developer"
          fields={fields}
          apiEndpoint="developer"
        />
      ) : (
        <ClosedNotice position="Java Developer" />
      )}
    </>
  );
}

async function ClosedNotice({ position }: { position: string }) {
  const { t } = await getServerTranslations();
  return (
    <section className="min-h-screen bg-gray-950">
      <div className="container mx-auto px-4 py-10">
        <div className="mx-auto max-w-xl">
          <Link
            href="/apply"
            className="mb-6 inline-block text-sm text-gray-400 transition-colors duration-200 hover:text-green-400"
          >
            ← {t.applyClosed.backToPositions}
          </Link>
          <div className="rounded-lg bg-white/5 p-8 text-center">
            <h1 className="mb-3 text-2xl font-bold">
              {position} {t.applyClosed.titleSuffix}
            </h1>
            <p className="mb-6 text-gray-400">
              {t.applyClosed.message.replace("{position}", position)}
            </p>
            <Link
              href="/apply"
              className="inline-block rounded-lg bg-green-600 px-6 py-3 text-white transition-colors hover:bg-green-700"
            >
              {t.applyClosed.viewAll}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
