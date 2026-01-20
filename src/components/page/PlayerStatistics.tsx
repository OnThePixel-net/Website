"use client";
import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { Search, Sword, Trophy, Target, Zap, Hammer, Bomb, Clock } from "lucide-react";

// Define types for our stats
interface PlayerStats {
  playerinfo: {
    username: string;
    uuid: string;
    firstLogin: string;
    lastLogin: string;
    rank: {
      id: string;
      color: string;
    };
  };
  stats: {
    playtime: {
      total: number;
      pretty: string;
    };
    balance: {
      pixels: number;
    };
    bedwars: {
      comingSoon: boolean;
    };
    duels: {
      wins: number;
      losses: number;
      kills: number;
      deaths: number;
      kdr: number;
      gamesPlayed: number;
    };
    tntrun: {
      comingSoon: boolean;
    };
    buildffa: {
      kills: number;
      deaths: number;
      kdr: number;
    };
  };
}

interface RankResponse {
  uuid?: string;
  rank?: string;
}

interface PixelResponse {
  balance?: number;
}

interface PlaytimeResponse {
  playtime?: number;
  first_joined?: string;
  last_online?: string;
}

interface MinigamesResponse {
  username?: string;
  uuid?: string;
  duels?: {
    Wins?: number;
    Losses?: number;
    Total_Games?: number;
    KD_Ratio?: string;
  };
  buildffa?: {
    Kills?: number;
    Deaths?: number;
    KD_Ratio?: string;
  };
}

interface PlayerStatisticsProps {
  initialUsername?: string;
}

export default function PlayerStatistics({ initialUsername }: PlayerStatisticsProps) {
  const [username, setUsername] = useState(initialUsername || "");
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Parse Minecraft rank color codes to Hex values
  const parseColorCode = (colorCode: string | undefined): string => {
    if (!colorCode) return '#FFFFFF';

    const colorMap: Record<string, string> = {
      '0': '#000000',
      '1': '#0000AA',
      '2': '#00AA00',
      '3': '#00AAAA',
      '4': '#AA0000',
      '5': '#AA00AA',
      '6': '#FFAA00',
      '7': '#AAAAAA',
      '8': '#555555',
      '9': '#5555FF',
      'a': '#55FF55',
      'b': '#55FFFF',
      'c': '#FF5555',
      'd': '#FF55FF',
      'e': '#FFFF55',
      'f': '#FFFFFF',
    };

    const hexMatch = colorCode.match(/&#([0-9a-fA-F]{6})/);
    if (hexMatch) {
      return `#${hexMatch[1].toUpperCase()}`;
    }

    if (colorCode && (colorCode.startsWith('&') || colorCode.startsWith('§')) && colorCode.length > 1) {
      const code = colorCode.charAt(1).toLowerCase();
      return colorMap[code] || '#FFFFFF';
    }

    return '#FFFFFF';
  };

  // Extract rank name from color-coded string
  const extractRankName = (rankString: string | undefined): string => {
    if (!rankString) return 'Member';

    const hexBracketMatch = rankString.match(/&#[0-9a-fA-F]{6}\[([^\]]+)\]/);
    if (hexBracketMatch) {
      return hexBracketMatch[1];
    }

    const bracketMatch = rankString.match(/\[([^\]]+)\]/);
    if (bracketMatch) {
      return bracketMatch[1];
    }

    // Entferne Farb- und Formatierungscodes (&0-f, &l, &m, &n, &o, &k, §...)
    // l = Bold, m = Strikethrough, n = Underline, o = Italic, k = Obfuscated
    const cleanString = rankString.replace(/[&§][0-9a-fA-Flmnok]/g, '').trim();
    const withoutHex = cleanString.replace(/&#[0-9a-fA-F]{6}/g, '').trim();

    return withoutHex || 'Member';
  };

  // Helper function to format playtime from milliseconds
  const formatPlaytime = (milliseconds: number | undefined): string => {
    if (!milliseconds || milliseconds === 0) return '0m';

    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;
    const remainingMinutes = minutes % 60;

    if (days > 0) {
      return `${days}d ${remainingHours}h ${remainingMinutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  // Calculate K/D ratio
  const calculateKDR = (kills: number, deaths: number): number => {
    if (deaths === 0) return kills;
    return Math.round((kills / deaths) * 100) / 100;
  };

  // Safe date formatter
  const safeFormatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'Unknown';

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Unknown';
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Unknown';
    }
  };

  const fetchPlayerStats = useCallback(async (name: string) => {
    if (!name) return;

    setLoading(true);
    setError(null);

    try {
      let playerData: PlayerStats = {
        playerinfo: {
          username: name,
          uuid: "00000000-0000-0000-0000-000000000000",
          firstLogin: "",
          lastLogin: "",
          rank: {
            id: "Member",
            color: "#AAAAAA"
          }
        },
        stats: {
          playtime: {
            total: 0,
            pretty: "0m"
          },
          balance: {
            pixels: 0
          },
          bedwars: {
            comingSoon: true
          },
          duels: {
            wins: 0,
            losses: 0,
            kills: 0,
            deaths: 0,
            kdr: 0,
            gamesPlayed: 0
          },
          tntrun: {
            comingSoon: true
          },
          buildffa: {
            kills: 0,
            deaths: 0,
            kdr: 0
          }
        }
      };

      // Fetch pixels data
      try {
        const pixelResponse = await fetch(`https://api.onthepixel.net/stats/pixel/${name}`);
        if (pixelResponse.ok) {
          const pixelData: PixelResponse = await pixelResponse.json();
          playerData.stats.balance.pixels = pixelData?.balance ?? 0;
        }
      } catch (pixelError) {
        console.error("Error fetching pixels data:", pixelError);
        playerData.stats.balance.pixels = 0;
      }

      // Fetch playtime data
      try {
        const playtimeResponse = await fetch(`https://api.onthepixel.net/stats/playtime/${name}`);
        if (playtimeResponse.ok) {
          const playtimeData: PlaytimeResponse = await playtimeResponse.json();
          playerData.stats.playtime.total = playtimeData?.playtime ?? 0;
          playerData.stats.playtime.pretty = formatPlaytime(playtimeData?.playtime);
          playerData.playerinfo.firstLogin = playtimeData?.first_joined ?? "";
          playerData.playerinfo.lastLogin = playtimeData?.last_online ?? "";
        }
      } catch (playtimeError) {
        console.error("Error fetching playtime data:", playtimeError);
      }

      // Fetch rank data
      try {
        const rankResponse = await fetch(`https://api.onthepixel.net/stats/luckperms/rank/${name}`);
        if (rankResponse.ok) {
          const rankData: RankResponse = await rankResponse.json();
          playerData.playerinfo.uuid = rankData?.uuid ?? "00000000-0000-0000-0000-000000000000";
          playerData.playerinfo.rank = {
            id: extractRankName(rankData?.rank),
            color: parseColorCode(rankData?.rank)
          };
        }
      } catch (rankError) {
        console.error("Error fetching rank data:", rankError);
      }

      // Fetch Minigames stats
      try {
        const minigamesResponse = await fetch(`https://api.onthepixel.net/stats/minigames/${name}`);
        if (minigamesResponse.ok) {
          const minigamesData: MinigamesResponse = await minigamesResponse.json();

          if (minigamesData?.duels) {
            const duelsWins = minigamesData.duels.Wins ?? 0;
            const duelsLosses = minigamesData.duels.Losses ?? 0;
            const duelsGames = minigamesData.duels.Total_Games ?? (duelsWins + duelsLosses);
            const duelsKDR = minigamesData.duels.KD_Ratio ? parseFloat(minigamesData.duels.KD_Ratio) : 0;

            playerData.stats.duels = {
              wins: duelsWins,
              losses: duelsLosses,
              kills: 0,
              deaths: 0,
              kdr: duelsKDR,
              gamesPlayed: duelsGames
            };
          }

          if (minigamesData?.buildffa) {
            const buildffaKills = minigamesData.buildffa.Kills ?? 0;
            const buildffaDeaths = minigamesData.buildffa.Deaths ?? 0;
            const buildffaKDR = minigamesData.buildffa.KD_Ratio
              ? parseFloat(minigamesData.buildffa.KD_Ratio)
              : calculateKDR(buildffaKills, buildffaDeaths);

            playerData.stats.buildffa = {
              kills: buildffaKills,
              deaths: buildffaDeaths,
              kdr: buildffaKDR
            };
          }
        }
      } catch (minigamesError) {
        console.error("Error fetching minigames data:", minigamesError);
      }

      if (name.toLowerCase() === 'error') {
        throw new Error("Player not found");
      }

      setStats(playerData);

      // Update URL
      try {
        const newUrl = `/stats/${name}`;
        window.history.pushState({ path: newUrl }, "", newUrl);
      } catch (error) {
        console.log("History API not available in this environment");
      }
    } catch (error) {
      console.error("Error fetching player data:", error);
      setError("Player not found or an error occurred.");
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load stats automatically when initialUsername is provided
  useEffect(() => {
    if (initialUsername && initialUsername.length > 0) {
      fetchPlayerStats(initialUsername);
    }
  }, [initialUsername, fetchPlayerStats]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const formatDate = (dateString: string) => {
    return safeFormatDate(dateString);
  };

  const StatItem = ({ label, value, icon }: { label: string; value: string | number; icon?: React.ReactNode }) => (
    <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded border border-gray-700/50">
      <div className="flex items-center gap-2 text-gray-400">
        {icon}
        {label}
      </div>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );

  const ComingSoonCard = ({ title, icon, color }: { title: string; icon: React.ReactNode; color: string }) => (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center">
      <div className={`flex justify-center mb-3 ${color}`}>
        {icon}
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm mb-4">Statistics coming soon</p>
      <span className="inline-block px-3 py-1 bg-gray-700/50 text-gray-400 text-xs rounded">
        Coming Soon
      </span>
      <p className="text-gray-500 text-xs mt-3">Statistics will be available in a future update</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            {stats ? `STATISTICS FOR ${stats.playerinfo.username}` : 'PLAYER STATISTICS'}
          </h1>
          <div className="h-1 w-20 bg-gradient-to-r from-green-500 to-blue-500 rounded"></div>
        </div>

        {/* Search Bar */}
        <div className="mb-8 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={username}
              onChange={handleInputChange}
              onKeyPress={(e) => e.key === 'Enter' && fetchPlayerStats(username)}
              placeholder="Enter A Minecraft Username"
              className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => fetchPlayerStats(username)}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || !username}
          >
            {loading ? (
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              "Search"
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded text-red-400">
            {error}
          </div>
        )}

        {/* Player Stats */}
        {stats && (
          <>
            {/* Player Info Card */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-lg p-6 mb-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">{stats.playerinfo.username}</h2>
                  <div
                    className="inline-block px-3 py-1 rounded font-semibold text-white"
                    style={{ backgroundColor: stats.playerinfo.rank.color }}
                  >
                    {stats.playerinfo.rank.id}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatItem
                  label="First joined"
                  value={formatDate(stats.playerinfo.firstLogin)}
                  icon={<Clock className="w-4 h-4" />}
                />
                <StatItem
                  label="Last online"
                  value={formatDate(stats.playerinfo.lastLogin)}
                  icon={<Clock className="w-4 h-4" />}
                />
                <StatItem
                  label="Playtime"
                  value={stats.stats.playtime.pretty}
                  icon={<Zap className="w-4 h-4" />}
                />
                <StatItem
                  label="Balance"
                  value={`${stats.stats.balance.pixels.toLocaleString()} pixels`}
                  icon={<Target className="w-4 h-4" />}
                />
              </div>
            </div>

            {/* Minigames Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bedwars */}
              <ComingSoonCard
                title="Bedwars"
                icon={<Bomb className="w-12 h-12" />}
                color="text-red-400"
              />

              {/* Duels */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sword className="w-6 h-6 text-blue-400" />
                  <h3 className="text-2xl font-bold text-white">Duels</h3>
                </div>
                <p className="text-gray-400 text-sm mb-4">1v1 combat and skill statistics</p>
                <div className="space-y-3">
                  <StatItem label="Wins" value={stats.stats.duels.wins} />
                  <StatItem label="Losses" value={stats.stats.duels.losses} />
                  <StatItem label="K/D Ratio" value={stats.stats.duels.kdr.toFixed(2)} />
                  <StatItem label="Games Played" value={stats.stats.duels.gamesPlayed} />
                </div>
              </div>

              {/* TNT Run */}
              <ComingSoonCard
                title="TNT Run"
                icon={<Bomb className="w-12 h-12" />}
                color="text-orange-400"
              />

              {/* Build FFA */}
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Hammer className="w-6 h-6 text-orange-400" />
                  <h3 className="text-2xl font-bold text-white">BuildFFA</h3>
                </div>
                <p className="text-gray-400 text-sm mb-4">Building and combat statistics</p>
                <div className="space-y-3">
                  <StatItem label="Kills" value={stats.stats.buildffa.kills} />
                  <StatItem label="Deaths" value={stats.stats.buildffa.deaths} />
                  <StatItem label="K/D Ratio" value={stats.stats.buildffa.kdr.toFixed(2)} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
