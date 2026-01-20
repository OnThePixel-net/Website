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
  const [username, setUsername] = useState<string>(initialUsername || "");
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Parse Minecraft rank color codes to Hex values
  const parseColorCode = (colorCode: string | undefined): string => {
    if (!colorCode) return '#FFFFFF';
    
    const colorMap: Record<string, string> = {
      '0': '#000000', '1': '#0000AA', '2': '#00AA00', '3': '#00AAAA',
      '4': '#AA0000', '5': '#AA00AA', '6': '#FFAA00', '7': '#AAAAAA',
      '8': '#555555', '9': '#5555FF', 'a': '#55FF55', 'b': '#55FFFF',
      'c': '#FF5555', 'd': '#FF55FF', 'e': '#FFFF55', 'f': '#FFFFFF',
      'f': '&l',
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
    
    const cleanString = rankString.replace(/[&§][0-9a-fA-F]/g, '').trim();
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
            const buildffaKDR = minigamesData.buildffa.KD_Ratio ? parseFloat(minigamesData.buildffa.KD_Ratio) : calculateKDR(buildffaKills, buildffaDeaths);
            
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
  }, []); // WICHTIG: Leeres Dependency-Array verhindert die Endlosschleife!

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
    <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-gray-400">{label}</span>
      </div>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );

  const ComingSoonCard = ({ title, icon, color }: { title: string; icon: React.ReactNode; color: string }) => (
    <div className="bg-gray-900/50 border border-gray-800 rounded-lg">
      <div className="p-6 pb-4">
        <div className={`flex items-center gap-2 text-xl font-bold ${color} mb-2`}>
          {icon}
          {title}
        </div>
        <p className="text-gray-400">Statistics coming soon</p>
      </div>
      <div className="p-6 flex items-center justify-center py-12">
        <div className="text-center">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400 text-lg font-medium">Coming Soon</p>
          <p className="text-gray-500 text-sm mt-2">Statistics will be available in a future update</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-5">
          {stats ? `STATISTICS FOR ${stats.playerinfo.username}` : 'PLAYER STATISTICS'}
        </h1>
        
        <div className="mb-8">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={username}
                onChange={handleInputChange}
                onKeyPress={(e) => e.key === 'Enter' && fetchPlayerStats(username)}
                placeholder="Enter A Minecraft Username"
                className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            </div>
            <button 
              onClick={() => fetchPlayerStats(username)}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !username}
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                "Search"
              )}
            </button>
          </div>
        </div>
        
        {error && (
          <div className="mb-6 border border-red-500/30 bg-red-950/10 rounded-lg p-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}
        
        {stats && (
          <>
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                <div className="relative h-40 w-40 overflow-hidden rounded-lg border-2 border-green-600 bg-gray-600 shadow-lg">
                  <Image
                    src={`https://vzge.me/full/400/${stats.playerinfo.username}.png`}
                    className="absolute left-0 right-0 m-auto translate-y-10 scale-110 bg-gray-600"
                    alt={stats.playerinfo.username}
                    width={400}
                    height={400}
                  />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-2xl font-bold">{stats.playerinfo.username}</h2>
                    <span 
                      style={{backgroundColor: stats.playerinfo.rank.color}}
                      className="px-2 py-1 rounded text-black text-sm font-medium"
                    >
                      {stats.playerinfo.rank.id}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400">First joined</p>
                      <p className="font-medium">{formatDate(stats.playerinfo.firstLogin)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Last online</p>
                      <p className="font-medium">{formatDate(stats.playerinfo.lastLogin)}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Playtime</p>
                      <p className="font-medium">{stats.stats.playtime.pretty}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Balance</p>
                      <p className="font-medium">
                        <span className="text-green-400">{stats.stats.balance.pixels.toLocaleString()}</span> pixels
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <ComingSoonCard 
                title="BedWars"
                icon={<Sword className="h-5 w-5" />}
                color="text-red-400"
              />

              <div className="bg-gray-900/50 border border-gray-800 rounded-lg">
                <div className="p-6 pb-4">
                  <div className="flex items-center gap-2 text-xl font-bold text-purple-400 mb-2">
                    <Zap className="h-5 w-5" />
                    Duels
                  </div>
                  <p className="text-gray-400">1v1 combat and skill statistics</p>
                </div>
                <div className="p-6 space-y-3">
                  <StatItem 
                    label="Wins" 
                    value={stats.stats.duels.wins.toLocaleString()} 
                    icon={<Trophy className="h-4 w-4 text-yellow-400" />}
                  />
                  <StatItem label="Losses" value={stats.stats.duels.losses.toLocaleString()} />
                  <StatItem label="K/D Ratio" value={stats.stats.duels.kdr} />
                  <StatItem label="Games Played" value={stats.stats.duels.gamesPlayed.toLocaleString()} />
                </div>
              </div>

              <ComingSoonCard 
                title="TNTRun"
                icon={<Bomb className="h-5 w-5" />}
                color="text-orange-400"
              />

              <div className="bg-gray-900/50 border border-gray-800 rounded-lg">
                <div className="p-6 pb-4">
                  <div className="flex items-center gap-2 text-xl font-bold text-green-400 mb-2">
                    <Hammer className="h-5 w-5" />
                    BuildFFA
                  </div>
                  <p className="text-gray-400">Building and combat statistics</p>
                </div>
                <div className="p-6 space-y-3">
                  <StatItem 
                    label="Kills" 
                    value={stats.stats.buildffa.kills.toLocaleString()} 
                    icon={<Target className="h-4 w-4 text-red-400" />}
                  />
                  <StatItem label="Deaths" value={stats.stats.buildffa.deaths.toLocaleString()} />
                  <StatItem label="K/D Ratio" value={stats.stats.buildffa.kdr} />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
