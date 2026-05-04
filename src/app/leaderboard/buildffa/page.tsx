"use client";
import React from "react";
import TopPage from "@/components/page/top";
import LeaderboardComponent from "@/components/page/LeaderboardComponent";
import { useTranslations } from "@/lib/i18n/LanguageProvider";

export default function BuildFFALeaderboard() {
  const t = useTranslations();
  return (
    <div className="min-h-screen bg-gray-950">
      <TopPage />
      <section className="bg-gray-950 pt-36">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-2xl font-bold mb-5">{t.leaderboardBuildFFA.heading}</h1>
          <p className="mb-8 text-gray-400">{t.leaderboardBuildFFA.intro}</p>

          <LeaderboardComponent
            title={t.leaderboardBuildFFA.title}
            description={t.leaderboardBuildFFA.description}
            endpoint="leaderbords/Buildffa"
            statColumns={[
              { key: "kills", label: t.leaderboardBuildFFA.colKills },
              { key: "deaths", label: t.leaderboardBuildFFA.colDeaths },
              { key: "kdRatio", label: t.leaderboardBuildFFA.colKD },
            ]}
          />
        </div>
      </section>
    </div>
  );
}
