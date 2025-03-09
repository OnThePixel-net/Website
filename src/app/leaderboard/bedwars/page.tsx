"use client";
import React from "react";
import TopPage from "@/components/page/top";
import LeaderboardComponent from "@/components/page/LeaderboardComponent";

export default function BWLeaderboard() {
  return (
    <div className="min-h-screen bg-gray-950">
      <TopPage />
      <section className="bg-gray-950 pt-36">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-2xl font-bold mb-5">BEDWARS LEADERBOARD</h1>
          <p className="mb-8 text-gray-400">
            The top BedWars players on OnThePixel.net, ranked by score. Compete with others and reach the top!
          </p>
          
          <LeaderboardComponent 
            title="BedWars Ranking"
            description="Players are ranked based on their overall performance in BedWars matches."
            endpoint="leaderboard/bedwars"
            statColumns={[
              { key: "kills", label: "Kills" },
              { key: "deaths", label: "Deaths" },
              { key: "kdr", label: "K/D Ratio" },
              { key: "bedsDestroyed", label: "Beds" },
              { key: "winRate", label: "Win Rate" }
            ]}
          />
        </div>
      </section>
    </div>
  );
}
