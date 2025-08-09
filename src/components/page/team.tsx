import React, { useState, useEffect } from "react";
import Image from "next/image";

// Rolle Farben und Reihenfolge (du kannst diese anpassen)
const roleColors: { [key: string]: string } = {
  owner: "#ff6b6b",
  admin: "#4ecdc4", 
  builder: "#45b7d1",
  socialmanager: "#96ceb4",
  moderator: "#ffeaa7",
  helper: "#dda0dd",
  member: "#ffffff"
};

const roleOrder = [
  "OWNER",
  "ADMIN", 
  "SOCIALMANAGER",
  "BUILDER",
  "MODERATOR",
  "HELPER",
  "MEMBER"
];

const getRoleColor = (role: string) =>
  roleColors[role.toLowerCase()] || "#ffffff";

interface APITeamMember {
  minecraft_username: string;
  Name: string;
  Rank: string;
}

interface TeamMember {
  id: number;
  minecraft_name: string;
  discord_name: string;
  role: string;
}

const sortTeamMembers = (members: TeamMember[]): TeamMember[] => {
  return members.sort(
    (a, b) => roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role),
  );
};

const Team = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://cms.onthepixel.net/items/Team');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const apiData = await response.json();
        
        // Konvertierung der API-Daten in das erwartete Format
        const convertedMembers: TeamMember[] = apiData.data.map((member: APITeamMember, index: number) => ({
          id: index + 1,
          minecraft_name: member.minecraft_username,
          discord_name: member.Name,
          role: member.Rank
        }));
        
        setTeamMembers(convertedMembers);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
        console.error('Fehler beim Laden der Team-Daten:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  const sortedMembers = sortTeamMembers([...teamMembers]);

  if (loading) {
    return (
      <section className="bg-gray-950 px-4 py-10">
        <div className="container mx-auto px-4 py-10">
          <h1 id="team" className="mb-4 text-3xl font-bold text-white">
            TEAM
          </h1>
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            <p className="ml-4 text-white">Lade Team-Mitglieder...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-gray-950 px-4 py-10">
        <div className="container mx-auto px-4 py-10">
          <h1 id="team" className="mb-4 text-3xl font-bold text-white">
            TEAM
          </h1>
          <div className="text-center text-red-400">
            <p>Fehler beim Laden der Team-Daten: {error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-950 px-4 py-10">
      <div className="container mx-auto px-4 py-10">
        <h1 id="team" className="mb-4 text-3xl font-bold text-white">
          TEAM
        </h1>
        {sortedMembers.length === 0 ? (
          <p className="text-center text-white">Keine Team-Mitglieder gefunden.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {sortedMembers.map((member) => (
              <div
                key={member.id}
                className="m-1 flex items-center rounded-md bg-white/10 p-6 transition-transform duration-300 hover:scale-105"
              >
                <Image
                  alt={member.minecraft_name}
                  src={`https://minotar.net/helm/${member.minecraft_name}`}
                  width={40}
                  height={40}
                  className="rounded"
                />
                <div className="ml-4">
                  <p className="font-bold text-white">{member.discord_name}</p>
                  <p
                    className="text-sm font-medium"
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
