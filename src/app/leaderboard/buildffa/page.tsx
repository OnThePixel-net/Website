"use client";
import React from "react";
import TopPage from "@/components/page/top";
import LeaderboardComponent from "@/components/page/LeaderboardComponent";

export default function ParkourLeaderboard() {
  return (
    <div className="min-h-screen bg-gray-950">
      <TopPage />
      <section className="bg-gray-950 pt-36">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-2xl font-bold mb-5">BUILDFFA LEADERBOARD</h1>
          <p className="mb-8 text-gray-400">
            The fastest parkour runners on OnThePixel.net. Challenge yourself to beat these records!
          </p>
          
          <LeaderboardComponent 
            title="Parkour Masters"
            description="Players are ranked based on their completion time and course difficulty."
            endpoint="leaderbords/Buildffa"
            statColumns={[
              { key: "statsAllKills", label: "Kills" },
              { key: "statsAllDeaths", label: "Deaths" }
            ]}
          />
        </div>
      </section>
    </div>
  );
}
