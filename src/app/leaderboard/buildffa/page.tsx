"use client";
import React from "react";
import TopPage from "@/components/page/top";
import LeaderboardComponent from "@/components/page/LeaderboardComponent";

export default function BuildFFALeaderboard() {
  return (
    <div className="min-h-screen bg-gray-950">
      <TopPage />
      <section className="bg-gray-950 pt-36">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-2xl font-bold mb-5">BUILDFFA LEADERBOARD</h1>
          <p className="mb-8 text-gray-400">
            The top BuildFFA players. Build, fight, and dominate the arena!
          </p>
          
          <LeaderboardComponent 
            title="BuildFFA Champions"
            description="Players are ranked based on their kills, deaths, and overall performance in BuildFFA matches."
            endpoint="leaderbords/Buildffa"
            statColumns={[
              { key: "statsAllKills", label: "Kills" },
              { key: "statsAllDeaths", label: "Deaths" },
              { key: "kd", label: "K/D Ratio" }
            ]}
          />
        </div>
      </section>
    </div>
  );
}
