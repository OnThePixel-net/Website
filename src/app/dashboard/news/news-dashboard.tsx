"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Newspaper, Search, ExternalLink, RefreshCw, Calendar, Image as ImageIcon } from "lucide-react";
import AuthGuard from "../auth-guard";

interface NewsItem {
  title: string;
  date: string;
  short_description: string;
  url: string;
  icon: string | null;
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("de-DE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function NewsRow({ item }: { item: NewsItem }) {
  return (
    <tr className="border-b border-white/5 transition-colors hover:bg-white/[0.02]">
      <td className="py-3 pl-4 pr-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/5">
            {item.icon ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`https://cdn.onthepixel.net/${item.icon}?w=80&auto=format`}
                alt={item.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <ImageIcon size={16} className="text-white/20" />
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{item.title}</p>
            <p className="truncate text-xs text-white/30">/news/{item.url}</p>
          </div>
        </div>
      </td>
      <td className="px-3 py-3">
        <p className="line-clamp-2 text-xs text-white/40">{item.short_description}</p>
      </td>
      <td className="px-3 py-3 whitespace-nowrap">
        <div className="flex items-center gap-1.5 text-xs text-white/40">
          <Calendar size={12} />
          {formatDate(item.date)}
        </div>
      </td>
      <td className="py-3 pl-3 pr-4">
        <a
          href={`/news/${item.url}`}
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

function NewsDashboardContent() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadNews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "https://cms.onthepixel.net/items/News?sort=-date&limit=100"
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setItems(data.data ?? []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  const filtered = items.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.url.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1
            className="text-2xl font-bold text-white"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            News
          </h1>
          <p className="mt-0.5 text-sm text-white/40">
            {items.length} articles total
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
              placeholder="Search news..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full rounded-lg border border-white/10 bg-white/5 pl-9 pr-4 text-sm text-white placeholder-white/30 outline-none focus:border-green-500/50 focus:ring-1 focus:ring-green-500/20 sm:w-64"
            />
          </div>
          <button
            onClick={loadNews}
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
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-400 border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16">
            <Newspaper size={32} className="text-white/10" />
            <p className="text-sm text-white/30">No news articles found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="py-3 pl-4 pr-3 text-left text-xs font-medium uppercase tracking-wider text-white/30">
                    Article
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/30">
                    Description
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium uppercase tracking-wider text-white/30">
                    Date
                  </th>
                  <th className="py-3 pl-3 pr-4 text-left text-xs font-medium uppercase tracking-wider text-white/30">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => (
                  <NewsRow key={i} item={item} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function NewsDashboard() {
  return (
    <AuthGuard>
      <NewsDashboardContent />
    </AuthGuard>
  );
}
