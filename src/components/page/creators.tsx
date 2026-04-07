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

export interface Creator {
  Minecarft_username: string;
  Name: string;
  Platforms: Platform[];
}

export interface LiveStatus {
  isLive: boolean;
  platform?: string;
  title?: string;
  viewers?: number;
}

interface CreatorsProps {
  initialCreators: Creator[];
  initialFollowers: Record<string, number>;
  initialLiveStatus: Record<string, LiveStatus>;
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

const getStreamEmbedUrl = (creator: Creator, live: LiveStatus): string | null => {
  if (!live.isLive || !creator.Platforms || creator.Platforms.length === 0) return null;

  const firstPlatform = creator.Platforms[0];
  const platformType = firstPlatform.Icons.toLowerCase();

  if (platformType === 'twitch') {
    const match = firstPlatform.Link.match(/twitch\.tv\/([^\/\?]+)/i);
    if (match) {
      return `https://player.twitch.tv/?channel=${match[1]}&parent=${window.location.hostname}&autoplay=false`;
    }
  }

  return null;
};

export default function Creators({ initialCreators, initialFollowers, initialLiveStatus }: CreatorsProps) {
  const creators = initialCreators;
  const followersData = initialFollowers;
  const [liveStatus, setLiveStatus] = useState<Record<string, LiveStatus>>(initialLiveStatus);

  useEffect(() => {
    async function fetchAllLiveStatus() {
      const liveMap: Record<string, LiveStatus> = {};

      await Promise.all(
        creators.map(async (creator) => {
          try {
            const response = await fetch(
              `https://api.onthepixel.net/creators/live/${creator.Name}`
            );
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.data) {
                liveMap[creator.Name] = {
                  isLive: data.data.isLive || false,
                  platform: data.data.platform,
                  title: data.data.title,
                  viewers: data.data.viewers,
                };
              } else {
                liveMap[creator.Name] = { isLive: false };
              }
            }
          } catch {
            liveMap[creator.Name] = { isLive: false };
          }
        })
      );

      setLiveStatus(liveMap);
    }

    const liveInterval = setInterval(fetchAllLiveStatus, 60000);
    return () => clearInterval(liveInterval);
  }, [creators]);

  const liveCreators = creators
    .filter((creator) => liveStatus[creator.Name]?.isLive)
    .sort((a, b) => (followersData[b.Name] || 0) - (followersData[a.Name] || 0));

  const sortedCreators = [...creators].sort(
    (a, b) => (followersData[b.Name] || 0) - (followersData[a.Name] || 0)
  );

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
                const live = liveStatus[creator.Name];
                const embedUrl = live ? getStreamEmbedUrl(creator, live) : null;

                return (
                  <div
                    key={`live-${index}`}
                    className="rounded-lg bg-white/10 overflow-hidden transition-transform duration-300 hover:scale-105"
                  >
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

                    <div className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Image
                          alt={creator.Minecarft_username}
                          src={`https://mcskin.me/api/head/${creator.Minecarft_username}.png`}
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
                const followerCount = followersData[creator.Name];

                return (
                  <div
                    key={index}
                    className="m-1 flex flex-col rounded-md bg-white/10 p-6 transition-transform duration-300 hover:scale-105 relative"
                  >
                    <div className="flex items-center mb-4">
                      <Image
                        alt={creator.Minecarft_username}
                        src={`https://mcskin.me/api/head/${creator.Minecarft_username}.png`}
                        width={40}
                        height={40}
                        className="rounded"
                      />
                      <div className="ml-4 flex-1">
                        <p className="font-bold text-white">{creator.Name}</p>
                        <p className="text-sm text-gray-400">CREATOR</p>
                      </div>

                      <div className="text-right">
                        {followerCount !== undefined ? (
                          <>
                            <p className="text-lg font-bold text-white">
                              {formatFollowers(followerCount)}
                            </p>
                            <p className="text-xs text-gray-400">Followers</p>
                          </>
                        ) : null}
                      </div>
                    </div>

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
