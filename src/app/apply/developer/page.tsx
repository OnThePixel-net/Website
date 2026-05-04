import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import TopPage from "@/components/page/top";
import ApplicationForm, { ApplicationField } from "@/components/page/ApplicationForm";
import { getServerLocale, getServerTranslations } from "@/lib/i18n/server";
import { buildLocalizedMetadata } from "@/lib/i18n/seo";

const META_COPY = {
  en: {
    title: "Apply as Java Developer",
    description: "Apply to join the OnThePixel.net team as a Java Developer.",
  },
  de: {
    title: "Als Java-Developer bewerben",
    description: "Bewirb dich als Java-Developer im OnThePixel.net-Team.",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { title, description } = META_COPY[locale];
  return buildLocalizedMetadata({ locale, path: "/apply/developer", title, description });
}

async function isPositionOpen(name: string): Promise<boolean> {
  try {
    const res = await fetch("https://cms.onthepixel.net/items/Apply", { next: { revalidate: 60 } });
    const data = await res.json();
    const position = (data.data ?? []).find((p: { name: string; status: string }) => p.name === name);
    return position?.status === "open";
  } catch {
    return false;
  }
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
        <ApplicationForm position="Java Developer" fields={fields} apiEndpoint="developer" />
      ) : (
        <ClosedNotice position="Java Developer" />
      )}
    </>
  );
}

async function ClosedNotice({ position }: { position: string }) {
  const { t } = await getServerTranslations();
  return (
    <section className="bg-gray-950 min-h-screen">
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-xl mx-auto">
          <Link
            href="/apply"
            className="inline-block mb-6 text-sm text-gray-400 hover:text-green-400 transition-colors duration-200"
          >
            ← {t.applyClosed.backToPositions}
          </Link>
          <div className="bg-white/5 rounded-lg p-8 text-center">
            <h1 className="text-2xl font-bold mb-3">
              {position} {t.applyClosed.titleSuffix}
            </h1>
            <p className="text-gray-400 mb-6">
              {t.applyClosed.message.replace("{position}", position)}
            </p>
            <Link
              href="/apply"
              className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              {t.applyClosed.viewAll}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
