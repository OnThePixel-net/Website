"use client";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import TopPage from "@/components/page/top";
import Image from "next/image";

const StatisticsPage: React.FC = () => {
  const [username, setUsername] = useState("");
  interface Stats {
    playerinfo: {
      rank: {
        id: string;
      };
    };
    stats: {
      playtime: {
        pretty: string;
      };
    };
  }

  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const storedUsername = window.location.pathname.split("/").pop();
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  useEffect(() => {
    if (username) {
      fetch(`https://api.onthepixel.net/stats/${username}`)
        .then((response) => response.json())
        .then((data) => setStats(data))
        .catch((error) => console.error("Error fetching data:", error));

      const newUrl = `/stats/${username}`;
      window.history.pushState({ path: newUrl }, "", newUrl);
    }
  }, [username]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  return (
    <section className="bg-gray-950 h-screen">
      <TopPage />
      <div className="container mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-5">STATISTICS FOR {username}</h1>
        <Input
          type="text"
          value={username}
          onChange={handleInputChange}
          placeholder="Enter username"
          className="mb-5 w-80"
        />
        {stats && (
          <div>
            <div className="relative w-40 h-40 overflow-hidden rounded-lg shadow-lg bg-gray-600">
              <Image
                src={`https://vzge.me/full/400/${username}.png`}
                className="absolute left-0 right-0 m-auto translate-y-10 scale-110 bg-gray-600"
                alt={username}
                width={400}
                height={400}
              />
            </div>
            <div className="mt-4">
              <p>
                <strong>Rank:</strong> {stats.playerinfo.rank.id}
              </p>
              <p>
                <strong>Playtime:</strong> {stats.stats.playtime.pretty}
              </p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default StatisticsPage;
