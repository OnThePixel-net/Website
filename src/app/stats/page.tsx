"use client";
import React from "react";
import TopPage from "@/components/page/top";
import PlayerStatistics from "@/components/page/PlayerStatistics";

const StatisticsPage: React.FC = () => {
  return (
    <section className="bg-gray-950 min-h-screen">
      <TopPage />
      <PlayerStatistics />
    </section>
  );
};

export default StatisticsPage;
