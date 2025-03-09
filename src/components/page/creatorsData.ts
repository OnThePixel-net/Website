export interface Creator {
  id: number;
  name: string;
  minecraftName: string;
  description: string;
  platforms: {
    youtube?: string;
    twitch?: string;
    tiktok?: string;
    instagram?: string;
    twitter?: string;
    discord?: string;
    website?: string;
  };
}

export const creators: Creator[] = [
  {
    id: 1,
    name: "Loxxler",
    minecraftName: "Loxxgamer",
    description: "Ich bin ein kleiner (aber feiner) Twitch Streamer, und mache zudem auch Tiktok und Youtube! Ich hoffe ihr habt viel Spaß mit meinen Videos und auch mit dem, was in der Zukunft noch kommt :D",
    platforms: {
      twitch: "https://www.twitch.tv/loxxler",
      youtube: "https://www.youtube.com/@Loxxler",
      tiktok: "https://tiktok.com/@loxxler",
      twitter: "https://x.com/Loxxler",
      instagram: "https://www.instagram.com/loxxler/",
      discord: "https://discord.gg/vRR9tamURT",
      website: "https://loxxler.de"
    }
  },
  {
    id: 2,
    name: "Sanherib",
    minecraftName: "Sanherib",
    description: "Yo ich bin Sahne! Ich streame daily(zurzeit nicht) Minecraft und anderes.",
    platforms: {
      twitch: "https://www.twitch.tv/sanheriblive",
      tiktok: "https://www.tiktok.com/@sanheribyt",
      discord: "https://discord.gg/XY79Zpy6V4",
      website: "https://Sanherib.de"
    }
  },
  {
    id: 3,
    name: "CE_Gunner",
    minecraftName: "CE_Gunner",
    description: "Platzhalter, imagine ich hätte hier ne richtige Bio (hab ich nirgends).",
    platforms: {
      twitch: "https://www.twitch.tv/ce_gunner",
      youtube: "https://www.youtube.com/@CE_Gunner",
      tiktok: "https://www.tiktok.com/@ce_gunner",
      twitter: "https://x.com/ce_gunner",
      instagram: "https://www.instagram.com/cegunner/",
      discord: "https://discord.gg/eTfBJZKb9v",
      website: "https://cegunner.de"
    }
  },
  {
    id: 4,
    name: "PatchNote",
    minecraftName: "Smart_PatchNote",
    description: "Nett hier, aber waren sie schon mal Ausgemistet?",
    platforms: {
      youtube: "https://www.youtube.com/@El_PatchNote",
      twitch: "https://www.twitch.tv/patchnote",
      tiktok: "https://www.tiktok.com/@patchnoteyt",
      twitter: "https://x.com/ElPatchNote",
      discord: "https://discord.gg/cmM78zp8zn"
    }
  },
  {
    id: 5,
    name: "IceBook",
    minecraftName: "icebook_",
    description: "",
    platforms: {
      twitch: "https://www.twitch.tv/icebook_",
      tiktok: "https://www.tiktok.com/@icebook6",
      discord: "https://discord.gg/hS7dXYuYAZ",
      website: "https://c.otp.cx/icebook"
    }
  },
  {
    id: 6,
    name: "Schleim",
    minecraftName: "Schleim70",
    description: "Yoooo wassup? Bin Louis und spiele gerne Osu!, IdleOn und Minecraft :3",
    platforms: {
      twitch: "https://twitch.tv/Schleim70",
      youtube: "https://youtube.com/@schleim70",
      tiktok: "https://tiktok.com/@slimey_70",
      website: "https://c.otp.cx/schleim"
    }
  }
];
