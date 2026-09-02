"use client";

import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { localizePath } from "@/lib/i18n/paths";
import type { Locale } from "@/lib/i18n/translations";

/**
 * Internal navigation that stays in the language the visitor is reading.
 *
 * A plain `<Link href="/team/">` on /de/about/ leads to the *English* team
 * page — the German pages would silently drop the visitor back into English on
 * the first click. Every internal link therefore goes through here (or, on the
 * server, through `localizePath` directly), so there is one place that knows
 * how a path is spelled per locale instead of ~25.
 *
 * The locale comes from `LanguageProvider`, which the root layout feeds from
 * the `[locale]` route segment. That works in client components and — because
 * the provider wraps the whole tree — in client components rendered from
 * server components too, which is why a single component covers both worlds.
 */

/** The locale of the page currently being rendered. */
export function useLocale(): Locale {
  return useLanguage().locale;
}

/**
 * The localized form of one root-relative href. For hrefs only known inside an
 * event handler (a search box building "/stats/<name>"), take `useLocale()`
 * and call `localizePath` there instead — hooks cannot run in callbacks.
 */
export function useLocalizedHref(href: string): string {
  return localizePath(useLocale(), href);
}

type LocaleLinkProps = Omit<ComponentPropsWithoutRef<typeof Link>, "href"> & {
  /**
   * A locale-free, root-relative path ("/team", "/privacy#twitch"). External
   * URLs, other schemes and bare fragments are passed through untouched, so
   * this stays a safe drop-in for next/link.
   */
  href: string;
};

export function LocaleLink({ href, ...props }: LocaleLinkProps) {
  return <Link href={localizePath(useLocale(), href)} {...props} />;
}
