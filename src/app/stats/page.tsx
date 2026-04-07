import React from "react";
import type { Metadata } from "next";
import TopPage from "@/components/page/top";
import PlayerStatistics from "@/components/page/PlayerStatistics";

export const metadata: Metadata = {
  title: "Player Statistics — OnThePixel.net",
  description: "Look up detailed statistics for any player on OnThePixel.net — playtime, rank, Duels, BuildFFA and more.",
};

export default function StatisticsPage() {
  return (
    <>
      <TopPage />
      <PlayerStatistics />
    </>
  );
}
