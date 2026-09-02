import React, { useState, useEffect } from "react";
import { LocaleLink } from "@/components/LocaleLink";
import Image from "next/image";
import { useTranslations } from "@/lib/i18n/LanguageProvider";

export default function PlayerCount() {
  const t = useTranslations();
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
      <LocaleLink href="/">
        <Image
          src="/bf6cf0de-bf69-44d1-b107-6ad846ab7c9e"
          width={40}
          height={40}
          sizes="40px"
          alt="OnThePixel.net"
        />
      </LocaleLink>
      <span className={`relative flex h-3 w-3`}>
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500"></span>
      </span>
      <p>
        {t.playercount.online}: <span>{onlinePlayers}</span>
      </p>
    </div>
  );
}
