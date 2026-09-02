import { localizedUrl, SITE_NAME, SITE_URL } from "@/lib/i18n/seo";
import type { Locale } from "@/lib/i18n/translations";

/**
 * Reusable schema.org (JSON-LD) builders.
 *
 * Every URL emitted here goes through `localizedUrl()`, the same helper the
 * canonical tags and the sitemap use. That keeps a page spelled identically
 * everywhere — locale prefix and trailing slash included — so crawlers can
 * match the structured data to the canonical URL instead of treating it as
 * a separate document.
 *
 * Only mark up what is actually visible on the page. No invented ratings,
 * player names or FAQ entries.
 */

type JsonLdValue = string | number | boolean | null | JsonLdValue[] | JsonLd;
export interface JsonLd {
  [key: string]: JsonLdValue | undefined;
}

const SCHEMA_CONTEXT = "https://schema.org";

/** The publisher/provider of every game and list on this site. */
function organization(): JsonLd {
  return {
    "@type": "Organization",
    name: SITE_NAME,
    url: `${SITE_URL}/`,
  };
}

function schemaLanguage(locale: Locale): string {
  return locale === "de" ? "de-DE" : "en-US";
}

/**
 * Props for a `<script type="application/ld+json">` element, matching the
 * inline pattern already used in the root layout and the news article page.
 *
 * `<` is escaped so a stray "</script>" in any future data source cannot
 * break out of the script element.
 */
export function jsonLdScriptProps(data: JsonLd) {
  return {
    type: "application/ld+json",
    dangerouslySetInnerHTML: {
      __html: JSON.stringify(data).replace(/</g, "\\u003c"),
    },
  };
}

/** Breadcrumb ancestors that appear in more than one trail. */
export const BREADCRUMB_LABELS = {
  home: { en: "Home", de: "Startseite" },
  apply: { en: "Apply", de: "Bewerben" },
  leaderboard: { en: "Leaderboards", de: "Bestenlisten" },
} satisfies Record<string, Record<Locale, string>>;

export interface BreadcrumbItem {
  /** Visible, localized label of the step. */
  name: string;
  /** Locale-free path starting with "/", e.g. "/leaderboard/duels". */
  path: string;
}

/**
 * BreadcrumbList for a public sub-page. The home entry is prepended
 * automatically, so `trail` only holds the steps below it — for
 * /leaderboard/duels/ that is [Leaderboards, Duels Leaderboard].
 */
export function buildBreadcrumbList(
  locale: Locale,
  trail: BreadcrumbItem[],
): JsonLd {
  const items: BreadcrumbItem[] = [
    { name: BREADCRUMB_LABELS.home[locale], path: "/" },
    ...trail,
  ];

  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: localizedUrl(locale, item.path),
    })),
  };
}

/**
 * VideoGame markup for a minigame landing page. Deliberately carries no
 * aggregateRating — we have no review data, and inventing one would be
 * rich-snippet spam.
 */
export function buildVideoGame(opts: {
  locale: Locale;
  path: string;
  name: string;
  description: string;
}): JsonLd {
  const { locale, path, name, description } = opts;
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "VideoGame",
    name,
    description,
    url: localizedUrl(locale, path),
    inLanguage: schemaLanguage(locale),
    gamePlatform: "Minecraft (Java Edition)",
    playMode: "MultiPlayer",
    applicationCategory: "Game",
    publisher: organization(),
    provider: organization(),
  };
}

/**
 * ItemList for a leaderboard page. The ranking itself is fetched in the
 * browser, so the server has no entries to mark up — this describes the
 * list, without fabricating positions or player names.
 */
export function buildItemList(opts: {
  locale: Locale;
  path: string;
  name: string;
  description: string;
}): JsonLd {
  const { locale, path, name, description } = opts;
  return {
    "@context": SCHEMA_CONTEXT,
    "@type": "ItemList",
    name,
    description,
    url: localizedUrl(locale, path),
    inLanguage: schemaLanguage(locale),
  };
}
