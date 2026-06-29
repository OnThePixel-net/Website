"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import {
  Users,
  Search,
  ExternalLink,
  RefreshCw,
  Youtube,
  Twitch,
  Instagram,
  Twitter,
  Globe,
} from "lucide-react";
import AuthGuard from "../auth-guard";

interface Platform {
  Icons: string;
  Link: string;
}

interface Creator {
  Minecraft_username: string;
  Name: string;
  Platforms: Platform[];
}

const PLATFORM_ICONS: Record<string, React.ReactNode> = {
  youtube: <Youtube size={13} className="text-red-400" />,
  twitch: <Twitch size={13} className="text-purple-400" />,
  instagram: <Instagram size={13} className="text-pink-400" />,
  twitter: <Twitter size={13} className="text-blue-400" />,
  x_twitter: <Twitter size={13} className="text-blue-400" />,
};

function PlatformBadge({ platform }: { platform: Platform }) {
  const key = platform.Icons.toLowerCase();
  const icon = PLATFORM_ICONS[key] ?? <Globe size={13} className="text-white/40" />;
  return (
    <a
      href={platform.Link}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 rounded-md bg-white/5 px-2 py-1 text-xs text-white/60 transition-colors hover:bg-white/10 hover:text-white"
    >
      {icon}
      {platform.Icons}
    </a>
  );
}

function CreatorRow({ creator }: { creator: Creator }) {
  return (
    <tr className="border-b border-white/5 transition-colors hover:bg-white/[0.02]">
      <td className="py-3 pl-4 pr-3">
        <div className="flex items-center gap-3">
          <Image
            src={`https://api.mcskin.me/pfp/${creator.Minecraft_username}`}
            alt={creator.Name}
            width={40}
            height={40}
            className="h-10 w-10 shrink-0 rounded-lg"
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{creator.Name}</p>
            <p className="truncate text-xs text-white/30">{creator.Minecraft_username}</p>
          </div>
        </div>
      </td>
      <td className="px-3 py-3">
        <div className="flex flex-wrap gap-1.5">
          {(creator.Platforms ?? []).map((p, i) => (
            <PlatformBadge key={i} platform={p} />
          ))}
          {(!creator.Platforms || creator.Platforms.length === 0) && (
            <span className="text-xs text-white/20">No platforms</span>
          )}
        </div>
      </td>
      <td className="py-3 pl-3 pr-4">
        <a
          href={`/creators`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-white/40 transition-colors hover:bg-white/5 hover:text-white"
        >
          <ExternalLink size={12} /> View
        </a>
      </td>
    </tr>
  );
}

function CreatorsDashboardContent() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadCreators = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "https://cms.onthepixel.net/items/Creators?fields=*.*.*&limit=200"
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setCreators(data.data ?? []);
    } catch {
      setCreators([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCreators();
  }, [loadCreators]);

  const filtered = creators.filter(
    (c) =>
      c.Name.toLowerCase().includes(search.toLowerCase()) ||
      c.Minecraft_username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-white"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Creators
          </h1>
          <p className="mt-0.5 text-sm text-white/40">
            {creators.length} creators total
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
            />
            <input
              type="text"
              placeholder="Search creators..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-4 text-sm text-white placeholder-white/30 outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 sm:w-64"
            />
          </div>
          <button
            onClick={loadCreators}
            disabled={loading}
            className="flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white/60 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-white/5 bg-white/[0.02]">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-400 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <Users size={32} className="text-white/10" />
            <p className="text-sm text-white/30">No creators found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="py-3 pl-4 pr-3 text-left text-xs font-medium uppercase tracking-wider text-white/30">
                    Creator
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/30">
                    Platforms
                  </th>
                  <th className="py-3 pl-3 pr-4 text-left text-xs font-medium uppercase tracking-wider text-white/30">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((creator, i) => (
                  <CreatorRow key={i} creator={creator} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CreatorsDashboard() {
  return (
    <AuthGuard>
      <CreatorsDashboardContent />
    </AuthGuard>
  );
}
