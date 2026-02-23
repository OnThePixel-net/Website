"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Sword, Trophy, Target, Zap, Clock, User, TrendingUp, Award } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  const router = useRouter();
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
    
    const cleanString = rankString.replace(/[&§][0-9a-fA-Flmnokr]/g, '').trim();
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
        month: 'short',
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
      
      // Update URL without triggering a reload
      if (name !== initialUsername) {
        router.push(`/stats/${name}`, { scroll: false });
      }
    } catch (error) {
      console.error("Error fetching player data:", error);
      setError("Player not found or an error occurred.");
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, [router, initialUsername]);

  // Auto-fetch if initialUsername is provided
  useEffect(() => {
    if (initialUsername) {
      fetchPlayerStats(initialUsername);
    }
  }, [initialUsername, fetchPlayerStats]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const handleSearch = () => {
    fetchPlayerStats(username);
  };

  const StatItem = ({ 
    label, 
    value, 
    icon
  }: { 
    label: string; 
    value: string | number; 
    icon?: React.ReactNode;
  }) => (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <span className="font-semibold">{value}</span>
    </div>
  );

  const ComingSoonCard = ({ 
    title, 
    icon
  }: { 
    title: string; 
    icon: React.ReactNode;
  }) => (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <div className="text-muted-foreground mb-4">{icon}</div>
        <CardTitle className="mb-2">{title}</CardTitle>
        <CardDescription className="mb-4 text-center">Statistics coming soon</CardDescription>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-muted text-muted-foreground text-sm rounded-md">
          <Clock className="size-4" />
          Coming Soon
        </div>
      </CardContent>
    </Card>
  );

  const SkeletonLoader = () => (
    <div className="space-y-6 animate-pulse">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="size-20 bg-muted rounded-lg"></div>
              <div>
                <div className="h-8 w-32 bg-muted rounded mb-2"></div>
                <div className="h-6 w-20 bg-muted rounded"></div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-16 bg-muted rounded-lg"></div>
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-64 bg-muted rounded-xl"></div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pt-36">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2">
            Player Statistics
          </h1>
          <p className="text-muted-foreground">
            Search for any player and view their detailed statistics
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-12 max-w-2xl mx-auto">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4 pointer-events-none" />
              <Input
                type="text"
                value={username}
                onChange={handleInputChange}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Enter a Minecraft username..."
                className="pl-10"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={loading || !username}
              size="default"
            >
              {loading ? (
                <div className="size-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Search"
              )}
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive text-center max-w-2xl mx-auto">
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading && <SkeletonLoader />}

        {/* Player Stats */}
        {stats && !loading && (
          <div className="space-y-6">
            {/* Player Info Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-6">
                  <div className="flex items-center gap-4">
                    {/* Minecraft Skin Avatar */}
                    <img
                      src={`https://mc-heads.net/avatar/${stats.playerinfo.username}/80`}
                      alt={stats.playerinfo.username}
                      className="size-20 rounded-lg border-2"
                    />
                    
                    <div>
                      <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
                        {stats.playerinfo.username}
                        <User className="size-5 text-muted-foreground" />
                      </h2>
                      <div
                        className="inline-flex items-center gap-2 px-3 py-1 rounded-md font-semibold text-white text-sm"
                        style={{ 
                          backgroundColor: stats.playerinfo.rank.color
                        }}
                      >
                        <Award className="size-3" />
                        {stats.playerinfo.rank.id}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatItem
                    label="First joined"
                    value={safeFormatDate(stats.playerinfo.firstLogin)}
                    icon={<Clock className="size-4" />}
                  />
                  <StatItem
                    label="Last online"
                    value={safeFormatDate(stats.playerinfo.lastLogin)}
                    icon={<Clock className="size-4" />}
                  />
                  <StatItem
                    label="Playtime"
                    value={stats.stats.playtime.pretty}
                    icon={<Zap className="size-4" />}
                  />
                  <StatItem
                    label="Balance"
                    value={`${stats.stats.balance.pixels.toLocaleString('en-US')} Pixel`}
                    icon={<Target className="size-4" />}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Minigames Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Bedwars */}
              <ComingSoonCard
                title="Bedwars"
                icon={<Trophy className="size-12" />}
              />

              {/* Duels */}
              <Card>
                <CardHeader>
                  <CardTitle>Duels</CardTitle>
                  <CardDescription>1v1 combat and skill statistics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <StatItem 
                    label="Wins" 
                    value={stats.stats.duels.wins}
                    icon={<Trophy className="size-4" />}
                  />
                  <StatItem 
                    label="Losses" 
                    value={stats.stats.duels.losses}
                  />
                  <StatItem 
                    label="K/D Ratio" 
                    value={stats.stats.duels.kdr.toFixed(2)}
                    icon={<TrendingUp className="size-4" />}
                  />
                  <StatItem 
                    label="Games Played" 
                    value={stats.stats.duels.gamesPlayed}
                  />
                </CardContent>
              </Card>

              {/* TNT Run */}
              <ComingSoonCard
                title="TNT Run"
                icon={<Clock className="size-12" />}
              />

              {/* Build FFA */}
              <Card>
                <CardHeader>
                  <CardTitle>BuildFFA</CardTitle>
                  <CardDescription>Building and combat statistics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <StatItem 
                    label="Kills" 
                    value={stats.stats.buildffa.kills}
                    icon={<Sword className="size-4" />}
                  />
                  <StatItem 
                    label="Deaths" 
                    value={stats.stats.buildffa.deaths}
                  />
                  <StatItem 
                    label="K/D Ratio" 
                    value={stats.stats.buildffa.kdr.toFixed(2)}
                    icon={<TrendingUp className="size-4" />}
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!stats && !loading && !error && (
          <div className="text-center py-20">
            <div className="inline-flex p-6 bg-muted rounded-xl mb-4">
              <Search className="size-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No Statistics</h3>
            <p className="text-muted-foreground">Search for a player to view their statistics</p>
          </div>
        )}
      </div>
    </div>
  );
}
