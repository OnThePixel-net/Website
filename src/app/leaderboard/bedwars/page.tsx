"use client";
import React from "react";
import TopPage from "@/components/page/top";
import LeaderboardComponent from "@/components/page/LeaderboardComponent";
import { useTranslations } from "@/lib/i18n/LanguageProvider";

export default function BWLeaderboard() {
  const t = useTranslations();
  return (
    <div className="min-h-screen bg-gray-950">
      <TopPage />
      <section className="bg-gray-950 pt-36">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-2xl font-bold mb-5">{t.leaderboardBedwars.heading}</h1>
          <p className="mb-8 text-gray-400">{t.leaderboardBedwars.intro}</p>

          <LeaderboardComponent
            title={t.leaderboardBedwars.title}
            description={t.leaderboardBedwars.description}
            endpoint="leaderboard/bedwars"
            statColumns={[
              { key: "balance", label: t.leaderboardBedwars.colBalance },
            ]}
          />
        </div>
      </section>
    </div>
  );
}
