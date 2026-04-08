import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OnThePixel.net — Minecraft Minigame Server",
  description: "The best Minecraft minigame server — Duels, BuildFFA, TNT Run, BedWars and more. Join thousands of players on play.onthepixel.net.",
  openGraph: {
    title: "OnThePixel.net",
    description: "Fast-paced Minecraft minigames. Duels, BuildFFA, TNT Run and more.",
    images: ["https://cdn.onthepixel.net/bf6cf0de-bf69-44d1-b107-6ad846ab7c9e"],
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
