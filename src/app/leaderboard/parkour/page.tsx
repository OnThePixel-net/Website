"use client";

import React, { useEffect, useState } from "react";

export default function ParkourLeaderboard() {
  interface Player {
    name: string;
    score: number;
  }

  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    fetch("https://api.onthepixel.net/leaderboard/parkour")
      .then((response) => response.json())
      .then((data) => setPlayers(data.players))
      .catch((error) => console.error("Error fetching leaderboard:", error));
  }, []);

  return (
    <section className="bg-gray-950 pt-36">
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-5">PARKOUR LEADERBOARD</h1>
        <table className="w-full overflow-hidden mt-5 rounded-[10px] border-collapse">
          <thead>
            <tr className="even:bg-gray-800 hover:bg-gray-700">
              <th className="text-left p-2.5 border-b-[#666666] border-b border-solid">
                Rank
              </th>
              <th className="text-left p-2.5 border-b-[#666666] border-b border-solid">
                Name
              </th>
              <th className="text-left p-2.5 border-b-[#666666] border-b border-solid">
                Score
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
