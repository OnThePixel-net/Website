"use client";
import React from "react";
import TopPage from "@/components/page/top";
import LeaderboardComponent from "@/components/page/LeaderboardComponent";
import { useTranslations } from "@/lib/i18n/LanguageProvider";

export default function DuelsLeaderboard() {
  const t = useTranslations();
  return (
    <div className="min-h-screen bg-gray-950">
      <TopPage />
      <section className="bg-gray-950 pt-36">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-2xl font-bold mb-5">{t.leaderboardDuels.heading}</h1>
          <p className="mb-8 text-gray-400">{t.leaderboardDuels.intro}</p>

          <LeaderboardComponent
            title={t.leaderboardDuels.title}
            description={t.leaderboardDuels.description}
            endpoint="leaderbords/duels/wins"
            statColumns={[
              { key: "wins", label: t.leaderboardDuels.colWins },
              { key: "losses", label: t.leaderboardDuels.colLosses },
              { key: "total_games", label: t.leaderboardDuels.colTotalGames },
              { key: "kd_ratio", label: t.leaderboardDuels.colKD },
            ]}
          />
        </div>
      </section>
    </div>
  );
}
