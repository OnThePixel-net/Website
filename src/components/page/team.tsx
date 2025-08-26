"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";

interface Rank {
  uuid: string;
  Name: string;
  Color: string;
  Discord_role_id: string;
  Priority: number;
}

interface TeamMember {
  minecraft_username: string;
  Name: string;
  Ranks?: Rank[]; // jetzt als Array, da ein Spieler mehrere Ränge haben kann
}

export default function Team() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTeam() {
      try {
        const response = await fetch(
          "https://cms.onthepixel.net/items/Team?fields=*.*.*"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch team");
        }

        const data = await response.json();
        setTeamMembers(data.data || []);
      } catch (error) {
        console.error("Error fetching team:", error);
        setTeamMembers([]);
      } finally {
        setLoading(false);
      }
    }

    fetchTeam();
  }, []);

  // Sortierung: höchster Rang nach Priority
  const sortedMembers = [...teamMembers].sort((a, b) => {
    const priorityA = a.Ranks && a.Ranks.length > 0 ? a.Ranks[0].Priority : 999;
    const priorityB = b.Ranks && b.Ranks.length > 0 ? b.Ranks[0].Priority : 999;
    return priorityA - priorityB;
  });

  if (loading) {
    return (
      <section className="py-10 px-4 bg-gray-950">
        <div className="container mx-auto px-4 py-10">
          <h1 id="team" className="text-3xl font-bold mb-4 text-white">
            TEAM
          </h1>
          <div className="text-gray-400">Loading...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 px-4 bg-gray-950">
      <div className="container mx-auto px-4 py-10">
        <h1 id="team" className="text-3xl font-bold mb-4 text-white">
          TEAM
        </h1>
        {sortedMembers.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {sortedMembers.map((member, index) => {
              const ranks = member.Ranks || [];
              const mainRank = ranks.length > 0 ? ranks[0] : null;

              return (
                <div
                  key={index}
                  className="m-1 flex items-center rounded-md bg-white/10 p-6 transition-transform duration-300 hover:scale-105"
                >
                  <Image
                    alt={member.minecraft_username}
                    src={`https://vzge.me/face/512/${member.minecraft_username}.png`}
                    width={40}
                    height={40}
                    className="rounded"
                  />
                  <div className="ml-4">
                    <p className="font-bold text-white">{member.Name}</p>
                    {mainRank ? (
                      <p
                        className="text-sm font-medium"
                        style={{
                          color: mainRank.Color,
                          textShadow: `0 0 10px ${mainRank.Color}`,
                        }}
                      >
                        {mainRank.Name.toUpperCase()}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400">UNRANKED</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-gray-400">No team members available.</div>
        )}
      </div>
    </section>
  );
}
