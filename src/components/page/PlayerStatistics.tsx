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
      shards: number;
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

export default function PlayerStatistics() {
  const [username, setUsername] = useState<string>("");
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("overview");

  useEffect(() => {
    const storedUsername = window.location.pathname.split("/").pop();
    if (storedUsername && storedUsername !== "stats") {
      setUsername(storedUsername);
      fetchPlayerStats(storedUsername);
    }
  }, []);

  const fetchPlayerStats = async (name: string) => {
    if (!name) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // In a real implementation, you would fetch from your API
      // const response = await fetch(`https://api.onthepixel.net/stats/${name}`);
      // const data = await response.json();
      
      // For now, let's create dummy data
      const dummyData: PlayerStats = {
        playerinfo: {
          username: name,
          uuid: "00000000-0000-0000-0000-000000000000",
          firstLogin: "2023-08-15",
          lastLogin: "2025-03-05",
          rank: {
            id: name.length > 5 ? "VIP+" : "Member",
            color: name.length > 5 ? "#55FF55" : "#AAAAAA"
          }
        },
        stats: {
          playtime: {
            total: 12445,
            pretty: "207h 25m"
          },
          balance: {
            pixels: 15000,
            shards: 320
          },
          bedwars: {
            wins: 47,
            losses: 53,
            kills: 182,
            deaths: 165,
            bedsDestroyed: 35,
            kdr: 1.1,
            winRate: 47,
            gamesPlayed: 100
          },
          parkour: {
            completions: 8,
            bestTime: "1m 45s",
            checkpoint: 12
          }
        }
      };
      
      if (name.toLowerCase() === 'error') {
        throw new Error("Player not found");
      }
      
      setStats(dummyData);
      
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

  // Format dates to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
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
              placeholder="Enter username"
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
                        {" • "}
                        <span className="text-purple-400">{stats.stats.balance.shards.toLocaleString()}</span> shards
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 gap-6">
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle>Game Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* BedWars Stats */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg border-b border-gray-800 pb-2">BedWars</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Games Played</span>
                        <span>{stats.stats.bedwars.gamesPlayed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Win Rate</span>
                        <span>{stats.stats.bedwars.winRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">K/D Ratio</span>
                        <span>{stats.stats.bedwars.kdr.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Beds Destroyed</span>
                        <span>{stats.stats.bedwars.bedsDestroyed}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Parkour Stats */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg border-b border-gray-800 pb-2">Parkour</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Completions</span>
                        <span>{stats.stats.parkour.completions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Best Time</span>
                        <span>{stats.stats.parkour.bestTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Checkpoint</span>
                        <span>{stats.stats.parkour.checkpoint}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* General Stats */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg border-b border-gray-800 pb-2">Account</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Join Date</span>
                        <span>{formatDate(stats.playerinfo.firstLogin)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Playtime</span>
                        <span>{stats.stats.playtime.pretty}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Rank</span>
                        <span style={{color: stats.playerinfo.rank.color}}>{stats.playerinfo.rank.id}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Detailed BedWars Stats */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle>BedWars Detailed Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Wins</span>
                      <span>{stats.stats.bedwars.wins}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Losses</span>
                      <span>{stats.stats.bedwars.losses}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Win Rate</span>
                      <span>{stats.stats.bedwars.winRate}%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Kills</span>
                      <span>{stats.stats.bedwars.kills}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Deaths</span>
                      <span>{stats.stats.bedwars.deaths}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">K/D Ratio</span>
                      <span>{stats.stats.bedwars.kdr.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
