import type { Metadata } from "next";
import { Inter, Syne, DM_Sans } from "next/font/google";
import "./globals.css";
import Footer from "@/components/page/footer";
import { SiteHeader } from "@/components/page/site-header";
import { AnalyticsProvider } from "@/components/analytics-provider";
import SessionProvider from "@/components/SessionProvider";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script async src="https://analytics.intern.onthepixel.net/script.js" data-website-id="2362b4d0-3dea-4b1e-b3f8-86b0af3e4bd1"></script>
      </head>
      <body className={`${inter.className} ${syne.variable} ${dmSans.variable} scroll-smooth bg-gray-950`}>
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
