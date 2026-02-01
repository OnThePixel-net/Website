"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
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
  Minecarft_username: string;
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

interface LiveStatus {
  isLive: boolean;
  platform?: string;
  title?: string;
  viewers?: number;
}

const formatFollowers = (count: number): string => {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
};

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
  const [liveStatus, setLiveStatus] = useState<Map<string, LiveStatus>>(new Map());
  const [loadingFollowers, setLoadingFollowers] = useState(true);
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
        
        fetchAllFollowers(creatorsList);
        fetchAllLiveStatus(creatorsList);
      } catch (error) {
        console.error("Error fetching creators:", error);
        setCreators([]);
      } finally {
        setLoading(false);
      }
    }
    fetchCreators();

    // Live-Status alle 60 Sekunden aktualisieren
    const liveInterval = setInterval(() => {
      if (creators.length > 0) {
        fetchAllLiveStatus(creators);
      }
    }, 60000);

    return () => clearInterval(liveInterval);
  }, []);

  async function fetchAllFollowers(creatorsList: Creator[]) {
    const followersMap = new Map<string, number>();
    
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
    setLoadingFollowers(false);
  }

  async function fetchAllLiveStatus(creatorsList: Creator[]) {
    const liveMap = new Map<string, LiveStatus>();
    
    await Promise.all(
      creatorsList.map(async (creator) => {
        try {
          const response = await fetch(
            `https://api.onthepixel.net/creators/live/${creator.Name}`
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.data) {
              liveMap.set(creator.Name, {
                isLive: data.data.isLive || false,
                platform: data.data.platform,
                title: data.data.title,
                viewers: data.data.viewers
              });
            } else {
              liveMap.set(creator.Name, { isLive: false });
            }
          }
        } catch (error) {
          console.error(`Error fetching live status for ${creator.Name}:`, error);
          liveMap.set(creator.Name, { isLive: false });
        }
      })
    );
    
    setLiveStatus(liveMap);
  }

  // Sortiere Creators nach Live-Status und dann nach Follower-Anzahl
  const sortedCreators = [...creators].sort((a, b) => {
    const liveA = liveStatus.get(a.Name)?.isLive ? 1 : 0;
    const liveB = liveStatus.get(b.Name)?.isLive ? 1 : 0;
    
    // Erst nach Live-Status sortieren (Live zuerst)
    if (liveB !== liveA) {
      return liveB - liveA;
    }
    
    // Dann nach Follower-Anzahl
    const followersA = followersData.get(a.Name) || 0;
    const followersB = followersData.get(b.Name) || 0;
    return followersB - followersA;
  });

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
        {sortedCreators.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {sortedCreators.map((creator, index) => {
              const followerCount = followersData.get(creator.Name);
              const live = liveStatus.get(creator.Name);
              
              return (
                <div
                  key={index}
                  className="m-1 flex flex-col rounded-md bg-white/10 p-6 transition-transform duration-300 hover:scale-105 relative"
                >
                  {/* Live Badge */}
                  {live?.isLive && (
                    <div className="absolute top-3 right-3 flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                      <span className="w-2 h-2 bg-white rounded-full"></span>
                      LIVE
                    </div>
                  )}

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
                      {live?.isLive && live.platform && (
                        <p className="text-xs text-red-400 mt-1">
                          {live.platform.toUpperCase()}
                          {live.viewers && ` • ${formatFollowers(live.viewers)} watching`}
                        </p>
                      )}
                    </div>
                    
                    {/* Follower Count */}
                    <div className="text-right">
                      {loadingFollowers ? (
                        <div className="animate-pulse">
                          <div className="h-6 w-12 bg-gray-700 rounded mb-1"></div>
                          <div className="h-3 w-16 bg-gray-700 rounded"></div>
                        </div>
                      ) : followerCount !== undefined ? (
                        <>
                          <p className="text-lg font-bold text-white">
                            {formatFollowers(followerCount)}
                          </p>
                          <p className="text-xs text-gray-400">Followers</p>
                        </>
                      ) : null}
                    </div>
                  </div>
                  
                  {/* Live Stream Title */}
                  {live?.isLive && live.title && (
                    <div className="mb-3 pb-3 border-b border-white/10">
                      <p className="text-sm text-gray-300 line-clamp-2">
                        {live.title}
                      </p>
                    </div>
                  )}

                  {/* Platform Icons */}
                  {creator.Platforms && creator.Platforms.length > 0 && (
                    <div className="flex flex-wrap gap-3 mt-auto">
                      {creator.Platforms.map((platform, platformIndex) => (
                        <Link
                          key={platformIndex}
                          href={platform.Link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 rounded-md bg-white/5 hover:bg-white/20 transition-colors duration-200"
                          title={`${creator.Name} auf ${platform.Icons}`}
                        >
                          {getIconComponent(platform.Icons)}
                        </Link>
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
