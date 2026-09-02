import type { Metadata } from "next";
import { localizePath } from "./paths";
import { DEFAULT_LOCALE, Locale, SUPPORTED_LOCALES } from "./translations";

export const SITE_URL = "https://onthepixel.net";
export const SITE_NAME = "OnThePixel.net";

// 1200×630 social-share banners served as static files from /public. These
// are the images crawlers and social platforms fetch directly (not through
// the imgix loader), so they must be plain, resolvable URLs.
export const DEFAULT_OG_IMAGE = `${SITE_URL}/opengraph-image.png`;
export const DEFAULT_TWITTER_IMAGE = `${SITE_URL}/twitter-image.png`;

// Square brand logo (served via CDN) for schema.org Organization markup —
// this must stay the logo, not the wide social banner.
export const LOGO_IMAGE =
  "https://cdn.onthepixel.net/bf6cf0de-bf69-44d1-b107-6ad846ab7c9e";

const HREFLANG_BY_LOCALE: Record<Locale, string> = {
  en: "en",
  de: "de",
};

/**
 * Build the absolute URL a page is actually served at.
 *
 * The app runs with `trailingSlash: true`, so the URL the server answers with
 * 200 always ends in a slash ("/about/", not "/about"). Canonical tags,
 * hreflang alternates, OpenGraph URLs and sitemap entries must use exactly
 * that form — anything else points crawlers at a URL variant that only
 * redirects, which splits signals between the two spellings.
 *
 * The path itself comes from `localizePath`, the same helper the internal
 * links use, so an <a href> and the canonical tag of the page behind it can
 * never spell that page differently. `path` is locale-free and may be passed
 * with or without a leading or trailing slash.
 */
export function localizedUrl(locale: Locale, path: string): string {
  return `${SITE_URL}${localizePath(locale, path)}`;
}

/**
 * Build a Metadata object with localized title/description, hreflang
 * language alternates and canonical URL. `path` should start with `/`
 * and not include a locale prefix.
 *
 * When `type` is "article", OpenGraph article metadata (published/modified
 * time, author) is emitted so Google and social platforms treat the page
 * as an article rather than a generic website.
 */
export function buildLocalizedMetadata(opts: {
  locale: Locale;
  path: string;
  title: string;
  description: string;
  image?: string;
  imageAlt?: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
}): Metadata {
  const { locale, path, title, description, type = "website" } = opts;
  const image = opts.image ?? DEFAULT_OG_IMAGE;
  const imageAlt = opts.imageAlt ?? title;

  const canonical = localizedUrl(locale, path);

  const languages: Record<string, string> = {
    "x-default": localizedUrl(DEFAULT_LOCALE, path),
  };
  for (const loc of SUPPORTED_LOCALES) {
    languages[HREFLANG_BY_LOCALE[loc]] = localizedUrl(loc, path);
  }

  // Explicit dimensions help crawlers and social platforms render the
  // preview without re-fetching the image (and avoid cropping surprises).
  const ogImage = {
    url: image,
    width: 1200,
    height: 630,
    alt: imageAlt,
  };

  const openGraph: NonNullable<Metadata["openGraph"]> =
    type === "article"
      ? {
          title,
          description,
          url: canonical,
          siteName: SITE_NAME,
          locale: locale === "de" ? "de_DE" : "en_US",
          type: "article",
          publishedTime: opts.publishedTime,
          modifiedTime: opts.modifiedTime ?? opts.publishedTime,
          authors: [SITE_NAME],
          images: [ogImage],
        }
      : {
          title,
          description,
          url: canonical,
          siteName: SITE_NAME,
          locale: locale === "de" ? "de_DE" : "en_US",
          type: "website",
          images: [ogImage],
        };

  return {
    title,
    description,
    alternates: {
      canonical,
      languages,
    },
    openGraph,
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: image, alt: imageAlt }],
    },
  };
}
