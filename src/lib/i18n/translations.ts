// The dictionaries themselves live in ./dictionaries and are imported here for
// their types only, so this module stays free of translation data. Importing
// it (from the proxy, from client components, ...) therefore never pulls
// a ~32 KB dictionary into the bundle.
import type { en } from "./dictionaries/en";
import type { de } from "./dictionaries/de";

export const SUPPORTED_LOCALES = ["en", "de"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_COOKIE = "otp.locale";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  de: "Deutsch",
};

export const DIRECTUS_LOCALES: Record<Locale, string> = {
  en: "en-US",
  de: "de-DE",
};

export const DATE_LOCALES: Record<Locale, string> = {
  en: "en-US",
  de: "de-DE",
};

export function isLocale(value: string | null | undefined): value is Locale {
  return !!value && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export type Translations = typeof en | typeof de;
