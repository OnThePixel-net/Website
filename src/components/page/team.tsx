"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";

const Team = () => {
  interface TeamMember {
    id: string;
    minecraft_name: string;
    discord_name: string;
    role: string;
  }

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await fetch("/api/team");
        const data = await response.json();
        setTeamMembers(data);
      } catch (error) {
        console.error("Failed to fetch team members", error);
      }
    };

    fetchTeamMembers();
  }, []);

  const roleOrder = ["owner", "admin", "developer", "builder", "supporter"];

  const roleColors: { [key: string]: string } = {
    owner: "#f1c40f",
    admin: "#ff505e",
    developer: "#5ac2de",
    builder: "#00de6d",
    supporter: "#a1101a",
  };

  const getRoleColor = (role: string) =>
    roleColors[role.toLowerCase()] || "#ffffff";

  return (
    <section className="py-10 px-4 bg-gray-950">
      <div className="container mx-auto px-4 py-10">
        <h1 id="team" className="text-3xl font-bold mb-4">
          TEAM
        </h1>
        {teamMembers.length === 0 ? (
          <p className="text-center text-white">No team members found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                className="bg-white/10 p-6 m-1 rounded-md flex items-center hover:scale-105 transition-transform duration-300"
              >
                <Image
                  alt={member.minecraft_name}
                  src={`https://minotar.net/helm/${member.minecraft_name}`}
                  width={40}
                  height={40}
                />
                <div className="ml-4">
                  <p className="font-bold">{member.discord_name}</p>
                  <p
                    className="text-sm"
                    style={{
                      color: getRoleColor(member.role),
                      textShadow: `0 0 10px ${getRoleColor(member.role)}`,
                    }}
                  >
                    {member.role.toUpperCase()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default Team;
