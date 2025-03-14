"use client";
import React, { useState, useEffect } from "react";
import TopPage from "@/components/page/top";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface DuelsPlayer {
  rank: number;
  uuid: string;
  name: string;
  wins: number;
  losses: number;
  total_games: number;
  win_rate: string;
  kd_ratio: string;
}

interface ApiResponse {
  title: string;
  data: DuelsPlayer[];
}

export default function DuelsLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<DuelsPlayer[]>([]);
  const [title, setTitle] = useState<string>("DUELS LEADERBOARD");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      // In production
      const response = await fetch("https://api.onthepixel.net/leaderbords/duels/wins");
      const data: ApiResponse = await response.json();
      
      setLeaderboard(data.data);
      setTitle(data.title);
      setError(null);
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      setError("Failed to load leaderboard data. Please try again later.");
      
      // Fallback data for development
      setLeaderboard([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <TopPage />
      <section className="bg-gray-950 pt-36">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-2xl font-bold mb-5">DUELS LEADERBOARD</h1>
          <p className="mb-8 text-gray-400">
            The best duelists on OnThePixel.net, ranked by wins. Challenge yourself to reach the top!
          </p>
          
          <Card className="w-full bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">{title}</CardTitle>
              <p className="text-gray-400">Players are ranked based on their total wins in Duels matches.</p>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                </div>
              ) : error ? (
                <div className="text-center text-red-500 p-4">{error}</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-800">
                        <th className="px-4 py-2 text-left">#</th>
                        <th className="px-4 py-2 text-left">Player</th>
                        <th className="px-4 py-2 text-right">Wins</th>
                        <th className="px-4 py-2 text-right">Losses</th>
                        <th className="px-4 py-2 text-right">Total Games</th>
                        <th className="px-4 py-2 text-right">Win Rate</th>
                        <th className="px-4 py-2 text-right">K/D Ratio</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.length > 0 ? (
                        leaderboard.map((player) => (
                          <tr
                            key={player.uuid}
                            className="border-b border-gray-800 hover:bg-white/5 transition-colors"
                          >
                            <td className="px-4 py-3">
                              {player.rank <= 3 ? (
                                <Badge
                                  variant={
                                    player.rank === 1
                                      ? "default"
                                      : player.rank === 2
                                      ? "secondary"
                                      : "outline"
                                  }
                                  className={
                                    player.rank === 1
                                      ? "bg-yellow-500 text-black"
                                      : player.rank === 2
                                      ? "bg-gray-300 text-black"
                                      : "bg-amber-700 text-white"
                                  }
                                >
                                  {player.rank}
                                </Badge>
                              ) : (
                                player.rank
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage
                                    src={`https://minotar.net/helm/${player.name}`}
                                    alt={player.name}
                                  />
                                  <AvatarFallback>
                                    {player.name.slice(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{player.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-green-400">
                              {player.wins}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {player.losses}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {player.total_games}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {player.win_rate}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {player.kd_ratio}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-4 py-8 text-center text-gray-400"
                          >
                            No players found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
