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

export default function BuildFFA() {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className="relative py-16 min-h-screen flex flex-col items-center justify-center text-white">
      <div className="absolute inset-0 -z-10">
        <Image
          alt="BuildFFA Background"
          className="object-cover w-full h-full filter brightness-75"
          height="1080"
          src="/bg.png" // Du kannst hier ein BuildFFA-spezifisches Bild verwenden
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
              className="text-4xl sm:text-5xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent"
              style={{
                textShadow: "0 0 15px #fff",
              }}
            >
              BuildFFA
            </CardTitle>
            <CardDescription className="text-center text-lg">
              by OnThePixel.net
            </CardDescription>
          </CardHeader>
          <h2 className="text-2xl text-bold text-center mb-6">
            <Balancer>
              Baue deine Arena und kämpfe in epischen Free-For-All Schlachten!
            </Balancer>
          </h2>
          <CardFooter className="flex justify-center">
            <div className="flex flex-col sm:flex-row gap-4 justify-center w-full">
              <Button
                onClick={() => copyToClipboard("play.onthepixel.net")}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg sm:text-xl md:text-2xl px-4 sm:px-6 py-2 flex items-center justify-center w-full sm:w-48 h-12 hover:scale-105 transition-transform duration-500 border-0"
              >
                <FaCopy className="text-white size-6 mr-2" /> 
                <span>{copied ? "Copied!" : "Copy IP"}</span>
              </Button>
              <Link 
                href="https://discord.com/invite/Dpx3eK9t3z" 
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto"
              >
                <Button
                  className="bg-gradient-to-r from-purple-600 to-blue-600 text-white text-lg sm:text-xl md:text-2xl px-4 sm:px-6 py-2 flex items-center justify-center w-full sm:w-48 h-12 hover:scale-105 transition-transform duration-500 border-0"
                >
                  <FaDiscord className="text-white size-6 mr-2" /> <span>Discord</span>
                </Button>
              </Link>
            </div>
          </CardFooter>
        </Card>

        {/* Game Info Section */}
        <div className="mt-12 w-full max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Build Phase */}
            <Card className="bg-white/5 border-gray-800 h-full hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="text-4xl mb-2">🏗️</div>
                <CardTitle 
                  className="text-xl font-bold text-blue-400"
                  style={{ textShadow: "0 0 10px #60a5fa" }}
                >
                  Build-Phase
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>5 Minuten Bauzeit für deine perfekte Arena</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Strategische Blöcke für Verteidigung und Fallen</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>Bereite Verstecke und Fluchtrouten vor</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Fight Phase */}
            <Card className="bg-white/5 border-gray-800 h-full hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="text-4xl mb-2">⚔️</div>
                <CardTitle 
                  className="text-xl font-bold text-red-400"
                  style={{ textShadow: "0 0 10px #f87171" }}
                >
                  Fight-Phase
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="text-red-400 mr-2">⚔</span>
                    <span>Alle gegen alle - keine Teams!</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-400 mr-2">⚔</span>
                    <span>Nutze deine gebaute Arena strategisch</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-400 mr-2">⚔</span>
                    <span>Letzter Überlebender gewinnt die Runde</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Rewards */}
            <Card className="bg-white/5 border-gray-800 h-full hover:bg-white/10 transition-all duration-300 hover:scale-105">
              <CardHeader>
                <div className="text-4xl mb-2">🏆</div>
                <CardTitle 
                  className="text-xl font-bold text-yellow-400"
                  style={{ textShadow: "0 0 10px #facc15" }}
                >
                  Belohnungen
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <span className="text-yellow-400 mr-2">★</span>
                    <span>Pixels für Kills und Siege</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-400 mr-2">★</span>
                    <span>Leaderboard-Positionen</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-yellow-400 mr-2">★</span>
                    <span>Exklusive Cosmetics freischalten</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-lg p-4 text-center hover:scale-105 transition-transform duration-300">
              <div className="text-2xl font-bold text-blue-400">∞</div>
              <div className="text-xs text-blue-200">Runden/Tag</div>
            </div>
            <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 rounded-lg p-4 text-center hover:scale-105 transition-transform duration-300">
              <div className="text-2xl font-bold text-green-400">24/7</div>
              <div className="text-xs text-green-200">Verfügbar</div>
            </div>
            <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-lg p-4 text-center hover:scale-105 transition-transform duration-300">
              <div className="text-2xl font-bold text-purple-400">16</div>
              <div className="text-xs text-purple-200">Max. Spieler</div>
            </div>
            <div className="bg-gradient-to-br from-orange-600/20 to-orange-800/20 border border-orange-500/30 rounded-lg p-4 text-center hover:scale-105 transition-transform duration-300">
              <div className="text-2xl font-bold text-orange-400">5min</div>
              <div className="text-xs text-orange-200">Build-Zeit</div>
            </div>
          </div>

          {/* Pro Tips */}
          <Card className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-gray-600 mb-8">
            <CardHeader>
              <CardTitle 
                className="text-2xl font-bold text-center text-yellow-400"
                style={{ textShadow: "0 0 10px #facc15" }}
              >
                💡 Pro-Tipps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-start">
                    <span className="text-yellow-400 text-lg mr-3">🏗️</span>
                    <div>
                      <h4 className="font-semibold text-yellow-400">Höhe nutzen</h4>
                      <p className="text-gray-300 text-sm">Baue erhöhte Positionen für bessere Übersicht und Schutz vor Angriffen</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-yellow-400 text-lg mr-3">🚪</span>
                    <div>
                      <h4 className="font-semibold text-yellow-400">Fluchtrouten</h4>
                      <p className="text-gray-300 text-sm">Plane immer mehrere Auswege - du willst nicht eingeschlossen werden</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <span className="text-yellow-400 text-lg mr-3">🕳️</span>
                    <div>
                      <h4 className="font-semibold text-yellow-400">Fallen bauen</h4>
                      <p className="text-gray-300 text-sm">Nutze versteckte Löcher und Hindernisse gegen deine Gegner</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <span className="text-yellow-400 text-lg mr-3">📦</span>
                    <div>
                      <h4 className="font-semibold text-yellow-400">Resource Management</h4>
                      <p className="text-gray-300 text-sm">Teile deine Blöcke klug ein - jeder Block zählt!</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <div className="text-center">
            <Card className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-3xl font-bold mb-4">
                  Bereit für den Kampf?
                </CardTitle>
                <CardDescription className="text-xl text-purple-100">
                  Verbinde dich mit dem OnThePixel Server und starte dein BuildFFA Abenteuer!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-black/50 rounded-lg p-4 max-w-md mx-auto mb-4">
                  <code className="text-green-400 text-lg font-mono">play.onthepixel.net</code>
                </div>
                <Button
                  onClick={() => copyToClipboard("play.onthepixel.net")}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 text-lg border-0 hover:scale-105 transition-transform duration-300"
                >
                  <FaCopy className="mr-2" /> {copied ? "IP Kopiert!" : "Server IP Kopieren"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
