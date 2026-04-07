import React from "react";
import Link from "next/link";
import Image from "next/image";
import TopPage from "@/components/page/top";
import {
  IconBrandDiscord,
  IconBrandYoutube,
  IconBrandTwitch,
  IconBrandX,
  IconSword,
  IconHammer,
  IconBolt,
  IconTrophy,
  IconUsers,
  IconHeart,
  IconStar,
} from "@tabler/icons-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — OnThePixel.net",
  description:
    "Learn about OnThePixel.net — a Minecraft network built by players for players. Fast-paced minigames, a thriving community.",
};

const GAMES = [
  {
    name: "Duels",
    description: "1v1 PvP battles to prove who's the best fighter on the server.",
    color: "#ef4444",
    glow: "rgba(239,68,68,0.2)",
    status: "live",
  },
  {
    name: "BuildFFA",
    description: "Build and fight at the same time — creativity meets combat.",
    color: "#f59e0b",
    glow: "rgba(245,158,11,0.2)",
    status: "live",
  },
  {
    name: "TNT Run",
    description: "Keep running or fall through the ground — every step counts.",
    color: "#8b5cf6",
    glow: "rgba(139,92,246,0.2)",
    status: "live",
  },
  {
    name: "BedWars",
    description: "Protect your bed, destroy theirs. Classic team strategy.",
    color: "#00de6d",
    glow: "rgba(0,222,109,0.2)",
    status: "soon",
  },
] as const;

const GAME_ICONS = [
  <IconSword key="sword" size={28} />,
  <IconHammer key="hammer" size={28} />,
  <IconBolt key="bolt" size={28} />,
  <IconTrophy key="trophy" size={28} />,
];

const VALUES = [
  {
    title: "Community First",
    description: "Everything we build is for the players. Your feedback shapes the server.",
  },
  {
    title: "Passion for Minecraft",
    description: "We're a team of Minecraft enthusiasts who pour their heart into every update.",
  },
  {
    title: "Quality over Quantity",
    description: "We'd rather ship one great minigame than five mediocre ones.",
  },
] as const;

const VALUE_ICONS = [
  <IconUsers key="users" size={24} />,
  <IconHeart key="heart" size={24} />,
  <IconStar key="star" size={24} />,
];

export default function AboutPage() {
  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500&display=swap');`}</style>
      <TopPage />
      <section className="min-h-screen bg-gray-950">

        {/* Hero */}
        <div className="relative overflow-hidden bg-gray-950 py-20 px-4">
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 40%, rgba(0,222,109,0.35) 0%, transparent 50%), radial-gradient(circle at 80% 60%, rgba(0,222,109,0.12) 0%, transparent 50%)",
            }}
          />
          <div className="container mx-auto max-w-4xl px-4 text-center">
            <div className="mb-6 flex justify-center">
              <Image
                src="/logo.png"
                alt="OnThePixel.net"
                width={80}
                height={80}
                className="drop-shadow-[0_0_24px_rgba(0,222,109,0.5)]"
              />
            </div>
            <h1
              className="mb-4 text-4xl font-black md:text-6xl"
              style={{
                fontFamily: "'Syne', sans-serif",
                color: "#00de6d",
                textShadow: "0 0 40px rgba(0,222,109,0.3)",
              }}
            >
              OnThePixel.net
            </h1>
            <p
              className="mx-auto max-w-xl text-lg text-white/50 md:text-xl"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              A Minecraft network built by players, for players.
              Fast-paced minigames, a thriving community — all on one server.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <div className="flex items-center gap-2 rounded-full bg-yellow-500/10 px-4 py-2 text-sm font-semibold text-yellow-400 ring-1 ring-yellow-500/20">
                <span className="h-2 w-2 animate-pulse rounded-full bg-yellow-400" />
                Under Construction
              </div>
              <div className="rounded-full bg-white/5 px-4 py-2 text-sm text-white/40 ring-1 ring-white/10">
                play.onthepixel.net
              </div>
            </div>
          </div>
        </div>

        {/* Who we are */}
        <div className="px-4 py-16">
          <div className="container mx-auto max-w-4xl px-4">
            <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:items-center">
              <div>
                <p
                  className="mb-2 text-xs font-bold uppercase tracking-widest text-green-400"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  Who we are
                </p>
                <h2
                  className="mb-4 text-3xl font-bold text-white md:text-4xl"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  A server made with passion
                </h2>
                <p
                  className="mb-4 leading-relaxed text-white/50"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  OnThePixel.net started as a small project between friends who wanted
                  a Minecraft server that actually feels polished. What began as a
                  passion project grew into a full network with thousands of players.
                </p>
                <p
                  className="leading-relaxed text-white/50"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  Our team is made up of developers, builders, supporters and content
                  creators — all working together to make every login memorable.
                </p>
                <div className="mt-6 flex gap-3">
                  <Link
                    href="/team"
                    className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-600"
                  >
                    Meet the Team
                  </Link>
                  <Link
                    href="/apply"
                    className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/10 transition-colors hover:bg-white/10"
                  >
                    Join Us
                  </Link>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {VALUES.map((v, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-4 rounded-xl border border-white/5 bg-white/[0.03] p-5"
                  >
                    <div className="shrink-0 rounded-lg bg-green-500/10 p-2.5 text-green-400">
                      {VALUE_ICONS[i]}
                    </div>
                    <div>
                      <p
                        className="mb-1 font-bold text-white"
                        style={{ fontFamily: "'Syne', sans-serif" }}
                      >
                        {v.title}
                      </p>
                      <p
                        className="text-sm leading-relaxed text-white/45"
                        style={{ fontFamily: "'DM Sans', sans-serif" }}
                      >
                        {v.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Minigames */}
        <div className="px-4 py-16">
          <div className="container mx-auto max-w-4xl px-4">
            <div className="mb-10 text-center">
              <p
                className="mb-2 text-xs font-bold uppercase tracking-widest text-green-400"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                What we offer
              </p>
              <h2
                className="text-3xl font-bold text-white md:text-4xl"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Our Minigames
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {GAMES.map((game, i) => {
                const CardWrapper = "href" in game
                  ? ({ children }: { children: React.ReactNode }) => (
                      <Link href={(game as { href: string }).href} className="group relative overflow-hidden rounded-xl border border-white/5 bg-white/[0.03] p-6 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.05] block">
                        {children}
                      </Link>
                    )
                  : ({ children }: { children: React.ReactNode }) => (
                      <div className="group relative overflow-hidden rounded-xl border border-white/5 bg-white/[0.03] p-6 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.05]">
                        {children}
                      </div>
                    );
                return (
                <CardWrapper key={i}>
                  <div
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      background: `radial-gradient(circle at 0% 0%, ${game.glow} 0%, transparent 60%)`,
                    }}
                  />
                  <div className="relative">
                    <div className="mb-3 flex items-center justify-between">
                      <span style={{ color: game.color }}>{GAME_ICONS[i]}</span>
                      {game.status === "soon" ? (
                        <span className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-white/30">
                          Coming Soon
                        </span>
                      ) : (
                        <span
                          className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest"
                          style={{ background: game.glow, color: game.color }}
                        >
                          Live
                        </span>
                      )}
                    </div>
                    <h3
                      className="mb-1.5 text-lg font-bold text-white"
                      style={{ fontFamily: "'Syne', sans-serif" }}
                    >
                      {game.name}
                    </h3>
                    <p
                      className="text-sm leading-relaxed text-white/45"
                      style={{ fontFamily: "'DM Sans', sans-serif" }}
                    >
                      {game.description}
                    </p>
                  </div>
                </CardWrapper>
                );
              })}
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="px-4 py-20">
          <div className="container mx-auto max-w-2xl px-4 text-center">
            <h2
              className="mb-4 text-3xl font-bold text-white md:text-4xl"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              Ready to play?
            </h2>
            <p
              className="mb-8 text-white/45"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Join thousands of players on{" "}
              <span className="font-mono text-green-400">play.onthepixel.net</span>{" "}
              — Java Edition 1.8+
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="https://discord.com/invite/Dpx3eK9t3z"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-indigo-500"
              >
                <IconBrandDiscord size={20} />
                Join Discord
              </Link>
              <Link
                href="https://youtube.com/@thebestminecraftserver"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-6 py-3 font-semibold text-white ring-1 ring-white/10 transition-colors hover:bg-white/10"
              >
                <IconBrandYoutube size={20} />
                YouTube
              </Link>
              <Link
                href="https://twitch.tv/onthepixel"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-6 py-3 font-semibold text-white ring-1 ring-white/10 transition-colors hover:bg-white/10"
              >
                <IconBrandTwitch size={20} />
                Twitch
              </Link>
              <Link
                href="https://x.com/onthepixelnet"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-6 py-3 font-semibold text-white ring-1 ring-white/10 transition-colors hover:bg-white/10"
              >
                <IconBrandX size={20} />
                Twitter / X
              </Link>
            </div>
          </div>
        </div>

      </section>
    </>
  );
}
