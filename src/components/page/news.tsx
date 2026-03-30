// src/components/page/news.tsx
"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";

interface NewsItem {
  title: string;
  Date: string;
  short_description: string;
  url: string;
}

function formatDate(dateStr: string): { day: string; month: string; year: string } {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return { day: "—", month: "—", year: "—" };
    return {
      day: d.getDate().toString().padStart(2, "0"),
      month: d.toLocaleString("en-US", { month: "short" }).toUpperCase(),
      year: d.getFullYear().toString(),
    };
  } catch {
    return { day: "—", month: "—", year: "—" };
  }
}

function NewsCard({ item, index }: { item: NewsItem; index: number }) {
  const [hovered, setHovered] = useState(false);
  const date = formatDate(item.Date);

  return (
    <Link
      href={`https://onthepixel.net/news/${item.url}`}
      className="group block"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <article
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex gap-0 overflow-hidden rounded-xl border border-white/5 bg-white/[0.03] transition-all duration-300 hover:border-green-500/30 hover:bg-white/[0.06]"
        style={{
          boxShadow: hovered
            ? "0 0 0 1px rgba(0,222,109,0.15), 0 8px 32px rgba(0,222,109,0.06)"
            : "none",
        }}
      >
        {/* Date column */}
        <div className="flex w-20 shrink-0 flex-col items-center justify-center gap-0.5 border-r border-white/5 bg-white/[0.02] px-3 py-5 text-center transition-colors duration-300 group-hover:border-green-500/20 group-hover:bg-green-950/20">
          <span className="text-2xl font-bold leading-none text-white/90 tabular-nums">
            {date.day}
          </span>
          <span className="mt-0.5 text-[10px] font-semibold tracking-widest text-green-500/80">
            {date.month}
          </span>
          <span className="text-[10px] text-white/30">{date.year}</span>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-center gap-1.5 px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <h3
              className="text-base font-semibold leading-snug text-white transition-colors duration-200 group-hover:text-green-400"
              style={{
                textShadow: hovered ? "0 0 20px rgba(0,222,109,0.3)" : "none",
              }}
            >
              {item.title}
            </h3>
            <span className="mt-0.5 shrink-0 text-white/20 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-green-400">
              →
            </span>
          </div>
          <p className="line-clamp-2 text-sm leading-relaxed text-white/45 group-hover:text-white/60 transition-colors duration-200">
            {item.short_description}
          </p>
        </div>

        {/* Glow line on the left */}
        <div
          className="pointer-events-none absolute left-0 top-0 h-full w-0.5 origin-top scale-y-0 rounded-full bg-gradient-to-b from-green-400 to-green-600 transition-transform duration-300 group-hover:scale-y-100"
          style={{ transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)" }}
        />
      </article>
    </Link>
  );
}

function SkeletonCard() {
  return (
    <div className="flex gap-0 overflow-hidden rounded-xl border border-white/5 bg-white/[0.03] animate-pulse">
      <div className="w-20 shrink-0 border-r border-white/5 bg-white/[0.02] px-3 py-5">
        <div className="mx-auto h-7 w-8 rounded bg-white/10" />
        <div className="mx-auto mt-1.5 h-2.5 w-8 rounded bg-white/10" />
        <div className="mx-auto mt-1 h-2 w-6 rounded bg-white/5" />
      </div>
      <div className="flex flex-1 flex-col justify-center gap-2 px-5 py-4">
        <div className="h-4 w-3/4 rounded bg-white/10" />
        <div className="h-3 w-full rounded bg-white/5" />
        <div className="h-3 w-2/3 rounded bg-white/5" />
      </div>
    </div>
  );
}

export default function News() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      try {
        const response = await fetch("https://cms.onthepixel.net/items/News");
        if (!response.ok) throw new Error("Failed to fetch news");
        const data = await response.json();
        setNewsItems(data.data || []);
      } catch (error) {
        console.error("Error fetching news:", error);
        setNewsItems([]);
      } finally {
        setLoading(false);
      }
    }
    fetchNews();
  }, []);

  return (
    <section className="bg-gray-950 py-10 px-4">
      <div className="container mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <div className="mb-1.5 flex items-center gap-2.5">
              <span className="inline-block h-1 w-6 rounded-full bg-green-500" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-green-500/70">
                Latest Updates
              </span>
            </div>
            <h2 id="news" className="text-3xl font-bold tracking-tight text-white">
              NEWS
            </h2>
          </div>
        </div>

        {/* News list */}
        {loading ? (
          <div className="flex flex-col gap-3">
            {[...Array(3)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : newsItems.length > 0 ? (
          <div className="flex flex-col gap-3">
            {newsItems.map((item, index) => (
              <NewsCard key={index} item={item} index={index} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-white/5 bg-white/[0.02] px-6 py-12 text-center">
            <p className="text-sm text-white/30">No news available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
}
