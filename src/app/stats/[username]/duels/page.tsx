import React from "react";
import Link from "next/link";
import Image from "next/image";
import TopPage from "@/components/page/top";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

interface DuelMode {
  wins: number;
  losses: number;
  winStreak: number;
  bestWinStreak: number;
  elo: number;
}

interface DuelsData {
  username: string;
  overall: {
    wins: number;
    losses: number;
    total_games: number;
    win_rate: number;
    kd_ratio: string;
    elo: number;
    winStreak: number;
    bestWinStreak: number;
  };
  modes: Record<string, DuelMode>;
}

interface PageProps {
  params: Promise<{ username: string }>;
}

const KIT_LABELS: Record<string, string> = {
  spear: "Spear",
  uhc: "UHC",
  sword: "Sword",
  potion: "Potion",
  mace: "Mace",
  crystal: "Crystal",
  shieldless: "Shieldless",
  knockback: "Knockback",
  axe: "Axe",
  skywars: "Skywars",
  tactic: "Tactic",
};

function eloColor(elo: number): string {
  if (elo >= 1100) return "#00de6d";
  if (elo >= 1050) return "#55FF55";
  if (elo >= 1000) return "#FFAA00";
  if (elo >= 950) return "#FF5555";
  return "#AAAAAA";
}

async function getDuelsData(username: string): Promise<DuelsData | null> {
  try {
    const res = await fetch(
      `https://api.onthepixel.net/stats/minigames/${username}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data?.duels?.overall) return null;

    const modes: Record<string, DuelMode> = {};
    if (data.duels.modes) {
      for (const [key, m] of Object.entries(data.duels.modes) as [string, Record<string, number>][]) {
        modes[key] = {
          wins: m.wins ?? 0,
          losses: m.losses ?? 0,
          winStreak: m.winStreak ?? 0,
          bestWinStreak: m.bestWinStreak ?? 0,
          elo: m.elo ?? 1000,
        };
      }
    }

    return {
      username: data.username ?? username,
      overall: {
        wins: data.duels.overall.wins ?? 0,
        losses: data.duels.overall.losses ?? 0,
        total_games: data.duels.overall.total_games ?? 0,
        win_rate: data.duels.overall.win_rate ?? 0,
        kd_ratio: data.duels.overall.kd_ratio ?? "0.00",
        elo: data.duels.overall.elo ?? 1000,
        winStreak: data.duels.overall.winStreak ?? 0,
        bestWinStreak: data.duels.overall.bestWinStreak ?? 0,
      },
      modes,
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `${username} — Duels Kits — OnThePixel.net`,
    description: `Detailed duels kit statistics for ${username} on OnThePixel.net.`,
  };
}

export async function generateStaticParams() {
  return [];
}

export default async function DuelsKitsPage({ params }: PageProps) {
  const { username } = await params;
  const data = await getDuelsData(username);

  if (!data) notFound();

  const sortedModes = Object.entries(data.modes)
    .map(([key, mode]) => ({ key, ...mode }))
    .sort((a, b) => (b.wins + b.losses) - (a.wins + a.losses));

  const playedModes = sortedModes.filter((m) => m.wins + m.losses > 0);
  const unplayedModes = sortedModes.filter((m) => m.wins + m.losses === 0);

  const overallColor = eloColor(data.overall.elo);

  return (
    <>
      <TopPage />
      <section className="py-10 px-4 bg-gray-950 min-h-screen">
        <div className="container mx-auto px-4 py-10">

          {/* Back link */}
          <Link
            href={`/stats/${username}`}
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-green-400 mb-8"
          >
            ← Back to {username}&apos;s Stats
          </Link>

          {/* Header */}
          <div className="flex items-center gap-4 mb-4">
            <Image
              src={`https://mcskin.me/api/pfp/${username}.png?transparent=true`}
              alt={username}
              width={56}
              height={56}
              className="rounded-lg shrink-0"
            />
            <div>
              <h1 className="text-3xl font-bold text-white">
                {username.toUpperCase()} — DUELS
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">
                {playedModes.length} kits played · {data.overall.total_games} total games
              </p>
            </div>
          </div>

          {/* Overall stats — same card style as team apply CTA */}
          <div className="mb-10 p-6 bg-white/10 rounded-lg border-l-4 border-green-500 grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">ELO</p>
              <p
                className="text-2xl font-bold"
                style={{ color: overallColor, textShadow: `0 0 10px ${overallColor}` }}
              >
                {data.overall.elo}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Win Rate</p>
              <p className="text-2xl font-bold text-white">{data.overall.win_rate.toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Wins / Losses</p>
              <p className="text-2xl font-bold text-white">{data.overall.wins} / {data.overall.losses}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">Best Streak</p>
              <p className="text-2xl font-bold text-white">{data.overall.bestWinStreak}</p>
            </div>
          </div>

          {/* Played kits */}
          {playedModes.length > 0 && (
            <div className="mb-10">
              <h2 className="text-xl font-bold text-white mb-4">KITS</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                {playedModes.map((mode) => {
                  const total = mode.wins + mode.losses;
                  const winPct = total > 0 ? (mode.wins / total) * 100 : 0;
                  const color = eloColor(mode.elo);

                  return (
                    <div
                      key={mode.key}
                      className="m-1 flex items-center rounded-md bg-white/10 p-4 transition-transform duration-300 hover:scale-105 hover:bg-white/15 gap-4"
                    >
                      {/* Kit name + games */}
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-white truncate">
                          {KIT_LABELS[mode.key] ?? mode.key}
                        </p>
                        <p className="text-sm text-gray-400">
                          {mode.wins}W · {mode.losses}L · {winPct.toFixed(0)}% WR
                        </p>
                        {mode.bestWinStreak > 0 && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            Best streak: {mode.bestWinStreak}
                          </p>
                        )}
                      </div>

                      {/* ELO — same style as rank in team page */}
                      <div className="shrink-0 text-right">
                        <p
                          className="text-sm font-bold tracking-wide"
                          style={{ color, textShadow: `0 0 8px ${color}` }}
                        >
                          {mode.elo} ELO
                        </p>
                        <p className="text-xs text-gray-500">{total} games</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Unplayed kits */}
          {unplayedModes.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-white mb-4">NOT YET PLAYED</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {unplayedModes.map((mode) => (
                  <div
                    key={mode.key}
                    className="m-1 rounded-md bg-white/5 p-4 opacity-40"
                  >
                    <p className="font-bold text-white">{KIT_LABELS[mode.key] ?? mode.key}</p>
                    <p className="text-sm text-gray-400">No games yet</p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </section>
    </>
  );
}
