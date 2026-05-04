import type { Metadata } from "next";
import { Inter, Syne, DM_Sans } from "next/font/google";
import "./globals.css";
import Footer from "@/components/page/footer";
import { SiteHeader } from "@/components/page/site-header";
import { AnalyticsProvider } from "@/components/analytics-provider";
import SessionProvider from "@/components/SessionProvider";
import { LanguageProvider } from "@/lib/i18n/LanguageProvider";
import { getServerLocale } from "@/lib/i18n/server";

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
  title: "OnThePixel.net",
  description:
    "Explore the exciting world of OnThePixel.net! Engage in thrilling minigames like Duels and BuildFFA. Dive into the pixelated fun today!",
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

  return (
    <html lang={initialLocale}>
      <head>
        <script async src="https://analytics.intern.onthepixel.net/script.js" data-website-id="2362b4d0-3dea-4b1e-b3f8-86b0af3e4bd1"></script>
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
