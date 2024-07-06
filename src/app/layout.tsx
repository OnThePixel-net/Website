import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/page/navbar";
import Footer from "@/components/page/footer";
import NextAuthProvider from "@/lib/auth/Provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OnThePixel.net",
  description:
    "Explore the exciting world of On ThePixel.net! Engage in thrilling minigames like Bridging, TNTRun, KitPvP, BedWars, and BuildFFA. Dive into the pixelated fun today!",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <NextAuthProvider>
        <body className="bg-gray-950">
          <NavBar />
          <main>{children}</main>
          <Footer />
        </body>
      </NextAuthProvider>
    </html>
  );
}
