import type { Metadata } from "next";
import { Inter, Syne, DM_Sans } from "next/font/google";
import "../globals.css";
import { AnalyticsProvider } from "@/components/analytics-provider";
import SessionProvider from "@/components/SessionProvider";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { getRouteLocale, type LocalePageProps } from "@/lib/i18n/server";
import { SUPPORTED_LOCALES } from "@/lib/i18n/translations";
import {
  DEFAULT_OG_IMAGE,
  DEFAULT_TWITTER_IMAGE,
  LOGO_IMAGE,
  SITE_NAME,
  SITE_URL,
} from "@/lib/i18n/seo";

const inter = Inter({ subsets: ["latin"] });
const syne = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
  variable: "--font-syne",
});
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "OnThePixel.net — Minecraft Minigame Server",
    template: "%s — OnThePixel.net",
  },
  description:
    "The best Minecraft minigame server — Duels, BuildFFA, TNT Run, BedWars and more. Join thousands of players on play.onthepixel.net.",
  applicationName: SITE_NAME,
  keywords: [
    "Minecraft",
    "Minecraft server",
    "Minigames",
    "Duels",
    "BuildFFA",
    "TNT Run",
    "BedWars",
    "Parkour",
    "OnThePixel",
    "play.onthepixel.net",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  formatDetection: { email: false, telephone: false, address: false },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: "OnThePixel.net — Minecraft Minigame Server",
    description:
      "Fast-paced Minecraft minigames. Duels, BuildFFA, TNT Run and more.",
    images: [{ url: DEFAULT_OG_IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@onthepixelnet",
    creator: "@onthepixelnet",
    title: "OnThePixel.net — Minecraft Minigame Server",
    description:
      "Fast-paced Minecraft minigames. Duels, BuildFFA, TNT Run and more.",
    images: [DEFAULT_TWITTER_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
  },
};

/**
 * This file is the *root* layout: there is no `app/layout.tsx`, so the
 * `[locale]` segment is the outermost one and this is where <html> is opened.
 * That is what makes the locale available as `params` instead of having to be
 * read out of a cookie or a header — the previous root layout did the latter,
 * which forced `dynamic = "force-dynamic"` onto every route on the site.
 *
 * Route handlers need no layout, so `app/api`, `app/sitemap.ts`,
 * `app/robots.ts` and `app/llms.txt` keep working next to this subtree.
 *
 * It deliberately holds no site chrome. The header and the footer belong to
 * the public site only, and the admin dashboard has a sidebar of its own, so
 * they live in `(site)/layout.tsx` — a route group, which shapes the layout
 * tree without appearing in any URL. Selecting the chrome by pathname instead
 * would mean reading `headers()` here and would drag the whole site back into
 * dynamic rendering.
 *
 * What stays here is what both groups need: the document itself, the fonts,
 * the site-wide JSON-LD, and the three providers — the dashboard needs the
 * session, and the cookie banner belongs on every page.
 */
export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export default async function RootLayout({
  children,
  params,
}: LocalePageProps & {
  children: React.ReactNode;
}) {
  const locale = await getRouteLocale(params);
  // Only the dictionary of the active locale is handed to the client, instead
  // of both languages ending up in every client bundle.
  const dictionary = getDictionary(locale);

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: LOGO_IMAGE,
    sameAs: [
      "https://www.youtube.com/@thebestminecraftserver",
      "https://twitch.tv/onthepixel",
      "https://x.com/onthepixelnet",
      "https://www.instagram.com/onthepixel_net",
      "https://www.tiktok.com/@onthepixel",
      "https://discord.com/invite/Dpx3eK9t3z",
    ],
  };

  const siteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: locale === "de" ? "de-DE" : "en-US",
    // Player search. PlayerStatistics navigates to /stats/<username>, which
    // the trailingSlash: true config serves as /stats/<username>/.
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/stats/{search_term_string}/`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang={locale}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
      </head>
      <body
        className={`${inter.className} ${syne.variable} ${dmSans.variable} scroll-smooth bg-gray-950`}
      >
        <SessionProvider>
          <LanguageProvider locale={locale} dictionary={dictionary}>
            <AnalyticsProvider>{children}</AnalyticsProvider>
          </LanguageProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
