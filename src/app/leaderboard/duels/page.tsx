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
            The best duelists on OnThePixel.net, ranked by wins. Challenge yourself to reach the top!
          </p>
          
          <LeaderboardComponent 
            title="Top Duels Players"
            description="Players are ranked based on their total wins in Duels matches."
            endpoint="leaderbords/duels/wins"
            statColumns={[
              { key: "wins", label: "Wins" },
              { key: "losses", label: "Losses" },
              { key: "total_games", label: "Total Games" },
              { key: "kd_ratio", label: "K/D Ratio" }
            ]}
          />
        </div>
      </section>
    </div>
  );
}
