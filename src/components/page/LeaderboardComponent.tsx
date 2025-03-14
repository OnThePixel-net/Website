"use client";
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface LeaderboardItem {
  position: number;
  username: string;
  score: number;
  stats: {
    [key: string]: number | string;
  };
}

interface LeaderboardProps {
  title: string;
  description: string;
  endpoint: string;
  statColumns: {
    key: string;
    label: string;
  }[];
}

export default function LeaderboardComponent({
  title,
  description,
  endpoint,
  statColumns,
}: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      // In production, replace with actual API call
      // const response = await fetch(`https://api.onthepixel.net/${endpoint}`);
      // const data = await response.json();
      
      // For now, generate top 10 dummy data
      const dummyData = Array.from({ length: 10 }, (_, i) => ({
        position: i + 1,
        username: `Player${i + 1}`,
        score: Math.floor(10000 / (i + 1)),
        stats: statColumns.reduce((acc, column) => {
          acc[column.key] = 
            column.key === "kdr" 
              ? (Math.random() * 3 + 0.5).toFixed(2) 
              : column.key === "winRate" 
                ? `${Math.floor(Math.random() * 100)}%` 
                : Math.floor(Math.random() * 1000);
          return acc;
        }, {} as { [key: string]: number | string }),
      }));
      
      setLeaderboard(dummyData);
      setError(null);
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      setError("Failed to load leaderboard data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full bg-gray-900/50 border-gray-800">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        <p className="text-gray-400">{description}</p>
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
                  <th className="px-4 py-2 text-right">Score</th>
                  {statColumns.map((column) => (
                    <th key={column.key} className="px-4 py-2 text-right">
                      {column.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((item) => (
                  <tr
                    key={item.position}
                    className="border-b border-gray-800 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-3">
                      {item.position <= 3 ? (
                        <Badge
                          variant={
                            item.position === 1
                              ? "default"
                              : item.position === 2
                              ? "secondary"
                              : "outline"
                          }
                          className={
                            item.position === 1
                              ? "bg-yellow-500 text-black"
                              : item.position === 2
                              ? "bg-gray-300 text-black"
                              : "bg-amber-700 text-white"
                          }
                        >
                          {item.position}
                        </Badge>
                      ) : (
                        item.position
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={`https://minotar.net/helm/${item.username}`}
                            alt={item.username}
                          />
                          <AvatarFallback>
                            {item.username.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{item.username}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-green-400">
                      {item.score.toLocaleString()}
                    </td>
                    {statColumns.map((column) => (
                      <td
                        key={column.key}
                        className="px-4 py-3 text-right"
                      >
                        {item.stats[column.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
