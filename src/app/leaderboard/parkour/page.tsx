"use client";
import React from "react";
import TopPage from "@/components/page/top";
import LeaderboardComponent from "@/components/page/LeaderboardComponent";
import { useTranslations } from "@/lib/i18n/LanguageProvider";

export default function ParkourLeaderboard() {
  const t = useTranslations();
  return (
    <div className="min-h-screen bg-gray-950">
      <TopPage />
      <section className="bg-gray-950 pt-36">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-2xl font-bold mb-5">{t.leaderboardParkour.heading}</h1>
          <p className="mb-8 text-gray-400">{t.leaderboardParkour.intro}</p>

          <LeaderboardComponent
            title={t.leaderboardParkour.title}
            description={t.leaderboardParkour.description}
            endpoint="leaderboard/parkour"
            statColumns={[
              { key: "bestTime", label: t.leaderboardParkour.colBestTime },
              { key: "completions", label: t.leaderboardParkour.colCompletions },
              { key: "difficulty", label: t.leaderboardParkour.colDifficulty },
              { key: "checkpoints", label: t.leaderboardParkour.colCheckpoints },
            ]}
          />
        </div>
      </section>
    </div>
  );
}
