import React from "react";
import { notFound } from "next/navigation";
import { LocaleLink } from "@/components/LocaleLink";
import type { Metadata } from "next";
import TopPage from "@/components/page/top";
import ApplicationForm, {
  ApplicationField,
} from "@/components/page/ApplicationForm";
import {
  getRouteLocale,
  getRouteTranslations,
  type LocaleRouteParams,
} from "@/lib/i18n/server";
import { buildLocalizedMetadata } from "@/lib/i18n/seo";
import {
  BREADCRUMB_LABELS,
  buildBreadcrumbList,
  jsonLdScriptProps,
} from "@/lib/jsonld";
import type { Locale, Translations } from "@/lib/i18n/translations";
import {
  getApplyPositionBySlug,
  listApplyPositions,
  pickApplyText,
  toApplicationFields,
  type ApplyPositionWithQuestions,
} from "@/lib/apply";
import { APPLY_POSITION_SEED } from "@/lib/db/migrate";

/**
 * The application form of one position.
 *
 * This replaces the three hand-written pages (/apply/builder, /apply/developer,
 * /apply/supporter) that each carried their own `fields` array. Those URLs are
 * indexed and are kept: they are the slugs of the positions the database ships
 * with, so `generateStaticParams` still emits exactly them — a new position
 * added in the dashboard simply gets a page of its own on the next revalidate.
 */

// The route sits under app/[locale], so its params carry the locale too.
interface PageProps {
  params: Promise<LocaleRouteParams & { slug: string }>;
}

// Whether a position is open is read straight from the database, not through
// `fetch`, so it carries no cache hint of its own. Without a revalidate
// window the page would freeze at whatever the status was at build time.
export const revalidate = 60;

/**
 * What a slug resolved to. "unknown" and "unavailable" have to stay apart: an
 * unknown slug is a 404, but an unreachable database must not turn every
 * indexed application page into one — it degrades to the closed notice, which
 * is what these pages showed before when the status could not be read.
 */
type Resolved =
  | { kind: "found"; position: ApplyPositionWithQuestions }
  | { kind: "unknown" }
  | { kind: "unavailable" };

async function resolvePosition(slug: string): Promise<Resolved> {
  try {
    const position = await getApplyPositionBySlug(slug);
    return position ? { kind: "found", position } : { kind: "unknown" };
  } catch (e) {
    console.error("[apply] database read failed:", e);
    return { kind: "unavailable" };
  }
}

/**
 * The name to show when the position itself could not be read. The slugs the
 * schema ships with keep their proper names ("developer" → "Java Developer");
 * anything else is de-slugified so the page still reads like a position.
 */
function fallbackPositionName(slug: string): string {
  const seeded = APPLY_POSITION_SEED.find((p) => p.slug === slug);
  if (seeded) return seeded.name;
  return slug
    .split("-")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * The position's questions in the shape `ApplicationForm` renders. `required`
 * is carried over separately because `toApplicationFields` does not emit it,
 * and the form needs it to decide on the asterisk and the client-side check.
 * The mapping is index-by-index, which holds: `toApplicationFields` maps the
 * question list one to one, in order.
 */
function toFields(
  position: ApplyPositionWithQuestions,
  locale: Locale,
): ApplicationField[] {
  return toApplicationFields(position.questions, locale).map(
    (field, index) => ({
      ...field,
      required: position.questions[index].required,
    }),
  );
}

/**
 * Prerender the position pages the way the three hardcoded ones were
 * prerendered. Closed positions are included: they answer 200 with the closed
 * notice, exactly as before, and dropping them would hand crawlers a 404 for a
 * URL that is merely paused.
 *
 * There may be no database at build time, in which case the slugs the schema
 * ships with are used — those are the indexed URLs, and losing their static
 * copies to a build-time outage would be the one regression that is invisible
 * until a crawler notices.
 */
export async function generateStaticParams() {
  const positions = await listApplyPositions();
  const slugs =
    positions.length > 0
      ? positions.map((p) => p.slug)
      : APPLY_POSITION_SEED.map((p) => p.slug);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getRouteLocale(params);
  const { t } = await getRouteTranslations(params);
  const resolved = await resolvePosition(slug);

  const name =
    resolved.kind === "found"
      ? resolved.position.name
      : fallbackPositionName(slug);
  const title = t.applyPosition.metaTitle.replace("{position}", name);

  const described =
    resolved.kind === "found"
      ? pickApplyText(
          {
            en: resolved.position.descriptionEn,
            de: resolved.position.descriptionDe,
          },
          locale,
        )
      : "";

  return buildLocalizedMetadata({
    locale,
    path: `/apply/${slug}`,
    title,
    description:
      described || t.applyPosition.metaDescription.replace("{position}", name),
  });
}

export default async function ApplyPositionPage({ params }: PageProps) {
  const { slug } = await params;
  const { locale, t } = await getRouteTranslations(params);
  const resolved = await resolvePosition(slug);

  if (resolved.kind === "unknown") notFound();

  const position = resolved.kind === "found" ? resolved.position : null;
  const name = position ? position.name : fallbackPositionName(slug);
  const title = t.applyPosition.metaTitle.replace("{position}", name);

  return (
    <>
      <script
        {...jsonLdScriptProps(
          buildBreadcrumbList(locale, [
            { name: BREADCRUMB_LABELS.apply[locale], path: "/apply" },
            { name: title, path: `/apply/${slug}` },
          ]),
        )}
      />
      <TopPage />
      {position && position.status === "open" ? (
        <ApplicationForm
          position={name}
          fields={toFields(position, locale)}
          apiEndpoint={position.slug}
        />
      ) : (
        <ClosedNotice position={name} t={t} />
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
