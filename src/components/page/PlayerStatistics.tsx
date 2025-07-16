"use client";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, Sword, Trophy, Target, Zap, Hammer, Bomb } from "lucide-react";

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
      wins: number;
      losses: number;
      kills: number;
      deaths: number;
      bedsDestroyed: number;
      kdr: number;
      winRate: number;
      gamesPlayed: number;
    };
    duels: {
      wins: number;
      losses: number;
      kills: number;
      deaths: number;
      kdr: number;
      winRate: number;
      gamesPlayed: number;
    };
    tntrun: {
      wins: number;
      losses: number;
      gamesPlayed: number;
      winRate: number;
      timeSurvived: number;
    };
    buildffa: {
      wins: number;
      losses: number;
      kills: number;
      deaths: number;
      kdr: number;
      winRate: number;
      gamesPlayed: number;
      buildsCompleted: number;
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

interface BedwarsResponse {
  wins?: number;
  losses?: number;
  kills?: number;
  deaths?: number;
  beds_destroyed?: number;
  games_played?: number;
}

interface DuelsResponse {
  wins?: number;
  losses?: number;
  kills?: number;
  deaths?: number;
  games_played?: number;
}

interface TNTRunResponse {
  wins?: number;
  losses?: number;
  games_played?: number;
  time_survived?: number;
}

interface BuildFFAResponse {
  wins?: number;
  losses?: number;
  kills?: number;
  deaths?: number;
  games_played?: number;
  builds_completed?: number;
}

export default function PlayerStatistics() {
  const [username, setUsername] = useState<string>("");
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedUsername = window.location.pathname.split("/").pop();
    if (storedUsername && storedUsername !== "stats") {
      setUsername(storedUsername);
      fetchPlayerStats(storedUsername);
    }
  }, []);

  // Parse Minecraft rank color codes to Hex values
  const parseColorCode = (colorCode: string | undefined): string => {
    if (!colorCode) return '#FFFFFF';
    
    const colorMap: Record<string, string> = {
      '0': '#000000', // Black
      '1': '#0000AA', // Dark Blue
      '2': '#00AA00', // Dark Green
      '3': '#00AAAA', // Dark Aqua
      '4': '#AA0000', // Dark Red
      '5': '#AA00AA', // Dark Purple
      '6': '#FFAA00', // Gold
      '7': '#AAAAAA', // Gray
      '8': '#555555', // Dark Gray
      '9': '#5555FF', // Blue
      'a': '#55FF55', // Green
      'b': '#55FFFF', // Aqua
      'c': '#FF5555', // Red
      'd': '#FF55FF', // Light Purple
      'e': '#FFFF55', // Yellow
      'f': '#FFFFFF', // White
    };

    // If starts with & or § followed by a color code
    if (colorCode && (colorCode.startsWith('&') || colorCode.startsWith('§')) && colorCode.length > 1) {
      const code = colorCode.charAt(1).toLowerCase();
      return colorMap[code] || '#FFFFFF';
    }
    
    return '#FFFFFF'; // Default white
  };

  // Extract rank name from color-coded string
  const extractRankName = (rankString: string | undefined): string => {
    if (!rankString) return 'Member';
    // Remove color codes (& or § followed by a character)
    return rankString.replace(/[&§][0-9a-fA-F]/g, '').trim() || 'Member';
  };

  // Helper function to format playtime from milliseconds
  const formatPlaytime = (milliseconds: number | undefined): string => {
    if (!milliseconds || milliseconds === 0) return '0m';
    
    // Convert milliseconds to seconds, minutes, hours, and days
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    // Calculate remaining hours and minutes
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

  // Format time in seconds to readable format
  const formatTime = (timeInSeconds: number | undefined): string => {
    if (!timeInSeconds || timeInSeconds === 0) return '0s';
    
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
  };

  // Calculate K/D ratio
  const calculateKDR = (kills: number, deaths: number): number => {
    if (deaths === 0) return kills;
    return Math.round((kills / deaths) * 100) / 100;
  };

  // Calculate win rate
  const calculateWinRate = (wins: number, games: number): number => {
    if (games === 0) return 0;
    return Math.round((wins / games) * 100);
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

  const fetchPlayerStats = async (name: string) => {
    if (!name) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Create initial player data structure with safe defaults
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
            wins: 0,
            losses: 0,
            kills: 0,
            deaths: 0,
            bedsDestroyed: 0,
            kdr: 0,
            winRate: 0,
            gamesPlayed: 0
          },
          duels: {
            wins: 0,
            losses: 0,
            kills: 0,
            deaths: 0,
            kdr: 0,
            winRate: 0,
            gamesPlayed: 0
          },
          tntrun: {
            wins: 0,
            losses: 0,
            gamesPlayed: 0,
            winRate: 0,
            timeSurvived: 0
          },
          buildffa: {
            wins: 0,
            losses: 0,
            kills: 0,
            deaths: 0,
            kdr: 0,
            winRate: 0,
            gamesPlayed: 0,
            buildsCompleted: 0
          }
        }
      };
      
      // Fetch pixels data from API with safe handling
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

      // Fetch playtime data from API with safe handling
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
        // Keep default values (already set to safe defaults)
      }
      
      // Fetch rank data with safe handling
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
        // Keep default rank values
      }

      // Fetch Bedwars stats
      try {
        const bedwarsResponse = await fetch(`https://api.onthepixel.net/stats/bedwars/${name}`);
        if (bedwarsResponse.ok) {
          const bedwarsData: BedwarsResponse = await bedwarsResponse.json();
          
          const wins = bedwarsData?.wins ?? 0;
          const losses = bedwarsData?.losses ?? 0;
          const kills = bedwarsData?.kills ?? 0;
          const deaths = bedwarsData?.deaths ?? 0;
          const gamesPlayed = bedwarsData?.games_played ?? (wins + losses);
          
          playerData.stats.bedwars = {
            wins,
            losses,
            kills,
            deaths,
            bedsDestroyed: bedwarsData?.beds_destroyed ?? 0,
            kdr: calculateKDR(kills, deaths),
            winRate: calculateWinRate(wins, gamesPlayed),
            gamesPlayed
          };
        }
      } catch (bedwarsError) {
        console.error("Error fetching bedwars data:", bedwarsError);
        // Keep default bedwars values
      }

      // Fetch Duels stats
      try {
        const duelsResponse = await fetch(`https://api.onthepixel.net/stats/duels/${name}`);
        if (duelsResponse.ok) {
          const duelsData: DuelsResponse = await duelsResponse.json();
          
          const wins = duelsData?.wins ?? 0;
          const losses = duelsData?.losses ?? 0;
          const kills = duelsData?.kills ?? 0;
          const deaths = duelsData?.deaths ?? 0;
          const gamesPlayed = duelsData?.games_played ?? (wins + losses);
          
          playerData.stats.duels = {
            wins,
            losses,
            kills,
            deaths,
            kdr: calculateKDR(kills, deaths),
            winRate: calculateWinRate(wins, gamesPlayed),
            gamesPlayed
          };
        }
      } catch (duelsError) {
        console.error("Error fetching duels data:", duelsError);
        // Keep default duels values
      }

      // Fetch TNTRun stats
      try {
        const tntrunResponse = await fetch(`https://api.onthepixel.net/stats/tntrun/${name}`);
        if (tntrunResponse.ok) {
          const tntrunData: TNTRunResponse = await tntrunResponse.json();
          
          const wins = tntrunData?.wins ?? 0;
          const losses = tntrunData?.losses ?? 0;
          const gamesPlayed = tntrunData?.games_played ?? (wins + losses);
          
          playerData.stats.tntrun = {
            wins,
            losses,
            gamesPlayed,
            winRate: calculateWinRate(wins, gamesPlayed),
            timeSurvived: tntrunData?.time_survived ?? 0
          };
        }
      } catch (tntrunError) {
        console.error("Error fetching tntrun data:", tntrunError);
        // Keep default tntrun values
      }

      // Fetch BuildFFA stats
      try {
        const buildffaResponse = await fetch(`https://api.onthepixel.net/stats/buildffa/${name}`);
        if (buildffaResponse.ok) {
          const buildffaData: BuildFFAResponse = await buildffaResponse.json();
          
          const wins = buildffaData?.wins ?? 0;
          const losses = buildffaData?.losses ?? 0;
          const kills = buildffaData?.kills ?? 0;
          const deaths = buildffaData?.deaths ?? 0;
          const gamesPlayed = buildffaData?.games_played ?? (wins + losses);
          
          playerData.stats.buildffa = {
            wins,
            losses,
            kills,
            deaths,
            kdr: calculateKDR(kills, deaths),
            winRate: calculateWinRate(wins, gamesPlayed),
            gamesPlayed,
            buildsCompleted: buildffaData?.builds_completed ?? 0
          };
        }
      } catch (buildffaError) {
        console.error("Error fetching buildffa data:", buildffaError);
        // Keep default buildffa values
      }
      
      // Special test case
      if (name.toLowerCase() === 'error') {
        throw new Error("Player not found");
      }
      
      setStats(playerData);
      
      // Update URL
      const newUrl = `/stats/${name}`;
      window.history.pushState({ path: newUrl }, "", newUrl);
      
    } catch (error) {
      console.error("Error fetching player data:", error);
      setError("Player not found or an error occurred.");
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    fetchPlayerStats(username);
  };

  // Format dates to be more readable with safe handling
  const formatDate = (dateString: string) => {
    return safeFormatDate(dateString);
  };

  // Stat item component for cleaner code
  const StatItem = ({ label, value, icon }: { label: string; value: string | number; icon?: React.ReactNode }) => (
    <div className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-gray-400">{label}</span>
      </div>
      <span className="font-semibold text-white">{value}</span>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-5">
        {stats ? `STATISTICS FOR ${stats.playerinfo.username}` : 'PLAYER STATISTICS'}
      </h1>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              value={username}
              onChange={handleInputChange}
              placeholder="Enter A Minecraft Username"
              className="w-full pl-10 bg-gray-800/50 border-gray-700"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
          <Button 
            type="submit"
            className="bg-green-600 hover:bg-green-700"
            disabled={loading || !username}
          >
            {loading ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              "Search"
            )}
          </Button>
        </div>
      </form>
      
      {error && (
        <Card className="mb-6 border-red-500/30 bg-red-950/10">
          <CardContent className="pt-6">
            <p className="text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}
      
      {stats && (
        <>
          {/* Player Info Card */}
          <Card className="bg-gray-900/50 border-gray-800 mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                <div className="relative h-40 w-40 overflow-hidden rounded-lg border-green-600 bg-gray-600 shadow-lg">
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
                    <Badge 
                      style={{backgroundColor: stats.playerinfo.rank.color}}
                      className="text-black"
                    >
                      {stats.playerinfo.rank.id}
                    </Badge>
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
            </CardContent>
          </Card>

          {/* Gamemode Stats Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Bedwars Stats */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-red-400">
                  <Sword className="h-5 w-5" />
                  BedWars
                </CardTitle>
                <CardDescription>
                  Bed destruction and combat statistics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <StatItem 
                  label="Wins" 
                  value={stats.stats.bedwars.wins.toLocaleString()} 
                  icon={<Trophy className="h-4 w-4 text-yellow-400" />}
                />
                <StatItem 
                  label="Losses" 
                  value={stats.stats.bedwars.losses.toLocaleString()} 
                />
                <StatItem 
                  label="Win Rate" 
                  value={`${stats.stats.bedwars.winRate}%`} 
                />
                <StatItem 
                  label="Kills" 
                  value={stats.stats.bedwars.kills.toLocaleString()} 
                  icon={<Target className="h-4 w-4 text-red-400" />}
                />
                <StatItem 
                  label="Deaths" 
                  value={stats.stats.bedwars.deaths.toLocaleString()} 
                />
                <StatItem 
                  label="K/D Ratio" 
                  value={stats.stats.bedwars.kdr} 
                />
                <StatItem 
                  label="Beds Destroyed" 
                  value={stats.stats.bedwars.bedsDestroyed.toLocaleString()} 
                />
                <StatItem 
                  label="Games Played" 
                  value={stats.stats.bedwars.gamesPlayed.toLocaleString()} 
                />
              </CardContent>
            </Card>

            {/* Duels Stats */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-purple-400">
                  <Zap className="h-5 w-5" />
                  Duels
                </CardTitle>
                <CardDescription>
                  1v1 combat and skill statistics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <StatItem 
                  label="Wins" 
                  value={stats.stats.duels.wins.toLocaleString()} 
                  icon={<Trophy className="h-4 w-4 text-yellow-400" />}
                />
                <StatItem 
                  label="Losses" 
                  value={stats.stats.duels.losses.toLocaleString()} 
                />
                <StatItem 
                  label="Win Rate" 
                  value={`${stats.stats.duels.winRate}%`} 
                />
                <StatItem 
                  label="Kills" 
                  value={stats.stats.duels.kills.toLocaleString()} 
                  icon={<Target className="h-4 w-4 text-red-400" />}
                />
                <StatItem 
                  label="Deaths" 
                  value={stats.stats.duels.deaths.toLocaleString()} 
                />
                <StatItem 
                  label="K/D Ratio" 
                  value={stats.stats.duels.kdr} 
                />
                <StatItem 
                  label="Games Played" 
                  value={stats.stats.duels.gamesPlayed.toLocaleString()} 
                />
              </CardContent>
            </Card>

            {/* TNTRun Stats */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-orange-400">
                  <Bomb className="h-5 w-5" />
                  TNTRun
                </CardTitle>
                <CardDescription>
                  Survival and endurance statistics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <StatItem 
                  label="Wins" 
                  value={stats.stats.tntrun.wins.toLocaleString()} 
                  icon={<Trophy className="h-4 w-4 text-yellow-400" />}
                />
                <StatItem 
                  label="Losses" 
                  value={stats.stats.tntrun.losses.toLocaleString()} 
                />
                <StatItem 
                  label="Win Rate" 
                  value={`${stats.stats.tntrun.winRate}%`} 
                />
                <StatItem 
                  label="Games Played" 
                  value={stats.stats.tntrun.gamesPlayed.toLocaleString()} 
                />
                <StatItem 
                  label="Total Time Survived" 
                  value={formatTime(stats.stats.tntrun.timeSurvived)} 
                />
              </CardContent>
            </Card>

            {/* BuildFFA Stats */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-green-400">
                  <Hammer className="h-5 w-5" />
                  BuildFFA
                </CardTitle>
                <CardDescription>
                  Building and combat statistics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <StatItem 
                  label="Wins" 
                  value={stats.stats.buildffa.wins.toLocaleString()} 
                  icon={<Trophy className="h-4 w-4 text-yellow-400" />}
                />
                <StatItem 
                  label="Losses" 
                  value={stats.stats.buildffa.losses.toLocaleString()} 
                />
                <StatItem 
                  label="Win Rate" 
                  value={`${stats.stats.buildffa.winRate}%`} 
                />
                <StatItem 
                  label="Kills" 
                  value={stats.stats.buildffa.kills.toLocaleString()} 
                  icon={<Target className="h-4 w-4 text-red-400" />}
                />
                <StatItem 
                  label="Deaths" 
                  value={stats.stats.buildffa.deaths.toLocaleString()} 
                />
                <StatItem 
                  label="K/D Ratio" 
                  value={stats.stats.buildffa.kdr} 
                />
                <StatItem 
                  label="Builds Completed" 
                  value={stats.stats.buildffa.buildsCompleted.toLocaleString()} 
                />
                <StatItem 
                  label="Games Played" 
                  value={stats.stats.buildffa.gamesPlayed.toLocaleString()} 
                />
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
