import React from "react";
import { LocaleLink } from "@/components/LocaleLink";
import Image from "next/image";
import TopPage from "@/components/page/top";
import { Sword, Hammer, Zap, Trophy, Users, Heart, Star } from "lucide-react";
// Tabler brand glyphs, re-published by react-icons. lucide 1.x ships no brand
// glyphs, and react-icons is already part of the bundle, so the social icons
// come from there instead of a separate @tabler/icons-react dependency.
import {
  TbBrandDiscord,
  TbBrandYoutube,
  TbBrandTwitch,
  TbBrandX,
} from "react-icons/tb";
import type { Metadata } from "next";
import { getRouteLocale, type LocalePageProps } from "@/lib/i18n/server";
import { buildLocalizedMetadata } from "@/lib/i18n/seo";
import { buildBreadcrumbList, jsonLdScriptProps } from "@/lib/jsonld";

const COPY = {
  en: {
    title: "About",
    description:
      "Learn about OnThePixel.net — a Minecraft network built by players for players. Fast-paced minigames, a thriving community.",
  },
  de: {
    title: "Über uns",
    description:
      "Erfahre mehr über OnThePixel.net — ein Minecraft-Netzwerk von Spielern für Spieler. Schnelle Minigames, eine lebendige Community.",
  },
} as const;

export async function generateMetadata({
  params,
}: LocalePageProps): Promise<Metadata> {
  const locale = await getRouteLocale(params);
  const { title, description } = COPY[locale];
  return buildLocalizedMetadata({ locale, path: "/about", title, description });
}

interface Game {
  name: string;
  description: string;
  color: string;
  glow: string;
  status: "live" | "soon";
}

interface Value {
  title: string;
  description: string;
}

interface AboutCopy {
  taglineLine1: string;
  taglineLine2: string;
  underConstruction: string;
  whoWeAreLabel: string;
  whoWeAreTitle: string;
  whoWeAreP1: string;
  whoWeAreP2: string;
  meetTheTeam: string;
  joinUs: string;
  whatWeOfferLabel: string;
  ourMinigamesTitle: string;
  comingSoonBadge: string;
  liveBadge: string;
  readyToPlayTitle: string;
  readyToPlayText1: string;
  readyToPlayText2: string;
  joinDiscord: string;
  values: Value[];
  games: Game[];
}

const COPY_EN: AboutCopy = {
  taglineLine1: "A Minecraft network built by players, for players.",
  taglineLine2:
    "Fast-paced minigames, a thriving community — all on one server.",
  underConstruction: "Under Construction",
  whoWeAreLabel: "Who we are",
  whoWeAreTitle: "A server made with passion",
  whoWeAreP1:
    "OnThePixel.net started as a small project between friends who wanted a Minecraft server that actually feels polished. What began as a passion project grew into a full network with thousands of players.",
  whoWeAreP2:
    "Our team is made up of developers, builders, supporters and content creators — all working together to make every login memorable.",
  meetTheTeam: "Meet the Team",
  joinUs: "Join Us",
  whatWeOfferLabel: "What we offer",
  ourMinigamesTitle: "Our Minigames",
  comingSoonBadge: "Coming Soon",
  liveBadge: "Live",
  readyToPlayTitle: "Ready to play?",
  readyToPlayText1: "Join on ",
  readyToPlayText2: " — Java Edition 1.21.8+",
  joinDiscord: "Join Discord",
  values: [
    {
      title: "Community First",
      description:
        "Everything we build is for the players. Your feedback shapes the server.",
    },
    {
      title: "Passion for Minecraft",
      description:
        "We're a team of Minecraft enthusiasts who pour their heart into every update.",
    },
    {
      title: "Quality over Quantity",
      description:
        "We'd rather ship one great minigame than five mediocre ones.",
    },
  ],
  games: [
    {
      name: "Duels",
      description:
        "1v1 PvP battles to prove who's the best fighter on the server.",
      color: "#ef4444",
      glow: "rgba(239,68,68,0.2)",
      status: "live",
    },
    {
      name: "BuildFFA",
      description:
        "Build and fight at the same time — creativity meets combat.",
      color: "#f59e0b",
      glow: "rgba(245,158,11,0.2)",
      status: "live",
    },
    {
      name: "TNT Run",
      description:
        "Keep running or fall through the ground — every step counts.",
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
  ],
};

const COPY_DE: AboutCopy = {
  taglineLine1: "Ein Minecraft-Netzwerk von Spielern für Spieler.",
  taglineLine2:
    "Schnelle Minigames, eine lebendige Community — alles auf einem Server.",
  underConstruction: "In Arbeit",
  whoWeAreLabel: "Wer wir sind",
  whoWeAreTitle: "Ein Server mit Leidenschaft gebaut",
  whoWeAreP1:
    "OnThePixel.net begann als kleines Projekt unter Freunden, die einen Minecraft-Server wollten, der wirklich durchdacht wirkt. Aus dem Herzensprojekt ist ein vollständiges Netzwerk mit tausenden Spielern geworden.",
  whoWeAreP2:
    "Unser Team besteht aus Entwicklern, Buildern, Supportern und Content Creators — alle arbeiten zusammen, damit jeder Login besonders bleibt.",
  meetTheTeam: "Lerne das Team kennen",
  joinUs: "Werde Teil",
  whatWeOfferLabel: "Was wir bieten",
  ourMinigamesTitle: "Unsere Minigames",
  comingSoonBadge: "Demnächst",
  liveBadge: "Live",
  readyToPlayTitle: "Bereit zu spielen?",
  readyToPlayText1: "Spiele auf ",
  readyToPlayText2: " — Java Edition 1.21.8+",
  joinDiscord: "Discord beitreten",
  values: [
    {
      title: "Community zuerst",
      description:
        "Alles, was wir bauen, ist für die Spieler. Dein Feedback prägt den Server.",
    },
    {
      title: "Leidenschaft für Minecraft",
      description:
        "Wir sind ein Team aus Minecraft-Enthusiasten, die ihr Herz in jedes Update stecken.",
    },
    {
      title: "Qualität vor Quantität",
      description:
        "Lieber ein großartiges Minigame veröffentlichen als fünf mittelmäßige.",
    },
  ],
  games: [
    {
      name: "Duels",
      description:
        "1-gegen-1-PvP-Kämpfe — finde heraus, wer der beste Kämpfer auf dem Server ist.",
      color: "#ef4444",
      glow: "rgba(239,68,68,0.2)",
      status: "live",
    },
    {
      name: "BuildFFA",
      description:
        "Bauen und Kämpfen zugleich — Kreativität trifft auf Kampf.",
      color: "#f59e0b",
      glow: "rgba(245,158,11,0.2)",
      status: "live",
    },
    {
      name: "TNT Run",
      description:
        "Weiterlaufen oder durch den Boden fallen — jeder Schritt zählt.",
      color: "#8b5cf6",
      glow: "rgba(139,92,246,0.2)",
      status: "live",
    },
    {
      name: "BedWars",
      description:
        "Beschütze dein Bett, zerstöre die der anderen. Klassische Team-Strategie.",
      color: "#00de6d",
      glow: "rgba(0,222,109,0.2)",
      status: "soon",
    },
  ],
};

const GAME_ICONS = [
  <Sword key="sword" size={28} />,
  <Hammer key="hammer" size={28} />,
  <Zap key="bolt" size={28} />,
  <Trophy key="trophy" size={28} />,
];

const VALUE_ICONS = [
  <Users key="users" size={24} />,
  <Heart key="heart" size={24} />,
  <Star key="star" size={24} />,
];

export default async function AboutPage({ params }: LocalePageProps) {
  const locale = await getRouteLocale(params);
  const c = locale === "de" ? COPY_DE : COPY_EN;
  const { title } = COPY[locale];

  return (
    <>
      <script
        {...jsonLdScriptProps(
          buildBreadcrumbList(locale, [{ name: title, path: "/about" }]),
        )}
      />
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
                src="/bf6cf0de-bf69-44d1-b107-6ad846ab7c9e"
                alt="OnThePixel.net server logo"
                width={80}
                height={80}
                sizes="80px"
                className="drop-shadow-[0_0_24px_rgba(0,222,109,0.5)]"
                unoptimized
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
              {c.taglineLine1} {c.taglineLine2}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <div className="flex items-center gap-2 rounded-full bg-yellow-500/10 px-4 py-2 text-sm font-semibold text-yellow-400 ring-1 ring-yellow-500/20">
                <span className="h-2 w-2 animate-pulse rounded-full bg-yellow-400" />
                {c.underConstruction}
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
                  {c.whoWeAreLabel}
                </p>
                <h2
                  className="mb-4 text-3xl font-bold text-white md:text-4xl"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  {c.whoWeAreTitle}
                </h2>
                <p
                  className="mb-4 leading-relaxed text-white/50"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {c.whoWeAreP1}
                </p>
                <p
                  className="leading-relaxed text-white/50"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {c.whoWeAreP2}
                </p>
                <div className="mt-6 flex gap-3">
                  <LocaleLink
                    href="/team"
                    className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-600"
                  >
                    {c.meetTheTeam}
                  </LocaleLink>
                  <LocaleLink
                    href="/apply"
                    className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-5 py-2.5 text-sm font-semibold text-white ring-1 ring-white/10 transition-colors hover:bg-white/10"
                  >
                    {c.joinUs}
                  </LocaleLink>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {c.values.map((v, i) => (
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
                {c.whatWeOfferLabel}
              </p>
              <h2
                className="text-3xl font-bold text-white md:text-4xl"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {c.ourMinigamesTitle}
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {c.games.map((game, i) => (
                <div
                  key={i}
                  className="group relative overflow-hidden rounded-xl border border-white/5 bg-white/[0.03] p-6 transition-all duration-300 hover:border-white/10 hover:bg-white/[0.05]"
                >
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
                          {c.comingSoonBadge}
                        </span>
                      ) : (
                        <span
                          className="rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest"
                          style={{ background: game.glow, color: game.color }}
                        >
                          {c.liveBadge}
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
                </div>
              ))}
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
              {c.readyToPlayTitle}
            </h2>
            <p
              className="mb-8 text-white/45"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {c.readyToPlayText1}
              <span className="font-mono text-green-400">play.onthepixel.net</span>
              {c.readyToPlayText2}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <LocaleLink
                href="https://discord.com/invite/Dpx3eK9t3z"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-indigo-500"
              >
                <TbBrandDiscord size={20} />
                {c.joinDiscord}
              </LocaleLink>
              <LocaleLink
                href="https://youtube.com/@thebestminecraftserver"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-6 py-3 font-semibold text-white ring-1 ring-white/10 transition-colors hover:bg-white/10"
              >
                <TbBrandYoutube size={20} />
                YouTube
              </LocaleLink>
              <LocaleLink
                href="https://twitch.tv/onthepixel"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-6 py-3 font-semibold text-white ring-1 ring-white/10 transition-colors hover:bg-white/10"
              >
                <TbBrandTwitch size={20} />
                Twitch
              </LocaleLink>
              <LocaleLink
                href="https://x.com/onthepixelnet"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg bg-white/5 px-6 py-3 font-semibold text-white ring-1 ring-white/10 transition-colors hover:bg-white/10"
              >
                <TbBrandX size={20} />
                Twitter / X
              </LocaleLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
