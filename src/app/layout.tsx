import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/components/page/footer";
import { SiteHeader } from "@/components/page/site-header";
import { AnalyticsProvider } from "@/components/analytics-provider";
import SessionProvider from "@/components/SessionProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OnThePixel.net",
  description:
    "Explore the exciting world of OnThePixel.net! Engage in thrilling minigames like Duels and BuildFFA. Dive into the pixelated fun today!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://cms.onthepixel.net" />
        <link rel="dns-prefetch" href="https://cms.onthepixel.net" />
      </head>
      <body className={`${inter.className} scroll-smooth bg-gray-950`}>
        <SessionProvider>
          <AnalyticsProvider>
            <SiteHeader />
            <main>{children}</main>
            <Footer />
          </AnalyticsProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
