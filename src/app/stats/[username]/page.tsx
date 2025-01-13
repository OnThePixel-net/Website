"use client";
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import TopPage from "@/components/page/top";
import Image from "next/image";
import { Card } from "@/components/ui/card";

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedUsername = window.location.pathname.split("/").pop();
    if (storedUsername && storedUsername !== "stats") {
      setUsername(storedUsername);
    }
  }, []);

  useEffect(() => {
    if (username) {
      fetch(`https://api.onthepixel.net/stats/${username}`)
        .then((response) => response.json())
        .then((data) => {
          if (data.error) {
            setError(data.error);
            setStats(null);
          } else {
            setError(null);
            setStats(data);
          }
        })
        .catch((error) => {
          console.error("Error fetching data:", error);
          setError("Error fetching data");
          setStats(null);
        });

      const newUrl = `/stats/${username}`;
      window.history.pushState({ path: newUrl }, "", newUrl);
    }
  }, [username]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(event.target.value);
  };

  return (
    <section className="h-screen bg-gray-950">
      <TopPage />
      <div className="container mx-auto px-4 py-10">
        <h1 className="mb-5 text-2xl font-bold">STATISTICS FOR {username}</h1>
        <Input
          type="text"
          value={username}
          onChange={handleInputChange}
          placeholder="Enter username"
          className="mb-5 w-80"
        />
        {error && <p className="text-red-500">{error}</p>}
        {stats && (
          <Card>
            <div className="flex flex-col lg:flex-row lg:items-center">
              <div className="relative my-4 ml-4 h-40 w-40 overflow-hidden rounded-lg border-green-600 bg-gray-600 shadow-lg">
                <Image
                  src={`https://vzge.me/full/400/${username}.png`}
                  className="absolute left-0 right-0 m-auto translate-y-10 scale-110 bg-gray-600"
                  alt={username}
                  width={400}
                  height={400}
                />
              </div>
              <div className="ml-2 mt-4 lg:ml-4 lg:mt-0">
                <p>
                  <strong>Rank:</strong> {stats.playerinfo.rank.id}
                </p>
                <p>
                  <strong>Playtime:</strong> {stats.stats.playtime.pretty}
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </section>
  );
};

export default StatisticsPage;
