"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { 
  FaYoutube, 
  FaTwitch, 
  FaInstagram, 
  FaTwitter, 
  FaDiscord,
  FaTiktok,
  FaWhatsapp,
  FaGlobe,
} from "react-icons/fa";

interface Platform {
  Icons: string;
  Link: string;
}

interface Creator {
  Minecarft_username: string; // Typo in der API beibehalten
  Name: string;
  Platforms: Platform[];
}

interface FollowerData {
  success: boolean;
  data?: {
    social: {
      platform: string;
      followers?: number;
      subscribers?: number;
    };
  };
}

// Funktion zum Formatieren der Follower-Zahlen
const formatFollowers = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

// Icon-Mapping für die verschiedenen Plattformen
const getIconComponent = (iconName: string) => {
  const iconProps = { size: 18, className: "hover:scale-110 transition-transform duration-200" };
  
  switch (iconName.toLowerCase()) {
    case 'youtube':
      return <FaYoutube {...iconProps} className={`${iconProps.className} text-red-500`} />;
    case 'twitch':
      return <FaTwitch {...iconProps} className={`${iconProps.className} text-purple-500`} />;
    case 'instagram':
      return <FaInstagram {...iconProps} className={`${iconProps.className} text-pink-500`} />;
    case 'x_twitter':
    case 'twitter':
      return <FaTwitter {...iconProps} className={`${iconProps.className} text-blue-400`} />;
    case 'whatsapp':
      return <FaWhatsapp {...iconProps} className={`${iconProps.className} text-green-400`} />;
    case 'discord':
      return <FaDiscord {...iconProps} className={`${iconProps.className} text-indigo-500`} />;
    case 'tiktok':
      return <FaTiktok {...iconProps} className={`${iconProps.className} text-black`} />;
    default:
      return <FaGlobe {...iconProps} className={`${iconProps.className} text-gray-400`} />;
  }
};

export default function Creators() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [followersData, setFollowersData] = useState<Map<string, number>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCreators() {
      try {
        const response = await fetch(
          "https://cms.onthepixel.net/items/Creators?fields=*.*.*"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch creators");
        }
        const data = await response.json();
        const creatorsList = data.data || [];
        setCreators(creatorsList);
        
        // Follower-Daten für jeden Creator abrufen
        fetchAllFollowers(creatorsList);
      } catch (error) {
        console.error("Error fetching creators:", error);
        setCreators([]);
      } finally {
        setLoading(false);
      }
    }
    fetchCreators();
  }, []);

  async function fetchAllFollowers(creatorsList: Creator[]) {
    const followersMap = new Map<string, number>();
    
    // Parallel alle Follower-Daten abrufen
    await Promise.all(
      creatorsList.map(async (creator) => {
        try {
          const response = await fetch(
            `https://api.onthepixel.net/creators/followers/${creator.Name}`
          );
          
          if (response.ok) {
            const data: FollowerData = await response.json();
            if (data.success && data.data?.social) {
              const count = data.data.social.followers || data.data.social.subscribers || 0;
              followersMap.set(creator.Name, count);
            }
          }
        } catch (error) {
          console.error(`Error fetching followers for ${creator.Name}:`, error);
        }
      })
    );
    
    setFollowersData(followersMap);
  }

  if (loading) {
    return (
      <section className="py-10 px-4 bg-gray-950">
        <div className="container mx-auto px-4 py-10">
          <h1 id="creators" className="text-3xl font-bold mb-4 text-white">
            CREATORS
          </h1>
          <div className="text-gray-400">Loading...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 px-4 bg-gray-950">
      <div className="container mx-auto px-4 py-10">
        <h1 id="creators" className="text-3xl font-bold mb-4 text-white">
          CREATORS
        </h1>
        {creators.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {creators.map((creator, index) => {
              const followerCount = followersData.get(creator.Name);
              
              return (
                <div
                  key={index}
                  className="m-1 flex flex-col rounded-md bg-white/10 p-6 transition-transform duration-300 hover:scale-105"
                >
                  <div className="flex items-center mb-4">
                    <Image
                      alt={creator.Minecarft_username}
                      src={`https://vzge.me/face/512/${creator.Minecarft_username}.png`}
                      width={40}
                      height={40}
                      className="rounded"
                    />
                    <div className="ml-4 flex-1">
                      <p className="font-bold text-white">{creator.Name}</p>
                      <p className="text-sm text-gray-400">CREATOR</p>
                    </div>
                    
                    {/* Follower Count */}
                    {followerCount !== undefined && (
                      <div className="text-right">
                        <p className="text-lg font-bold text-white">
                          {formatFollowers(followerCount)}
                        </p>
                        <p className="text-xs text-gray-400">Followers</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Platform Icons */}
                  {creator.Platforms && creator.Platforms.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-auto">
                      {creator.Platforms.map((platform, platformIndex) => (
                        
                          key={platformIndex}
                          href={platform.Link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-md bg-white/5 hover:bg-white/20 transition-colors duration-200"
                          title={`${creator.Name} auf ${platform.Icons}`}
                        >
                          {getIconComponent(platform.Icons)}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-gray-400">No creators available.</div>
        )}
      </div>
    </section>
  );
}
