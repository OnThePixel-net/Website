"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaCopy } from "react-icons/fa6";
import { FaDiscord } from "react-icons/fa";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Balancer } from "react-wrap-balancer";

// Note: We don't need to import the header and footer components
// because they're already included in the RootLayout component (src/app/layout.tsx)

export default function TNTRun() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    // The header is already included by the RootLayout component
    <div className="relative py-16 min-h-screen flex flex-col items-center justify-center text-white">
      <div className="absolute inset-0 -z-10">
        <Image
          alt="Background Image"
          className="object-cover w-full h-full filter brightness-75"
          height="1080"
          src="/tntrun.png"
          width="1920"
          priority
        />
        <div className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-950" />
      </div>
      
      <main className="flex flex-col items-center z-10 w-full max-w-7xl mx-auto px-4">
        {/* Main Card */}
        <Card className="p-4 aspect-video w-full max-w-3xl mx-auto bg-white/5 border-gray-800">
          <CardHeader className="text-center">
            <CardTitle
              className="text-4xl sm:text-5xl md:text-6xl font-bold"
              style={{
                color: "#fff",
                textShadow: "0 0 15px #fff",
              }}
            >
              TNT Run
            </CardTitle>
            <CardDescription className="text-center">
              by OnThePixel.net
            </CardDescription>
          </CardHeader>
          <h2 className="text-2xl text-bold text-center">
            <Balancer>
              Race against time as the floor crumbles beneath your feet!
            </Balancer>
          </h2>
          <CardFooter className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => copyToClipboard("play.tntrun.de")}
              className="mx-auto bg-green-700 text-white text-lg sm:text-xl md:text-2xl px-4 sm:px-6 py-2 flex items-center w-36 sm:w-40 md:w-48 h-12 hover:scale-105 transition-transform duration-500"
            >
              <FaCopy className="text-white size-6 mr-2" /> 
              <span>{copied ? "Copied!" : "Copy IP"}</span>
            </Button>
            <Link 
              href="https://discord.com/invite/Dpx3eK9t3z" 
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                className="mx-auto bg-green-700 text-white text-lg sm:text-xl md:text-2xl px-4 sm:px-6 py-2 flex items-center w-36 sm:w-40 md:w-48 h-12 hover:scale-105 transition-transform duration-500"
              >
                <FaDiscord className="text-white size-6 mr-2" /> <span>Discord</span>
              </Button>
            </Link>
          </CardFooter>
        </Card>

        {/* Game Info Section */}
        <div className="mt-12 w-full max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* How to Play */}
            <Card className="bg-white/5 border-gray-800 h-full">
              <CardHeader>
                <CardTitle 
                  className="text-xl font-bold"
                  style={{ color: "#00de6d", textShadow: "0 0 10px #00de6d" }}
                >
                  How to Play
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="bg-green-700 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">1</span>
                    <span>The floor disappears shortly after you step on it</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-green-700 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">2</span>
                    <span>Keep moving constantly to avoid falling through</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-green-700 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">3</span>
                    <span>Try to cut off other players by removing blocks in their path</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-green-700 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">4</span>
                    <span>Be the last player standing to win!</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Features */}
            <Card className="bg-white/5 border-gray-800 h-full">
              <CardHeader>
                <CardTitle 
                  className="text-xl font-bold"
                  style={{ color: "#00de6d", textShadow: "0 0 10px #00de6d" }}
                >
                  Game Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="bg-green-700 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">✓</span>
                    <span>Daily quests with special rewards and challenges</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-green-700 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">✓</span>
                    <span>Unlock cosmetics to customize your character</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-green-700 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">✓</span>
                    <span>Global leaderboards to compete with players worldwide</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-green-700 text-white rounded-full w-6 h-6 flex items-center justify-center mr-3 flex-shrink-0 mt-0.5">✓</span>
                    <span>Earn Pixels currency to spend in the server shop</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="mt-12 p-6 bg-white/10 rounded-lg border-l-4 border-green-500 mb-12">
            <h2 
              className="text-lg font-bold text-green-500" 
              style={{ color: "#00de6d", textShadow: "0 0 10px #00de6d" }}
            >
              Join the Action Today!
            </h2>
            <p className="mt-2">
              Ready to test your skills in TNT Run? Connect to our server using the IP "play.tntrun.de" and start earning Pixels, completing daily quests, and climbing the leaderboards!
            </p>
            <div className="mt-4">
              <Button
                onClick={() => copyToClipboard("play.tntrun.de")}
                className="inline-flex items-center px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-600 transition-colors"
              >
                <FaCopy className="mr-2" /> {copied ? "IP Copied!" : "Copy Server IP"}
              </Button>
            </div>
          </div>
        </div>
      </main>
      {/* The footer is already included by the RootLayout component */}
    </div>
  );
}
