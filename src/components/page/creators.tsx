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

// Funktion um Twitch/YouTube Embed URL zu erstellen
const getStreamEmbedUrl = (creator: Creator, live: LiveStatus) => {
  if (!live.isLive || !creator.Platforms || creator.Platforms.length === 0) return null;
  
  const firstPlatform = creator.Platforms[0];
  const platformType = firstPlatform.Icons.toLowerCase();
  
  if (platformType === 'twitch') {
    const match = firstPlatform.Link.match(/twitch\.tv\/([^\/\?]+)/i);
    if (match) {
      return `https://player.twitch.tv/?channel=${match[1]}&parent=${window.location.hostname}`;
    }
  } else if (platformType === 'youtube') {
    // YouTube Live Embed würde die Video ID benötigen
    // Diese müsste von der API zurückgegeben werden
    return null;
  }
  
  return null;
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

  // Creators in Live und nach Followern sortiert aufteilen
  const liveCreators = creators.filter(creator => 
    liveStatus.get(creator.Name)?.isLive
  ).sort((a, b) => {
    const followersA = followersData.get(a.Name) || 0;
    const followersB = followersData.get(b.Name) || 0;
    return followersB - followersA;
  });

  const sortedCreators = [...creators].sort((a, b) => {
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
        <h1 id="creators" className="text-3xl font-bold mb-8 text-white">
          CREATORS
        </h1>

        {/* Live Stream Preview Section */}
        {liveCreators.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-full text-sm font-bold">
                <span className="w-3 h-3 bg-white rounded-full animate-pulse"></span>
                LIVE NOW
              </div>
              <div className="h-px flex-1 bg-gradient-to-r from-red-600 to-transparent"></div>
            </div>
            
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {liveCreators.map((creator, index) => {
                const live = liveStatus.get(creator.Name);
                const embedUrl = getStreamEmbedUrl(creator, live!);
                
                return (
                  <div
                    key={`live-${index}`}
                    className="rounded-lg bg-white/10 overflow-hidden transition-transform duration-300 hover:scale-105"
                  >
                    {/* Stream Embed */}
                    {embedUrl ? (
                      <div className="aspect-video bg-black relative">
                        <iframe
                          src={embedUrl}
                          className="w-full h-full"
                          allowFullScreen
                          frameBorder="0"
                        ></iframe>
                      </div>
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-red-900/50 to-purple-900/50 flex items-center justify-center">
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 text-white mb-2">
                            <span className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></span>
                            <span className="text-xl font-bold">LIVE</span>
                          </div>
                          <p className="text-gray-300 text-sm">
                            {live?.platform?.toUpperCase()}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Stream Info */}
                    <div className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Image
                          alt={creator.Minecarft_username}
                          src={`https://vzge.me/face/512/${creator.Minecarft_username}.png`}
                          width={40}
                          height={40}
                          className="rounded"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white truncate">{creator.Name}</p>
                          <p className="text-xs text-gray-400">
                            {live?.platform?.toUpperCase()}
                            {live?.viewers && ` • ${formatFollowers(live.viewers)} watching`}
                          </p>
                        </div>
                      </div>
                      
                      {live?.title && (
                        <p className="text-sm text-gray-300 line-clamp-2 mb-3">
                          {live.title}
                        </p>
                      )}
                      
                      {/* Platform Link */}
                      {creator.Platforms && creator.Platforms.length > 0 && (
                        <Link
                          href={creator.Platforms[0].Link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full text-center bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                        >
                          Watch Stream
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* All Creators Section */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-bold text-white">ALL CREATORS</h2>
            <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent"></div>
          </div>
          
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
      </div>
    </section>
  );
}
