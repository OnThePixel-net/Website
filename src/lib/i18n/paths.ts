import { DEFAULT_LOCALE, Locale, SUPPORTED_LOCALES } from "./translations";

/**
 * How a locale-free path maps onto the URL it is actually served at.
 *
 * Every page lives under the `app/[locale]` route segment, but the default
 * locale keeps the bare URLs it has always been indexed under: "/about/" is
 * English, "/de/about/" is German. `trailingSlash: true` means the served
 * form always ends in a slash.
 *
 * This module is the single place that knows those two rules. Internal links
 * (LocaleLink), canonical tags and hreflang alternates (seo.ts) and the
 * sitemap all go through it, so a link can never disagree with the canonical
 * tag of the page it points at about how that page is spelled.
 */

// A href addressing something outside our route tree: an absolute URL
// ("https://…"), a non-http scheme ("mailto:", "tel:") or a protocol-relative
// host ("//cdn.example"). None of those may ever gain a locale prefix.
const HAS_SCHEME_OR_HOST = /^(?:[a-z][a-z\d+.-]*:|\/\/)/i;

/**
 * True for the hrefs this module may rewrite: root-relative paths of this
 * site. Bare fragments ("#news") and bare queries ("?page=2") resolve against
 * the current page and are therefore already correct in every locale, so they
 * are left alone as well.
 */
export function isLocalizablePath(href: string): boolean {
  return href.startsWith("/") && !HAS_SCHEME_OR_HOST.test(href);
}

/**
 * Rewrite a locale-free, root-relative path into the path it is served at in
 * `locale`.
 *
 * `path` may be written with or without a leading or trailing slash —
 * "about", "/about" and "/about/" all produce the same result. A query string
 * or fragment is kept verbatim behind the normalised path, so "/privacy#twitch"
 * becomes "/de/privacy/#twitch" and not "/de/privacy#twitch/".
 *
 * The input must not already carry a locale prefix; pass it through
 * `stripLocalePrefix` first if it might (see LanguageSwitcher).
 */
export function localizePath(locale: Locale, path: string): string {
  if (!isLocalizablePath(path)) return path;

  const suffixAt = path.search(/[?#]/);
  const pathname = suffixAt === -1 ? path : path.slice(0, suffixAt);
  const suffix = suffixAt === -1 ? "" : path.slice(suffixAt);

  const clean = pathname.replace(/^\/+/, "").replace(/\/+$/, "");
  const prefix = locale === DEFAULT_LOCALE ? "" : `/${locale}`;
  return `${prefix}/${clean ? `${clean}/` : ""}${suffix}`;
}

/**
 * Inverse of `localizePath`: the locale-free form of a pathname.
 *
 * Both spellings of a page have to collapse onto the same value, because the
 * result is used both to compare against link targets (nav highlighting) and
 * to rebuild the URL in another locale. "/de/team/", "/team/" and the
 * internally rewritten "/en/team/" therefore all yield "/team/".
 */
export function stripLocalePrefix(pathname: string): string {
  const segments = pathname.split("/").filter(Boolean);
  if (
    segments.length > 0 &&
    (SUPPORTED_LOCALES as readonly string[]).includes(segments[0])
  ) {
    segments.shift();
  }
  return segments.length > 0 ? `/${segments.join("/")}/` : "/";
}
