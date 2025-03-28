import React from "react";
import Image from "next/image";
import Link from "next/link";
import TopPage from "@/components/page/top";
import { creators } from "@/components/page/creatorsData";

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
