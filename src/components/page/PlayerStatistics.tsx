"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, Sword, Trophy, Target, Zap, Clock, TrendingUp, Award } from "lucide-react";
import Link from "next/link";

interface DuelMode {
  wins: number;
  losses: number;
  winStreak: number;
  bestWinStreak: number;
  elo: number;
  kills: number;
  deaths: number;
}

interface PlayerStats {
  playerinfo: {
    username: string;
    uuid: string;
    firstLogin: string;
    lastLogin: string;
    rank: { id: string; color: string };
  };
  stats: {
    playtime: { total: number; pretty: string };
    balance: { pixels: number };
    duels: {
      wins: number;
      losses: number;
      kdr: number;
      gamesPlayed: number;
      elo: number;
      winRate: number;
      winStreak: number;
      bestWinStreak: number;
      modes: Record<string, DuelMode>;
    };
    buildffa: { kills: number; deaths: number; kdr: number };
  };
}

interface RankResponse { uuid?: string; rank?: string }
interface PixelResponse { balance?: number }
interface PlaytimeResponse { playtime?: number; first_joined?: string; last_online?: string }
interface MinigamesResponse {
  duels?: {
    overall?: {
      wins?: number;
      losses?: number;
      total_games?: number;
      kd_ratio?: string;
      elo?: number;
      win_rate?: number;
      winStreak?: number;
      bestWinStreak?: number;
    };
    modes?: Record<string, {
      wins?: number;
      losses?: number;
      winStreak?: number;
      bestWinStreak?: number;
      elo?: number;
      kills?: number;
      deaths?: number;
    }>;
  };
  buildffa?: { kills?: number; deaths?: number; kd_ratio?: string };
}

interface PlayerStatisticsProps {
  initialUsername?: string;
}

const parseColorCode = (colorCode: string | undefined): string => {
  if (!colorCode) return "#AAAAAA";
  const hexMatch = colorCode.match(/&#([0-9a-fA-F]{6})/);
  if (hexMatch) return `#${hexMatch[1].toUpperCase()}`;
  const colorMap: Record<string, string> = {
    "0": "#000000", "1": "#0000AA", "2": "#00AA00", "3": "#00AAAA",
    "4": "#AA0000", "5": "#AA00AA", "6": "#FFAA00", "7": "#AAAAAA",
    "8": "#555555", "9": "#5555FF", a: "#55FF55", b: "#55FFFF",
    c: "#FF5555", d: "#FF55FF", e: "#FFFF55", f: "#FFFFFF",
  };
  if ((colorCode.startsWith("&") || colorCode.startsWith("§")) && colorCode.length > 1) {
    return colorMap[colorCode.charAt(1).toLowerCase()] || "#FFFFFF";
  }
  return "#AAAAAA";
};

const extractRankName = (rankString: string | undefined): string => {
  if (!rankString) return "Member";
  const hexBracket = rankString.match(/&#[0-9a-fA-F]{6}\[([^\]]+)\]/);
  if (hexBracket) return hexBracket[1];
  const bracket = rankString.match(/\[([^\]]+)\]/);
  if (bracket) return bracket[1];
  return rankString.replace(/[&§][0-9a-fA-Flmnokr]/g, "").replace(/&#[0-9a-fA-F]{6}/g, "").trim() || "Member";
};

const formatPlaytime = (ms: number | undefined): string => {
  if (!ms || ms === 0) return "0m";
  const mins = Math.floor(ms / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `${days}d ${hours % 24}h ${mins % 60}m`;
  if (hours > 0) return `${hours}h ${mins % 60}m`;
  return `${mins}m`;
};

const safeDate = (s: string | undefined): string => {
  if (!s) return "—";
  try {
    const d = new Date(s);
    if (isNaN(d.getTime())) return "—";
    return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  } catch { return "—"; }
};

function StatBox({ label, value, icon }: { label: string; value: string | number; icon?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-3">
      <div className="flex items-center gap-2 text-white/50 text-sm">
        {icon && <span className="text-green-400/70">{icon}</span>}
        {label}
      </div>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );
}

function GameCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.03] overflow-hidden">
      <div className="px-5 py-4 border-b border-white/5">
        <h3 className="font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>{title}</h3>
      </div>
      <div className="p-5 space-y-2">{children}</div>
    </div>
  );
}

function ComingSoon({ title }: { title: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.03] overflow-hidden">
      <div className="px-5 py-4 border-b border-white/5">
        <h3 className="font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>{title}</h3>
      </div>
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <span className="mb-3 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-amber-400 ring-1 ring-amber-500/20">
          Coming Soon
        </span>
        <p className="text-sm text-white/30">Statistics not yet available</p>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="rounded-xl border border-white/5 bg-white/[0.03] p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-20 h-20 rounded-lg bg-white/10" />
          <div className="space-y-2">
            <div className="h-7 w-40 rounded bg-white/10" />
            <div className="h-5 w-24 rounded bg-white/5" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-12 rounded-lg bg-white/5" />)}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-48 rounded-xl bg-white/[0.03] border border-white/5" />)}
      </div>
    </div>
  );
}

function eloColor(elo: number): string {
  if (elo >= 1100) return "#00de6d";
  if (elo >= 1050) return "#55FF55";
  if (elo >= 1000) return "#FFAA00";
  if (elo >= 950) return "#FF5555";
  return "#AAAAAA";
}

function DuelsCard({ duels, username }: { duels: PlayerStats["stats"]["duels"]; username: string }) {
  const winPct = duels.gamesPlayed > 0 ? (duels.wins / duels.gamesPlayed) * 100 : 0;
  const color = eloColor(duels.elo);
  const kitsPlayed = Object.values(duels.modes).filter((m) => m.wins + m.losses > 0).length;

  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.03] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/5">
        <h3 className="font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>Duels</h3>
      </div>

      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* ELO hero */}
        <div className="flex items-center gap-4 rounded-xl bg-white/5 px-5 py-4">
          <div className="flex-1">
            <p className="text-xs text-white/40 mb-0.5">Overall ELO</p>
            <p
              className="text-3xl font-black"
              style={{ fontFamily: "'Syne', sans-serif", color, textShadow: `0 0 20px ${color}40` }}
            >
              {duels.elo}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/40 mb-0.5">Win Streak</p>
            <p className="text-lg font-bold text-white" style={{ fontFamily: "'Syne', sans-serif" }}>
              {duels.winStreak > 0 ? `🔥 ${duels.winStreak}` : duels.winStreak}
            </p>
            <p className="text-[10px] text-white/30">best: {duels.bestWinStreak}</p>
          </div>
        </div>

        {/* Wins vs Losses */}
        <div className="flex gap-2">
          <div className="flex-1 rounded-lg bg-green-500/10 px-3 py-2.5 text-center">
            <p className="text-xl font-black text-green-400" style={{ fontFamily: "'Syne', sans-serif" }}>{duels.wins}</p>
            <p className="text-[10px] text-white/40 uppercase tracking-wide">Wins</p>
          </div>
          <div className="flex-1 rounded-lg bg-red-500/10 px-3 py-2.5 text-center">
            <p className="text-xl font-black text-red-400" style={{ fontFamily: "'Syne', sans-serif" }}>{duels.losses}</p>
            <p className="text-[10px] text-white/40 uppercase tracking-wide">Losses</p>
          </div>
          <div className="flex-1 rounded-lg bg-white/5 px-3 py-2.5 text-center">
            <p className="text-xl font-black text-white" style={{ fontFamily: "'Syne', sans-serif" }}>{duels.gamesPlayed}</p>
            <p className="text-[10px] text-white/40 uppercase tracking-wide">Played</p>
          </div>
        </div>

        {/* Win rate bar */}
        <div>
          <div className="flex justify-between text-xs text-white/40 mb-1.5">
            <span>Win Rate</span>
            <span className="font-semibold text-white/70">{duels.winRate.toFixed(1)}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
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

        {/* K/D */}
        <StatBox label="K/D Ratio" value={duels.kdr.toFixed(2)} icon={<TrendingUp className="size-4" />} />
      </div>

      {/* Kit details link */}
      {kitsPlayed > 0 && (
        <Link
          href={`/stats/${username}/duels`}
          className="flex items-center justify-between border-t border-white/5 px-5 py-3 text-sm text-white/50 transition-colors hover:bg-white/5 hover:text-green-400 group"
        >
          <span className="text-xs font-semibold uppercase tracking-wide">
            View all {kitsPlayed} kits
          </span>
          <span className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
        </Link>
      )}
    </div>
  );
}

export default function PlayerStatistics({ initialUsername }: PlayerStatisticsProps) {
  const router = useRouter();
  const [username, setUsername] = useState(initialUsername || "");
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const fetchPlayerStats = useCallback(async (name: string) => {
    if (!name.trim()) return;
    setLoading(true);
    setError(null);
    setNotFound(false);
    setStats(null);

    try {
      const playerData: PlayerStats = {
        playerinfo: {
          username: name,
          uuid: "",
          firstLogin: "",
          lastLogin: "",
          rank: { id: "Member", color: "#AAAAAA" },
        },
        stats: {
          playtime: { total: 0, pretty: "0m" },
          balance: { pixels: 0 },
          duels: { wins: 0, losses: 0, kdr: 0, gamesPlayed: 0, elo: 1000, winRate: 0, winStreak: 0, bestWinStreak: 0, modes: {} },
          buildffa: { kills: 0, deaths: 0, kdr: 0 },
        },
      };

      let playerFound = false;

      const [pixelRes, playtimeRes, rankRes, minigamesRes] = await Promise.allSettled([
        fetch(`https://api.onthepixel.net/stats/pixel/${name}`),
        fetch(`https://api.onthepixel.net/stats/playtime/${name}`),
        fetch(`https://api.onthepixel.net/stats/luckperms/rank/${name}`),
        fetch(`https://api.onthepixel.net/stats/minigames/${name}`),
      ]);

      if (pixelRes.status === "fulfilled" && pixelRes.value.ok) {
        const d: PixelResponse = await pixelRes.value.json();
        if (d?.balance !== undefined) {
          playerData.stats.balance.pixels = d.balance;
          playerFound = true;
        }
      }

      if (playtimeRes.status === "fulfilled" && playtimeRes.value.ok) {
        const d: PlaytimeResponse = await playtimeRes.value.json();
        if (d?.playtime !== undefined) {
          playerData.stats.playtime.total = d.playtime;
          playerData.stats.playtime.pretty = formatPlaytime(d.playtime);
          playerData.playerinfo.firstLogin = d.first_joined ?? "";
          playerData.playerinfo.lastLogin = d.last_online ?? "";
          playerFound = true;
        }
      }

      if (rankRes.status === "fulfilled" && rankRes.value.ok) {
        const d: RankResponse = await rankRes.value.json();
        if (d?.uuid) {
          playerData.playerinfo.uuid = d.uuid;
          playerData.playerinfo.rank = {
            id: extractRankName(d.rank),
            color: parseColorCode(d.rank),
          };
          playerFound = true;
        }
      }

      if (minigamesRes.status === "fulfilled" && minigamesRes.value.ok) {
        const d: MinigamesResponse = await minigamesRes.value.json();
        if (d?.duels?.overall) {
          const w = d.duels.overall.wins ?? 0;
          const l = d.duels.overall.losses ?? 0;
          const modes: Record<string, DuelMode> = {};
          if (d.duels.modes) {
            for (const [key, m] of Object.entries(d.duels.modes)) {
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
          playerData.stats.duels = {
            wins: w,
            losses: l,
            kdr: d.duels.overall.kd_ratio ? parseFloat(d.duels.overall.kd_ratio) : 0,
            gamesPlayed: d.duels.overall.total_games ?? w + l,
            elo: d.duels.overall.elo ?? 1000,
            winRate: d.duels.overall.win_rate ?? 0,
            winStreak: d.duels.overall.winStreak ?? 0,
            bestWinStreak: d.duels.overall.bestWinStreak ?? 0,
            modes,
          };
        }
        if (d?.buildffa) {
          const k = d.buildffa.kills ?? 0;
          const de = d.buildffa.deaths ?? 0;
          playerData.stats.buildffa = {
            kills: k,
            deaths: de,
            kdr: d.buildffa.kd_ratio ? parseFloat(d.buildffa.kd_ratio) : de === 0 ? k : Math.round((k / de) * 100) / 100,
          };
        }
      }

      if (!playerFound) {
        setNotFound(true);
        return;
      }

      setStats(playerData);
      if (name !== initialUsername) {
        router.push(`/stats/${name}`, { scroll: false });
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [router, initialUsername]);

  useEffect(() => {
    if (initialUsername) fetchPlayerStats(initialUsername);
  }, [initialUsername, fetchPlayerStats]);

  return (
    <section className="py-10 px-4 bg-gray-950">
      <div className="container mx-auto px-4 py-10">

        {/* Page header — same style as TEAM / CREATORS */}
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">STATISTICS</h1>
            <p className="mt-1 text-sm text-white/40">
              Search for any player on OnThePixel.net
            </p>
          </div>

          {/* Search bar — inline with heading on larger screens */}
          <div className="flex w-full gap-2 sm:max-w-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30 size-4 pointer-events-none" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchPlayerStats(username)}
                placeholder="Minecraft username..."
                className="w-full rounded-lg bg-white/5 border border-white/10 pl-10 pr-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/30 transition-all"
              />
            </div>
            <button
              onClick={() => fetchPlayerStats(username)}
              disabled={loading || !username.trim()}
              className="shrink-0 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : "Search"}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-center text-red-400">
            {error}
          </div>
        )}

        {/* Not Found */}
        {notFound && (
          <div className="rounded-xl border border-white/5 bg-white/[0.03] px-6 py-16 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/5">
              <Search className="size-6 text-white/30" />
            </div>
            <h3 className="mb-2 text-base font-bold text-white">Player not found</h3>
            <p className="text-sm text-white/40">
              <span className="font-mono text-white/60">{username}</span> has never played on OnThePixel.net,
              or the username is incorrect.
            </p>
          </div>
        )}

        {/* Loading */}
        {loading && <Skeleton />}

        {/* Stats */}
        {stats && !loading && (
          <div className="space-y-4">
            {/* Player info card */}
            <div className="rounded-xl border border-white/5 bg-white/[0.03] p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-6">
                <div className="shrink-0">
                  <Image
                    src={`https://mcskin.me/api/pfp/${stats.playerinfo.username}.png?transparent=true`}
                    alt={stats.playerinfo.username}
                    width={80}
                    height={80}
                    className="rounded-lg"
                  />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1.5">
                    {stats.playerinfo.username}
                  </h2>
                  <div
                    className="inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-sm font-bold"
                    style={{
                      backgroundColor: `${stats.playerinfo.rank.color}20`,
                      color: stats.playerinfo.rank.color,
                      boxShadow: `0 0 12px ${stats.playerinfo.rank.color}25`,
                    }}
                  >
                    <Award className="size-3.5" />
                    {stats.playerinfo.rank.id}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <StatBox label="First joined" value={safeDate(stats.playerinfo.firstLogin)} icon={<Clock className="size-4" />} />
                <StatBox label="Last online" value={safeDate(stats.playerinfo.lastLogin)} icon={<Clock className="size-4" />} />
                <StatBox label="Playtime" value={stats.stats.playtime.pretty} icon={<Zap className="size-4" />} />
                <StatBox label="Balance" value={`${stats.stats.balance.pixels.toLocaleString("en-US")} ✦`} icon={<Target className="size-4" />} />
              </div>
            </div>

            {/* Minigames */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ComingSoon title="BedWars" />

              <DuelsCard duels={stats.stats.duels} username={stats.playerinfo.username} />

              <ComingSoon title="TNT Run" />

              <GameCard title="BuildFFA">
                <StatBox label="Kills" value={stats.stats.buildffa.kills} icon={<Sword className="size-4" />} />
                <StatBox label="Deaths" value={stats.stats.buildffa.deaths} />
                <StatBox label="K/D Ratio" value={stats.stats.buildffa.kdr.toFixed(2)} icon={<TrendingUp className="size-4" />} />
              </GameCard>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!stats && !loading && !error && !notFound && (
          <div className="rounded-xl border border-white/5 bg-white/[0.03] px-6 py-20 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/5">
              <Search className="size-6 text-white/30" />
            </div>
            <h3 className="mb-2 text-base font-bold text-white">Search for a player</h3>
            <p className="text-sm text-white/40">
              Enter a Minecraft username above to see their stats
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
