"use client";
import React from "react";
import TopPage from "@/components/page/top";
import LeaderboardComponent from "@/components/page/LeaderboardComponent";

export default function DuelsLeaderboard() {
  return (
    <div className="min-h-screen bg-gray-950">
      <TopPage />
      <section className="bg-gray-950 pt-36">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-2xl font-bold mb-5">DUELS LEADERBOARD</h1>
          <p className="mb-8 text-gray-400">
            The best duelists on OnThePixel.net, ranked by score. Challenge yourself to reach the top!
          </p>
          
          <LeaderboardComponent 
            title="Duels Ranking"
            description="Players are ranked based on their overall performance in Duels matches."
            endpoint="leaderboard/duels"
            statColumns={[
              { key: "wins", label: "Wins" },
              { key: "losses", label: "Losses" },
              { key: "kills", label: "Kills" },
              { key: "winRate", label: "Win Rate" },
              { key: "streak", label: "Best Streak" }
            ]}
          />
        </div>
      </section>
    </div>
  );
}
