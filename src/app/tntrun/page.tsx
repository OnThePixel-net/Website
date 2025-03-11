"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaCopy, FaDiscord, FaUserFriends } from "react-icons/fa";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Balancer } from "react-wrap-balancer";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { BsLightningChargeFill } from "react-icons/bs";
import { PiSwordFill } from "react-icons/pi";
import { HiOutlineChevronDoubleDown } from "react-icons/hi";
import { GiRunningNinja, GiPodium } from "react-icons/gi";

export default function TNTRun() {
  const [copied, setCopied] = useState(false);
  const [playerCount, setPlayerCount] = useState(0);
  const [serverStatus, setServerStatus] = useState("loading");

  useEffect(() => {
    // Simulating a server status check
    const checkServerStatus = async () => {
      try {
        // In a real implementation, you would fetch from your API
        // const response = await fetch("https://api.mcsrvstat.us/3/play.tntrun.de");
        // const data = await response.json();
        // setPlayerCount(data.players?.online || 0);
        // setServerStatus(data.online ? "online" : "offline");
        
        // Simulating successful server check
        setTimeout(() => {
          setPlayerCount(Math.floor(Math.random() * 50) + 20);
          setServerStatus("online");
        }, 1500);
      } catch (error) {
        console.error("Error checking server status:", error);
        setServerStatus("error");
      }
    };

    checkServerStatus();
  }, []);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  const features = [
    {
      icon: <GiRunningNinja className="text-yellow-400 h-8 w-8" />,
      title: "Fast-Paced Action",
      description: "Run for your life as blocks disappear beneath your feet! Quick reflexes are key to victory."
    },
    {
      icon: <BsLightningChargeFill className="text-blue-400 h-8 w-8" />,
      title: "Power-ups",
      description: "Collect special items during the game that give you advantages like speed boosts or double jumps."
    },
    {
      icon: <PiSwordFill className="text-red-400 h-8 w-8" />,
      title: "Multiple Game Modes",
      description: "Play Classic, PvP, or Team modes with varying difficulty levels and challenges."
    },
    {
      icon: <GiPodium className="text-green-400 h-8 w-8" />,
      title: "Competitive Ranking",
      description: "Climb the leaderboards and show off your skills as you become a TNT Run master."
    }
  ];

  return (
    <div
      className="relative min-h-screen flex flex-col text-white"
    >
      {/* Hero Section with Parallax Effect */}
      <div className="relative h-screen flex items-center justify-center">
        <div className="absolute inset-0 -z-10">
          <Image
            alt="TNT Run Background"
            className="object-cover w-full h-full filter brightness-50"
            src="/tntrun.png"
            fill
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-950" />
        </div>

        <div className="container mx-auto px-4 z-10">
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 
              className="text-6xl md:text-7xl lg:text-8xl font-bold mb-6"
              style={{
                color: "#fff",
                textShadow: "0 0 20px #fff, 0 0 30px #ff0000, 0 0 40px #ff0000",
              }}
            >
              TNT RUN
            </h1>
            <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto">
              <Balancer>
                Race against time as the floor crumbles beneath your feet! The last player standing wins!
              </Balancer>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              {/* Server Status Card */}
              <Card className="bg-black/50 backdrop-blur-sm border-gray-700 p-2">
                <CardContent className="p-2 flex items-center gap-3">
                  <div className="relative flex items-center">
                    <span className="relative flex h-3 w-3">
                      {serverStatus === "online" && (
                        <>
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </>
                      )}
                      {serverStatus === "offline" && (
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                      )}
                      {serverStatus === "loading" && (
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500 animate-pulse"></span>
                      )}
                    </span>
                    <span className="ml-2">
                      {serverStatus === "online" ? "Online" : serverStatus === "loading" ? "Checking..." : "Offline"}
                    </span>
                  </div>
                  {serverStatus === "online" && (
                    <div className="flex items-center">
                      <FaUserFriends className="mr-2" />
                      <span>{playerCount} Players</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* IP Copy Button */}
              <Button
                onClick={() => copyToClipboard("play.tntrun.de")}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                size="lg"
              >
                <FaCopy className="text-white size-5" />
                <span>{copied ? "IP Copied!" : "Copy Server IP"}</span>
              </Button>

              {/* Discord Button */}
              <Link href="https://discord.com/invite/Dpx3eK9t3z" target="_blank" rel="noopener noreferrer">
                <Button 
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2"
                  size="lg"
                >
                  <FaDiscord className="text-white size-5" />
                  <span>Join Discord</span>
                </Button>
              </Link>
            </div>
          </motion.div>
          
          <motion.div 
            className="absolute bottom-10 left-0 right-0 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5, duration: 1 }}
          >
            <a 
              href="#features" 
              className="inline-block text-white/80 hover:text-white"
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('features').scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <HiOutlineChevronDoubleDown className="h-8 w-8 animate-bounce mx-auto" />
              <span className="sr-only">Scroll Down</span>
            </a>
          </motion.div>
        </div>
      </div>

      {/* Game Features Section */}
      <section id="features" className="bg-gray-950 py-20">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-4 px-3 py-1 bg-red-600 text-white border-0 text-sm">GAMEPLAY</Badge>
            <h2 className="text-4xl font-bold mb-4">Game Features</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              TNT Run is an exciting minigame that tests your reflexes and strategic movement. Here's what makes it special:
            </p>
          </motion.div>

          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div 
                key={index} 
                className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800 hover:border-red-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-red-900/20"
                variants={itemVariants}
              >
                <div className="mb-4 p-3 bg-gray-800/50 inline-block rounded-lg">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How to Play Section */}
      <section className="bg-gradient-to-b from-gray-950 to-gray-900 py-20">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="text-center mb-12">
              <Badge className="mb-4 px-3 py-1 bg-yellow-600 text-white border-0 text-sm">TUTORIAL</Badge>
              <h2 className="text-4xl font-bold mb-4">How To Play</h2>
              <p className="text-gray-400">Master these simple rules and become the last player standing!</p>
            </div>

            <div className="space-y-8">
              <div className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-gray-800">
                <h3 className="text-2xl font-bold mb-3 flex items-center">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-600 mr-3 text-sm">1</span>
                  Run, Don't Stop!
                </h3>
                <p className="text-gray-300 ml-11">
                  Once the game starts, blocks will disappear shortly after you step on them. Keep moving to avoid falling through!
                </p>
              </div>

              <div className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-gray-800">
                <h3 className="text-2xl font-bold mb-3 flex items-center">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-600 mr-3 text-sm">2</span>
                  Be Strategic
                </h3>
                <p className="text-gray-300 ml-11">
                  Plan your path carefully and try to cut off opponents by removing blocks in their path. Think ahead!
                </p>
              </div>

              <div className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-gray-800">
                <h3 className="text-2xl font-bold mb-3 flex items-center">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-600 mr-3 text-sm">3</span>
                  Collect Power-ups
                </h3>
                <p className="text-gray-300 ml-11">
                  Look for special items that appear throughout the arena. They can give you advantages like temporary speed boosts, double jumps, or immunity from falling.
                </p>
              </div>

              <div className="bg-black/30 backdrop-blur-sm p-6 rounded-xl border border-gray-800">
                <h3 className="text-2xl font-bold mb-3 flex items-center">
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-red-600 mr-3 text-sm">4</span>
                  Last One Standing Wins!
                </h3>
                <p className="text-gray-300 ml-11">
                  The goal is simple: be the last player remaining on the field. As other players fall through to lower levels or out of the game entirely, stay focused and survive!
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-gray-900 py-20">
        <div className="container mx-auto px-4">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-gradient-to-br from-red-900/50 to-black border-2 border-red-800/50 p-8">
              <CardHeader>
                <CardTitle className="text-3xl md:text-4xl font-bold mb-3">Ready to Play?</CardTitle>
                <CardDescription className="text-lg text-gray-300">
                  Join thousands of players already enjoying TNT Run on OnThePixel.net
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xl mb-6">
                  <span className="font-bold text-red-400">SERVER IP:</span> play.tntrun.de
                </p>
              </CardContent>
              <CardFooter className="flex flex-col md:flex-row gap-4 justify-center">
                <Button
                  onClick={() => copyToClipboard("play.tntrun.de")}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2 w-full md:w-auto"
                  size="lg"
                >
                  <FaCopy className="text-white size-5" />
                  <span>{copied ? "IP Copied!" : "Copy Server IP"}</span>
                </Button>
                <Link 
                  href="https://discord.com/invite/Dpx3eK9t3z" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full md:w-auto"
                >
                  <Button 
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center gap-2 w-full"
                    size="lg"
                  >
                    <FaDiscord className="text-white size-5" />
                    <span>Join Our Community</span>
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
