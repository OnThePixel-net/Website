"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { localizePath, stripLocalePrefix } from "@/lib/i18n/paths";
import {
  Locale,
  LOCALE_LABELS,
  SUPPORTED_LOCALES,
} from "@/lib/i18n/translations";
import { cn } from "@/lib/utils";

/**
 * The switcher is the one place that deliberately links *out* of the current
 * locale, so it builds its hrefs from an explicit locale instead of from
 * context — which is why it uses next/link directly rather than LocaleLink.
 * The spelling still comes from `localizePath`, the same helper every other
 * internal link and every canonical tag goes through.
 *
 * Changing language is a navigation, not a state update: the locale lives in
 * the URL now, so pushing the other locale's URL is what actually switches it.
 * `rememberLocale` only writes the choice down for later.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, rememberLocale, t } = useLanguage();
  const router = useRouter();
  const pathname = usePathname();
  // Locale-free form of the current page, so it can be rebuilt in any locale.
  const cleanPath = stripLocalePrefix(pathname || "/");

  const handleChange = (next: Locale) => {
    if (next === locale) return;
    rememberLocale(next);
    router.push(localizePath(next, cleanPath));
  };

  return (
    <label className={cn("relative inline-flex items-center", className)}>
      <span className="sr-only">{t.common.language}</span>
      <select
        aria-label={t.common.language}
        value={locale}
        onChange={(e) => handleChange(e.target.value as Locale)}
        className="cursor-pointer rounded-md border border-gray-700 bg-gray-950 px-2 py-1 text-xs font-medium text-gray-400 hover:text-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
      >
        {SUPPORTED_LOCALES.map((loc) => (
          <option key={loc} value={loc}>
            {loc.toUpperCase()} — {LOCALE_LABELS[loc]}
          </option>
        ))}
      </select>
      {/*
        Crawlable counterparts of the <select> options. A select driven by
        router.push() is invisible to search engines, which left the German
        pages without a single internal inbound link — discoverable only via
        the sitemap, and with a weakened hreflang pairing. These are real
        anchors with full hrefs, kept in the DOM and in the HTML source by
        `sr-only` (never `hidden`/`display:none`, which would hide them from
        crawlers again). The class positions them absolutely, so they add
        nothing to the layout and the switcher looks exactly as before.
      */}
      <span className="sr-only">
        {SUPPORTED_LOCALES.map((loc) => (
          <Link
            key={loc}
            href={localizePath(loc, cleanPath)}
            hrefLang={loc}
            rel="alternate"
            aria-current={loc === locale ? "true" : undefined}
            onClick={() => rememberLocale(loc)}
          >
            {LOCALE_LABELS[loc]}
          </Link>
        ))}
      </span>
    </label>
  );
}
