"use client";

import React, { useEffect, useState } from "react";
import TopPage from "@/components/page/top";
import Image from "next/image";
import Link from "next/link";

export default function PointsLeaderboard() {
  interface Player {
    name: string;
    points: number;
    uuid: string;
  }

  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    fetch("https://api.onthepixel.net/leaderboard/points")
      .then((response) => response.json())
      .then((data) => setPlayers(data.players))
      .catch((error) => console.error("Error fetching leaderboard:", error));
  }, []);

  return (
    <div className="min-h-screen">
      <TopPage />
      <section className="bg-gray-950 pt-36">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-2xl font-bold mb-5">POINTS LEADERBOARD</h1>
          <table className="w-full overflow-hidden mt-5 rounded-[10px] border-collapse">
            <thead>
              <tr className="even:bg-gray-800">
                <th className="text-left p-2.5 border-b-[#666666] border-b border-solid">
                  Rank
                </th>
                <th className="text-left p-2.5 border-b-[#666666] border-b border-solid">
                  Name
                </th>
                <th className="text-left p-2.5 border-b-[#666666] border-b border-solid">
                  Points
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
                    <td className="p-2.5 border-b-[#666666] flex items-center">
                      <Image
                        alt={player.uuid}
                        src={`https://minotar.net/helm/${player.name}/25`}
                        width={25}
                        height={25}
                        className="mr-2"
                      />
                      <Link
                        className="underline"
                        href={`https://laby.net/@${player.name}`}
                      >
                        {player.name}
                      </Link>
                    </td>
                  </td>
                  <td className="p-2.5 border-b-[#666666] border-b border-solid">
                    {player.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
