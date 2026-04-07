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
  kills: number;
  deaths: number;
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

function eloLabel(elo: number): string {
  if (elo >= 1100) return "Elite";
  if (elo >= 1050) return "Diamond";
  if (elo >= 1000) return "Gold";
  if (elo >= 950) return "Silver";
  return "Bronze";
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
          kills: m.kills ?? 0,
          deaths: m.deaths ?? 0,
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

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500&display=swap');`}</style>
      <TopPage />
      <section className="py-10 px-4 bg-gray-950 min-h-screen">
        <div className="container mx-auto px-4 py-10 max-w-5xl">

          {/* Back + header */}
          <div className="mb-8">
            <Link
              href={`/stats/${username}`}
              className="inline-flex items-center gap-1.5 text-sm text-white/40 transition-colors hover:text-green-400 mb-5"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              ← Back to {username}&apos;s Stats
            </Link>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <Image
                src={`https://mcskin.me/api/pfp/${username}.png?transparent=true`}
                alt={username}
                width={56}
                height={56}
                className="rounded-lg shrink-0"
              />
              <div>
                <h1
                  className="text-3xl font-bold text-white"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  {username} — DUELS KITS
                </h1>
                <p className="text-sm text-white/40 mt-0.5" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {playedModes.length} kits played · {data.overall.total_games} total games
                </p>
              </div>
            </div>
          </div>

          {/* Overall summary bar */}
          <div className="mb-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Overall ELO", value: data.overall.elo, color: eloColor(data.overall.elo) },
              { label: "Win Rate", value: `${data.overall.win_rate.toFixed(1)}%`, color: null },
              { label: "Wins", value: data.overall.wins, color: "#00de6d" },
              { label: "Best Streak", value: data.overall.bestWinStreak, color: null },
            ].map((item, i) => (
              <div key={i} className="rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 text-center">
                <p className="text-xs text-white/40 mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>{item.label}</p>
                <p
                  className="text-xl font-bold"
                  style={{ fontFamily: "'Syne', sans-serif", color: item.color ?? "#ffffff" }}
                >
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          {/* Played kits */}
          {playedModes.length > 0 && (
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-sm font-bold uppercase tracking-widest text-white/60" style={{ fontFamily: "'Syne', sans-serif" }}>
                  Played Kits
                </h2>
                <div className="h-px flex-1 bg-white/5" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {playedModes.map((mode) => {
                  const total = mode.wins + mode.losses;
                  const winPct = total > 0 ? (mode.wins / total) * 100 : 0;
                  const color = eloColor(mode.elo);
                  const label = eloLabel(mode.elo);

                  return (
                    <div
                      key={mode.key}
                      className="group rounded-xl border border-white/5 bg-white/[0.03] p-5 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.05]"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <p
                            className="text-base font-bold text-white"
                            style={{ fontFamily: "'Syne', sans-serif" }}
                          >
                            {KIT_LABELS[mode.key] ?? mode.key}
                          </p>
                          <p className="text-xs text-white/40 mt-0.5">{total} games</p>
                        </div>
                        <div className="text-right">
                          <p
                            className="text-lg font-black"
                            style={{ fontFamily: "'Syne', sans-serif", color }}
                          >
                            {mode.elo}
                          </p>
                          <p
                            className="text-[10px] font-bold uppercase tracking-wider"
                            style={{ color }}
                          >
                            {label}
                          </p>
                        </div>
                      </div>

                      {/* Wins / Losses */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex-1 text-center rounded-lg bg-green-500/10 py-2">
                          <p className="text-lg font-bold text-green-400" style={{ fontFamily: "'Syne', sans-serif" }}>{mode.wins}</p>
                          <p className="text-[10px] text-white/40 uppercase tracking-wide">Wins</p>
                        </div>
                        <div className="text-white/20 text-sm font-bold">vs</div>
                        <div className="flex-1 text-center rounded-lg bg-red-500/10 py-2">
                          <p className="text-lg font-bold text-red-400" style={{ fontFamily: "'Syne', sans-serif" }}>{mode.losses}</p>
                          <p className="text-[10px] text-white/40 uppercase tracking-wide">Losses</p>
                        </div>
                      </div>

                      {/* Win rate bar */}
                      <div className="mb-3">
                        <div className="flex justify-between text-[10px] text-white/40 mb-1">
                          <span>Win Rate</span>
                          <span>{winPct.toFixed(1)}%</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${winPct}%`,
                              background: winPct >= 50
                                ? "linear-gradient(90deg, #00de6d, #55FF55)"
                                : "linear-gradient(90deg, #FF5555, #FFAA00)",
                            }}
                          />
                        </div>
                      </div>

                      {/* Best streak */}
                      {mode.bestWinStreak > 0 && (
                        <div className="flex items-center gap-1.5 text-xs text-white/40">
                          <span>🔥</span>
                          <span>Best streak: <span className="text-white/60 font-semibold">{mode.bestWinStreak}</span></span>
                          {mode.winStreak > 0 && (
                            <span className="ml-auto text-green-400 font-semibold">+{mode.winStreak} active</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Unplayed kits */}
          {unplayedModes.length > 0 && (
            <div>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-sm font-bold uppercase tracking-widest text-white/30" style={{ fontFamily: "'Syne', sans-serif" }}>
                  Not yet played
                </h2>
                <div className="h-px flex-1 bg-white/5" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {unplayedModes.map((mode) => (
                  <div
                    key={mode.key}
                    className="rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3 opacity-40"
                  >
                    <p className="text-sm font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
                      {KIT_LABELS[mode.key] ?? mode.key}
                    </p>
                    <p className="text-xs text-white/40 mt-0.5">No games yet</p>
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
