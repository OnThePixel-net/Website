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
import { Search } from "lucide-react";

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
    parkour: {
      completions: number;
      bestTime: string;
      checkpoint: number;
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
          parkour: {
            completions: 0,
            bestTime: "0s",
            checkpoint: 0
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
        </>
      )}
    </div>
  );
}
