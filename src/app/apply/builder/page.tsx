import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import TopPage from "@/components/page/top";
import ApplicationForm, {
  ApplicationField,
} from "@/components/page/ApplicationForm";
import { getServerLocale, getServerTranslations } from "@/lib/i18n/server";
import { buildLocalizedMetadata } from "@/lib/i18n/seo";

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

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const { title, description } = META_COPY[locale];
  return buildLocalizedMetadata({
    locale,
    path: "/apply/builder",
    title,
    description,
  });
}

async function isPositionOpen(name: string): Promise<boolean> {
  try {
    const res = await fetch("https://cms.onthepixel.net/items/Apply", {
      next: { revalidate: 60 },
    });
    const data = await res.json();
    const position = (data.data ?? []).find(
      (p: { name: string; status: string }) => p.name === name,
    );
    return position?.status === "open";
  } catch {
    return false;
  }
}

export default async function BuilderApplicationPage() {
  const [open, { t }] = await Promise.all([
    isPositionOpen("Builder"),
    getServerTranslations(),
  ]);

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
      <TopPage />
      {open ? (
        <ApplicationForm
          position="Builder"
          fields={fields}
          apiEndpoint="builder"
        />
      ) : (
        <ClosedNotice position="Builder" />
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
