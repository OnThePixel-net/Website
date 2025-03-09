"use client";
import React from "react";
import TopPage from "@/components/page/top";
import LeaderboardComponent from "@/components/page/LeaderboardComponent";

export default function PointsLeaderboard() {
  return (
    <div className="min-h-screen bg-gray-950">
      <TopPage />
      <section className="bg-gray-950 pt-36">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-2xl font-bold mb-5">PIXELS LEADERBOARD</h1>
          <p className="mb-8 text-gray-400">
            The richest players on OnThePixel.net. Earn Pixels by playing games and completing challenges!
          </p>
          
          <LeaderboardComponent 
            title="Pixel Rankings"
            description="Players are ranked based on their total Pixel earnings."
            endpoint="leaderboard/pixels"
            statColumns={[
              { key: "earned", label: "Total Earned" },
              { key: "spent", label: "Total Spent" },
              { key: "playtime", label: "Playtime" }
            ]}
          />
        </div>
      </section>
    </div>
  );
}
