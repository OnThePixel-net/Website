"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaCopy, FaDiscord, FaUserFriends } from "react-icons/fa";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Balancer } from "react-wrap-balancer";

export default function TNTRun() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div
      key="1"
      className="relative min-h-screen flex flex-col items-center justify-center text-white"
    >
      <div className="absolute inset-0 -z-10">
        <Image
          alt="Background Image"
          className="object-cover w-full h-full filter brightness-75"
          height="1080"
          src="/tntrun.png"
          width="1920"
        />
        <div className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-950" />
      </div>
      
      <main className="flex flex-col items-center px-4 w-full max-w-6xl mx-auto">
        <div className="relative mb-4">
          <Image
            alt="Logo"
            height="100"
            src="/logo.png"
            style={{
              aspectRatio: "100/100",
              objectFit: "cover",
            }}
            width="250"
          />
        </div>
        
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-center"
          style={{
            color: "#fff",
            textShadow: "0 0 15px #fff",
          }}
        >
          TNT Run
        </h1>
        
        <p className="mb-8 text-center text-lg max-w-2xl">
          <Balancer>
            Race against time as the floor crumbles beneath your feet! The last player standing wins in this exciting minigame on OnThePixel.net.
          </Balancer>
        </p>

        {/* Server Info Card */}
        <Card className="bg-white/5 backdrop-blur mb-10 w-full max-w-3xl mx-auto">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl text-green-500" style={{ color: "#00de6d", textShadow: "0 0 10px #00de6d" }}>
              Server Information
            </CardTitle>
            <CardDescription>
              Connect to our server using the IP below
            </CardDescription>
          </CardHeader>
          
          <div className="p-6 pt-2">
            <div className="bg-black/30 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
              <div className="flex items-center">
                <span className="relative flex h-3 w-3 mr-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                <span className="text-xl font-mono">play.tntrun.de</span>
              </div>
              
              <Button
                onClick={() => copyToClipboard("play.tntrun.de")}
                className="bg-green-700 hover:bg-green-600 transition-colors w-full sm:w-auto"
              >
                <FaCopy className="text-white size-4 mr-2" /> <span>{copied ? "Copied!" : "Copy IP"}</span>
              </Button>
            </div>
            
            <div className="flex items-center justify-center mb-2">
              <FaUserFriends className="text-gray-400 mr-2" />
              <span className="text-gray-300">Join players from around the world!</span>
            </div>
          </div>
          
          <CardFooter className="flex justify-center pb-6">
            <Link 
              href="https://discord.com/invite/Dpx3eK9t3z" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button className="bg-green-700 hover:bg-green-600 transition-colors">
                <FaDiscord className="mr-2" /> Join Our Discord
              </Button>
            </Link>
          </CardFooter>
        </Card>
        
        {/* Game Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl mx-auto">
          {/* How to Play */}
          <Card className="bg-white/5 backdrop-blur h-full">
            <CardHeader>
              <CardTitle className="text-xl font-bold">How to Play</CardTitle>
            </CardHeader>
            <div className="p-6 pt-0">
              <ul className="space-y-3">
                <li className="flex">
                  <span className="bg-green-700 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">1</span>
                  <span>Blocks disappear shortly after you step on them</span>
                </li>
                <li className="flex">
                  <span className="bg-green-700 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">2</span>
                  <span>Keep moving to avoid falling through the floor</span>
                </li>
                <li className="flex">
                  <span className="bg-green-700 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">3</span>
                  <span>Use strategic movement to outmaneuver other players</span>
                </li>
                <li className="flex">
                  <span className="bg-green-700 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">4</span>
                  <span>Be the last player standing to win!</span>
                </li>
              </ul>
            </div>
          </Card>
          
          {/* Features */}
          <Card className="bg-white/5 backdrop-blur h-full">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Game Features</CardTitle>
            </CardHeader>
            <div className="p-6 pt-0">
              <ul className="space-y-3">
                <li className="flex">
                  <span className="bg-green-700 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">✓</span>
                  <span>Multiple arenas with different themes and layouts</span>
                </li>
                <li className="flex">
                  <span className="bg-green-700 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">✓</span>
                  <span>Special power-ups to give you an edge in the competition</span>
                </li>
                <li className="flex">
                  <span className="bg-green-700 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">✓</span>
                  <span>Competitive leaderboards to track the best players</span>
                </li>
                <li className="flex">
                  <span className="bg-green-700 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0">✓</span>
                  <span>Regular tournaments with special prizes</span>
                </li>
              </ul>
            </div>
          </Card>
        </div>
        
        {/* Call to Action */}
        <div className="mt-12 p-6 bg-white/10 rounded-lg border-l-4 border-green-500 max-w-4xl w-full mx-auto">
          <h2 
            className="text-lg font-bold text-green-500" 
            style={{ color: "#00de6d", textShadow: "0 0 10px #00de6d" }}
          >
            Ready to Play?
          </h2>
          <p className="mt-2">
            Join us now and experience the thrill of TNT Run! Connect to our server using the IP above and start your adventure.
          </p>
          <div className="mt-4 flex flex-wrap gap-4">
            <Button
              onClick={() => copyToClipboard("play.tntrun.de")}
              className="inline-flex items-center px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-600 transition-colors"
            >
              <FaCopy className="mr-2" /> Copy Server IP
            </Button>
            
            <Link 
              href="https://discord.com/invite/Dpx3eK9t3z" 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button className="inline-flex items-center px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-600 transition-colors">
                <FaDiscord className="mr-2" /> Join Discord
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
