"use client";

import styles from "./leaderboard.module.css";
import React, { useEffect, useState } from "react";
import TopPage from "@/components/page/top";

export default function BWLeaderboard() {
  interface Player {
    name: string;
    score: number;
    kills: number;
    deaths: number;
  }
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    fetch("https://api.onthepixel.net/leaderboard/bedwars")
      .then((response) => response.json())
      .then((data) => setPlayers(data.players))
      .catch((error) => console.error("Error fetching leaderboard:", error));
  }, []);

  return (
    <>
      <TopPage />
      <section className="bg-gray-950 pt-36">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-2xl font-bold mb-5">BEDWARS LEADERBOARD</h1>
          <table className="w-full overflow-hidden mt-5 rounded-[10px] border-collapse">
            <thead>
              <tr>
                <th className="text-left p-2.5 border-b-[#666666] border-b border-solid">
                  Rank
                </th>
                <th className="text-left p-2.5 border-b-[#666666] border-b border-solid">
                  Name
                </th>
                <th className="text-left p-2.5 border-b-[#666666] border-b border-solid">
                  Score
                </th>
                <th className="text-left p-2.5 border-b-[#666666] border-b border-solid">
                  Kills
                </th>
                <th className="text-left p-2.5 border-b-[#666666] border-b border-solid">
                  Deaths
                </th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, index) => (
                <tr className="even:bg-gray-800 hover:bg-gray-700" key={index}>
                  <td className="p-2.5 border-b-[#666666] border-b border-solid">
                    {index + 1}
                  </td>
                  <td className="p-2.5 border-b-[#666666] border-b border-solid">
                    {player.name}
                  </td>
                  <td className="p-2.5 border-b-[#666666] border-b border-solid">
                    {player.score}
                  </td>
                  <td className="p-2.5 border-b-[#666666] border-b border-solid">
                    {player.kills}
                  </td>
                  <td className="p-2.5 border-b-[#666666] border-b border-solid">
                    {player.deaths}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
