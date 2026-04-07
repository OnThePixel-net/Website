import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OnThePixel.net — Minecraft Minigame Server",
  description: "The best Minecraft minigame server — Duels, BuildFFA, TNT Run, BedWars and more. Join thousands of players on play.onthepixel.net.",
  openGraph: {
    title: "OnThePixel.net",
    description: "Fast-paced Minecraft minigames. Duels, BuildFFA, TNT Run and more.",
    images: ["/logo.png"],
  },
};
import Header from "@/components/page/header";
import Trailer from "@/components/page/trailer";
import Team from "@/components/page/team";
import News from "@/components/page/news";

export default function Home() {
  return (
    <>
      <Header />
      <Trailer />
      <News />
      <Team />
    </>
  );
}
