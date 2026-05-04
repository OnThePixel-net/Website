import type { Metadata } from "next";
import { Inter, Syne, DM_Sans } from "next/font/google";
import "./globals.css";
import Footer from "@/components/page/footer";
import { SiteHeader } from "@/components/page/site-header";
import { AnalyticsProvider } from "@/components/analytics-provider";
import SessionProvider from "@/components/SessionProvider";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { getServerLocale } from "@/lib/i18n/server";
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from "@/lib/i18n/seo";

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
    images: [DEFAULT_OG_IMAGE],
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

// The layout reads the locale cookie/header on every request, so the whole
// app must be rendered dynamically. Without this, routes that declare
// `generateStaticParams` (e.g. /stats/[username]) try to prerender and
// crash with DYNAMIC_SERVER_USAGE.
export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialLocale = await getServerLocale();

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: DEFAULT_OG_IMAGE,
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
    inLanguage: initialLocale === "de" ? "de-DE" : "en-US",
  };

  return (
    <html lang={initialLocale}>
      <head>
        <script async src="https://analytics.intern.onthepixel.net/script.js" data-website-id="2362b4d0-3dea-4b1e-b3f8-86b0af3e4bd1"></script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteJsonLd) }}
        />
      </head>
      <body className={`${inter.className} ${syne.variable} ${dmSans.variable} scroll-smooth bg-gray-950`}>
        <SessionProvider>
          <LanguageProvider initialLocale={initialLocale}>
            <AnalyticsProvider>
              <SiteHeader />
              <main>{children}</main>
              <Footer />
            </AnalyticsProvider>
          </LanguageProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
