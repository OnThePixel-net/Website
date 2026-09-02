import { notFound } from "next/navigation";
import { getDictionary } from "./dictionaries";
import { isLocale, Locale } from "./translations";

/**
 * Locale resolution for server components.
 *
 * The locale is a real route segment (`app/[locale]`), not a cookie and not a
 * header. That is the whole point of the segment: reading `cookies()` or
 * `headers()` anywhere in a page's render path opts that page out of static
 * prerendering, and the root layout used to do exactly that — for every route
 * on the site. Nothing in here touches the request; the params of the matched
 * route are all it needs, so every page can be prerendered per locale.
 */

/** The params object a page or layout under `app/[locale]` is handed. */
export type LocaleRouteParams = { locale: string };

/** Props of every page and layout under `app/[locale]`. */
export type LocalePageProps = { params: Promise<LocaleRouteParams> };

/**
 * The locale of the route being rendered.
 *
 * `generateStaticParams` only emits supported locales, but the segment still
 * matches anything, so a hand-typed "/fr/about/" would otherwise serve English
 * content under a French URL. There is no page behind such a request, so it is
 * answered with a 404.
 */
export async function getRouteLocale(
  params: Promise<LocaleRouteParams>,
): Promise<Locale> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return locale;
}

/** The locale of the route being rendered, together with its dictionary. */
export async function getRouteTranslations(params: Promise<LocaleRouteParams>) {
  const locale = await getRouteLocale(params);
  return { locale, t: getDictionary(locale) };
}
