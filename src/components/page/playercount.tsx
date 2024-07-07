import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function PlayerCount() {
  const [onlinePlayers, setOnlinePlayers] = useState(0);
  const [pingEnabled, setPingEnabled] = useState(true);

  useEffect(() => {
    fetch("https://api.mcsrvstat.us/3/onthepixel.net")
      .then((response) => response.json())
      .then((data) => {
        setOnlinePlayers(data.players.online);
        setPingEnabled(data.debug.ping);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  return (
    <div className="flex items-center space-x-4">
      <Link href="/">
        <Image src="/logo.png" width={40} height={40} alt="logo" />
      </Link>
      <span className={`relative flex h-3 w-3`}>
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
      </span>
      <p>
        Online players: <span>{onlinePlayers}</span>
      </p>
    </div>
  );
}
