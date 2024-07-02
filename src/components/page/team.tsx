"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";

interface Member {
  id: string;
  minecraft_name: string;
  discord_name: string;
  role: string;
}

function Team() {
  const [teamMembers, setTeamMembers] = useState<Member[]>([]);

  const roleOrder = ["owner", "admin", "developer", "builder", "supporter"];

  const getRoleIndex = (role: string) => {
    const index = roleOrder.indexOf(role.toLowerCase());
    return index === -1 ? roleOrder.length : index;
  };

  const sortedTeamMembers = teamMembers.sort(
    (a, b) => getRoleIndex(a.role) - getRoleIndex(b.role)
  );
  useEffect(() => {
    fetch("https://pb.encryptopia.dev/api/collections/otp_team/records")
      .then((response) => response.json())
      .then((data) => setTeamMembers(data.items))
      .catch((error) => console.error("Error fetching team members:", error));
  }, []);

  useEffect(() => {
    const cacheKey = "teamMembersCache";
    const cacheExpiry = 24 * 60 * 60 * 1000;

    const fetchData = async () => {
      const response = await fetch(
        "https://pb.encryptopia.dev/api/collections/otp_team/records"
      );
      const data = await response.json();
      setTeamMembers(data.items);
      const cacheData = {
        items: data.items,
        timestamp: new Date().getTime(),
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    };

    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      const { items, timestamp } = JSON.parse(cachedData);
      const isCacheValid = new Date().getTime() - timestamp < cacheExpiry;
      if (isCacheValid) {
        setTeamMembers(items);
        return;
      }
    }
    fetchData().catch((error) =>
      console.error("Error fetching team members:", error)
    );
  }, []);

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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {sortedTeamMembers.map((member) => (
            <div
              key={member.id}
              className="bg-[#1e1e1e] p-6 m-1 rounded-md flex items-center hover:scale-105 transition-transform duration-300"
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
      </div>
    </section>
  );
}

export default Team;
