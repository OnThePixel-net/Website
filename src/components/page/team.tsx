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
  Ranks?: Rank;
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

  const sortedMembers = [...teamMembers].sort((a, b) => {
    const priorityA = a.Ranks ? a.Ranks.Priority : 999;
    const priorityB = b.Ranks ? b.Ranks.Priority : 999;
    return priorityA - priorityB;
  });

  if (loading) {
    return (
      <section className="py-10 px-4 bg-gray-950">
        <div className="container mx-auto px-4 py-10">
          <h1 id="team" className="text-3xl font-bold mb-4 text-white">
            TEAM
          </h1>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="m-1 flex items-center rounded-md bg-white/10 p-4 animate-pulse"
              >
                <div className="w-16 h-16 rounded-lg bg-white/20 shrink-0" />
                <div className="ml-4 space-y-2">
                  <div className="h-4 w-24 bg-white/20 rounded" />
                  <div className="h-3 w-16 bg-white/10 rounded" />
                </div>
              </div>
            ))}
          </div>
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
              const mainRank = member.Ranks;

              return (
                <div
                  key={index}
                  className="m-1 flex items-center rounded-md bg-white/10 p-4 transition-transform duration-300 hover:scale-105 hover:bg-white/15 gap-4"
                >
                  <div className="relative shrink-0 rounded-lg overflow-hidden">
                    <Image
                      alt={member.minecraft_username}
                      src={`https://mcwith.me/api/pfp/${member.minecraft_username}.png?transparent=true`}
                      width={64}
                      height={64}
                      className="rounded-lg object-cover"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="font-bold text-white truncate">{member.Name}</p>
                    {mainRank ? (
                      <p
                        className="text-sm font-semibold tracking-wide truncate"
                        style={{
                          color: mainRank.Color,
                          textShadow: `0 0 8px ${mainRank.Color}`,
                        }}
                      >
                        {mainRank.Name.toUpperCase()}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400">MEMBER</p>
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
