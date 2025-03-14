"use client";
import React, { useState, useEffect } from "react";
import TopPage from "@/components/page/top";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface PixelsPlayer {
  player_id: string;
  player_name: string;
  balance: number;
}

// No custom API response type needed as the API returns an array directly

export default function PixelsLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<PixelsPlayer[]>([]);
  // Title is static, no need to have it in state
  const title = "PIXELS LEADERBOARD";
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      // In production
      // The API already returns top 10 players sorted by pixels
      const response = await fetch("https://api.onthepixel.net/leaderbords/pixels/");
      const data = await response.json();
      
      // The API already returns data sorted by pixels
      setLeaderboard(data);
      

      setError(null);
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      setError("Failed to load leaderboard data. Please try again later.");
      
      // Fallback data for development
      setLeaderboard([
        {
          player_id: "8bb1037e-44d9-4c3e-9747-70eb8d1a6ae3",
          player_name: "DerDatenflieger",
          balance: 99980
        },
        {
          player_id: "47377dee-8e60-4414-a0a2-50bef2697063",
          player_name: "TinyBrickBoy",
          balance: 21
        },
        {
          player_id: "e48ecb89-a010-441d-bfdb-90df683d6566",
          player_name: "Schleim70",
          balance: 10
        },
        {
          player_id: "beb898b5-440f-41ba-a6f1-ee227a75308c",
          player_name: "OTPFan",
          balance: 0
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <TopPage />
      <section className="bg-gray-950 pt-36">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-2xl font-bold mb-5">PIXELS LEADERBOARD</h1>
          <p className="mb-8 text-gray-400">
            The richest players on OnThePixel.net. Earn Pixels by playing games and completing challenges!
          </p>
          
          <Card className="w-full bg-gray-900/50 border-gray-800">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Top 10 Pixel Rankings</CardTitle>
              <p className="text-gray-400">The richest players on OnThePixel.net ranked by their total Pixels.</p>
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
                        <th className="px-4 py-2 text-right">Pixels</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.length > 0 ? (
                        leaderboard.map((player, index) => (
                          <tr
                            key={player.player_id}
                            className="border-b border-gray-800 hover:bg-white/5 transition-colors"
                          >
                            <td className="px-4 py-3">
                              {(index + 1) <= 3 ? (
                                <Badge
                                  variant={
                                    (index + 1) === 1
                                      ? "default"
                                      : (index + 1) === 2
                                      ? "secondary"
                                      : "outline"
                                  }
                                  className={
                                    (index + 1) === 1
                                      ? "bg-yellow-500 text-black"
                                      : (index + 1) === 2
                                      ? "bg-gray-300 text-black"
                                      : "bg-amber-700 text-white"
                                  }
                                >
                                  {index + 1}
                                </Badge>
                              ) : (
                                index + 1
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage
                                    src={`https://minotar.net/helm/${player.player_name}`}
                                    alt={player.player_name}
                                  />
                                  <AvatarFallback>
                                    {player.player_name.slice(0, 2)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{player.player_name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right font-medium text-green-400">
                              {player.balance.toLocaleString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan={3}
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
