import React from "react";
import Image from "next/image";
import Link from "next/link";
import TopPage from "@/components/page/top";

// Define creator interface
interface Creator {
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

// Sample creators data
const creators: Creator[] = [
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
    name: "IceBook",
    minecraftName: "icebook_",
    description: "",
    platforms: {
      twitch: "https://www.twitch.tv/icebook_",
      tiktok: "https://www.tiktok.com/@icebook6",
      discord: "https://discord.gg/hS7dXYuYAZ",
      website: "https://c.otp.cx/icebook"
    }
  }
];

// Icons for social platforms
import { FaYoutube, FaTwitch, FaTiktok, FaInstagram, FaDiscord, FaGlobe } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export default function Creators() {
  return (
    <>
      <TopPage />
      <section className="bg-gray-950 pt-36">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-2xl font-bold mb-5">CREATORS</h1>
          <p className="mb-8">
            Check out these amazing content creators who play and stream on OnThePixel.net. 
            Support them by following their channels and watching their content!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {creators.map((creator) => (
              <div 
                key={creator.id} 
                className="bg-white/5 rounded-lg overflow-hidden transition-transform hover:scale-105 duration-300"
              >
                <div className="p-5">
                  <div className="flex items-center mb-4">
                    <div className="relative w-16 h-16 overflow-hidden rounded-full bg-gray-600 border-2 border-green-500">
                      <Image
                        src={`https://minotar.net/helm/${creator.minecraftName}`}
                        alt={creator.name}
                        width={64}
                        height={64}
                        className="object-cover"
                      />
                    </div>
                    <div className="ml-4">
                      <h2 className="text-xl font-bold">{creator.name}</h2>
                      <p className="text-sm text-gray-400">{creator.minecraftName}</p>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-300 mb-4">{creator.description}</p>
                  
                  <div className="flex space-x-3">
                    {creator.platforms.youtube && (
                      <Link 
                        href={creator.platforms.youtube} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        aria-label={`${creator.name} YouTube Channel`}
                      >
                        <FaYoutube size={24} />
                      </Link>
                    )}
                    
                    {creator.platforms.twitch && (
                      <Link 
                        href={creator.platforms.twitch} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-purple-500 transition-colors"
                        aria-label={`${creator.name} Twitch Channel`}
                      >
                        <FaTwitch size={24} />
                      </Link>
                    )}
                    
                    {creator.platforms.tiktok && (
                      <Link 
                        href={creator.platforms.tiktok} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-400 transition-colors"
                        aria-label={`${creator.name} TikTok`}
                      >
                        <FaTiktok size={24} />
                      </Link>
                    )}
                    
                    {creator.platforms.instagram && (
                      <Link 
                        href={creator.platforms.instagram} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-pink-500 transition-colors"
                        aria-label={`${creator.name} Instagram`}
                      >
                        <FaInstagram size={24} />
                      </Link>
                    )}
                    
                    {creator.platforms.twitter && (
                      <Link 
                        href={creator.platforms.twitter} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-500 transition-colors"
                        aria-label={`${creator.name} Twitter`}
                      >
                        <FaXTwitter size={24} />
                      </Link>
                    )}
                    
                    {creator.platforms.discord && (
                      <Link 
                        href={creator.platforms.discord} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-blue-500 transition-colors"
                        aria-label={`${creator.name} Discord`}
                      >
                        <FaDiscord size={24} />
                      </Link>
                    )}
                    
                    {creator.platforms.website && (
                      <Link 
                        href={creator.platforms.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-green-500 transition-colors"
                        aria-label={`${creator.name} Website`}
                      >
                        <FaGlobe size={24} />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-12 p-6 bg-white/10 rounded-lg border-l-4 border-green-500">
            <h2 
              className="text-lg font-bold text-green-500" 
              style={{ color: "#00de6d", textShadow: "0 0 10px #00de6d" }}
            >
              Become a Featured Creator
            </h2>
            <p className="mt-2">
              Are you a content creator who plays on OnThePixel.net? We'd love to feature you on this page!
              Join our Discord server and open a ticket to apply for the Creator program.
            </p>
            <div className="mt-4">
              <Link 
                href="https://discord.com/invite/Dpx3eK9t3z" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                Join Our Discord
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
