import type { Metadata } from "next";
import { Locale, SUPPORTED_LOCALES } from "./translations";

export const SITE_URL = "https://onthepixel.net";
export const SITE_NAME = "OnThePixel.net";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/bf6cf0de-bf69-44d1-b107-6ad846ab7c9e`;

const HREFLANG_BY_LOCALE: Record<Locale, string> = {
  en: "en",
  de: "de",
};

/**
 * Build a Metadata object with localized title/description, hreflang
 * language alternates and canonical URL. `path` should start with `/`
 * and not include a locale prefix.
 */
export function buildLocalizedMetadata(opts: {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  image?: string;
}): Metadata {
  const { locale, path, title, description } = opts;
  const image = opts.image ?? DEFAULT_OG_IMAGE;
  const cleanPath = path === "/" ? "" : path.replace(/\/$/, "");

  const canonical =
    locale === "en" ? `${SITE_URL}${cleanPath || "/"}` : `${SITE_URL}/${locale}${cleanPath}`;

  const languages: Record<string, string> = { "x-default": `${SITE_URL}${cleanPath || "/"}` };
  for (const loc of SUPPORTED_LOCALES) {
    languages[HREFLANG_BY_LOCALE[loc]] =
      loc === "en" ? `${SITE_URL}${cleanPath || "/"}` : `${SITE_URL}/${loc}${cleanPath}`;
  }

  return {
    title,
    description,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: SITE_NAME,
      locale: locale === "de" ? "de_DE" : "en_US",
      type: "website",
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
