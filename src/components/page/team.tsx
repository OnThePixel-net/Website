import React from "react";
import Image from "next/image";
import Link from "next/link";

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

async function getTeamMembers(): Promise<TeamMember[]> {
  try {
    const response = await fetch(
      "https://cms.onthepixel.net/items/Team?fields=*.*.*",
      { next: { revalidate: 300 } }
    );
    if (!response.ok) return [];
    const data = await response.json();
    return data.data || [];
  } catch {
    return [];
  }
}

export default async function Team() {
  const teamMembers = await getTeamMembers();

  const sortedMembers = [...teamMembers].sort((a, b) => {
    const priorityA = a.Ranks ? a.Ranks.Priority : 999;
    const priorityB = b.Ranks ? b.Ranks.Priority : 999;
    return priorityA - priorityB;
  });

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
                      src={`https://mcskin.me/api/pfp/${member.minecraft_username}.png?transparent=true`}
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

        <div className="mt-12 p-6 bg-white/10 rounded-lg border-l-4 border-green-500">
          <h2
            className="text-lg font-bold"
            style={{ color: "#00de6d", textShadow: "0 0 10px #00de6d" }}
          >
            Want to join the team?
          </h2>
          <p className="mt-2 text-gray-300">
            We&apos;re always looking for passionate people to help build OnThePixel.net.
          </p>
          <Link
            href="/apply"
            className="inline-block mt-4 px-5 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg transition-colors font-medium"
          >
            Apply now →
          </Link>
        </div>
      </div>
    </section>
  );
}
