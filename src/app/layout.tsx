import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/components/page/footer";
import { SiteHeader } from "@/components/page/site-header";
import { SessionProvider } from "next-auth/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OnThePixel.net",
  description:
    "Explore the exciting world of OnThePixel.net! Engage in thrilling minigames like Bridging, TNTRun, KitPvP, BedWars, and BuildFFA. Dive into the pixelated fun today!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <SessionProvider>
        <body className={`${inter.className} bg-gray-950 scroll-smooth`}>
          <SiteHeader />
          <main>{children}</main>
          <Footer />
        </body>
      </SessionProvider>
    </html>
  );
}
