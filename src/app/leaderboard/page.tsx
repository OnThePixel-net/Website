import Link from "next/link";
import React from "react";
import TopPage from "@/components/page/top";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leaderboards — OnThePixel.net",
  description: "Compete with other players and climb the rankings. View leaderboards for Pixels, BuildFFA, Duels and more.",
};

export default function Leaderboards() {
  return (
    <>
      <TopPage />
      <section className="bg-gray-950 pt-36">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-2xl font-bold mb-5">LEADERBOARDS</h1>
          <p className="mb-8">
            Compete with others and climb the rankings across all game modes on OnThePixel.net.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Pixels */}
            <Link href="/leaderboard/pixels" className="block h-full">
              <div className="h-full flex flex-col bg-white/5 rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:bg-white/10 border border-transparent hover:border-green-500/50 group">
                <div className="flex flex-col flex-1 p-5">
                  <h2 className="text-xl font-bold mb-3">Pixels</h2>
                  <p className="text-sm text-gray-300 flex-1">
                    The richest players ranked by their total Pixel balance.
                  </p>
                  <span className="text-sm text-green-400 group-hover:text-green-300 transition-colors mt-4">
                    View leaderboard →
                  </span>
                </div>
              </div>
            </Link>

            {/* BuildFFA */}
            <Link href="/leaderboard/buildffa" className="block h-full">
              <div className="h-full flex flex-col bg-white/5 rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:bg-white/10 border border-transparent hover:border-green-500/50 group">
                <div className="flex flex-col flex-1 p-5">
                  <h2 className="text-xl font-bold mb-3">BuildFFA</h2>
                  <p className="text-sm text-gray-300 flex-1">
                    Top builders ranked by kills, deaths, and K/D ratio in the arena.
                  </p>
                  <span className="text-sm text-green-400 group-hover:text-green-300 transition-colors mt-4">
                    View leaderboard →
                  </span>
                </div>
              </div>
            </Link>

            {/* Duels */}
            <div className="h-full flex flex-col bg-white/5 rounded-lg overflow-hidden opacity-50">
              <div className="flex flex-col flex-1 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-bold">Duels</h2>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    SOON
                  </span>
                </div>
                <p className="text-sm text-gray-300 flex-1">
                  Best duelists ranked by wins, losses, and K/D ratio.
                </p>
                <span className="invisible text-sm mt-4">View leaderboard →</span>
              </div>
            </div>

            {/* BedWars */}
            <div className="h-full flex flex-col bg-white/5 rounded-lg overflow-hidden opacity-50">
              <div className="flex flex-col flex-1 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-bold">BedWars</h2>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    SOON
                  </span>
                </div>
                <p className="text-sm text-gray-300 flex-1">
                  Players ranked by score, kills, and bed destructions.
                </p>
                <span className="invisible text-sm mt-4">View leaderboard →</span>
              </div>
            </div>

            {/* TNTRun */}
            <div className="h-full flex flex-col bg-white/5 rounded-lg overflow-hidden opacity-50">
              <div className="flex flex-col flex-1 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-bold">TNTRun</h2>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    SOON
                  </span>
                </div>
                <p className="text-sm text-gray-300 flex-1">
                  Players ranked by survival time and scores in TNTRun rounds.
                </p>
                <span className="invisible text-sm mt-4">View leaderboard →</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
