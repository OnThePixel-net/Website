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

function FeaturedCard({ item }: { item: NewsItem }) {
  const [hovered, setHovered] = useState(false);
  const date = formatDate(item.Date);

  return (
    <Link href={`https://onthepixel.net/news/${item.url}`} className="group block">
      <article
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex overflow-hidden rounded-xl border border-white/5 bg-white/[0.03] transition-all duration-300 hover:border-green-500/30 hover:bg-white/[0.06]"
        style={{
          boxShadow: hovered
            ? "0 0 0 1px rgba(0,222,109,0.15), 0 12px 48px rgba(0,222,109,0.07)"
            : "none",
        }}
      >
        {/* Glow line left */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-0.5 origin-top scale-y-0 rounded-full bg-gradient-to-b from-green-400 to-green-600 transition-transform duration-300 group-hover:scale-y-100" />

        {/* Date column */}
        <div className="flex w-24 shrink-0 flex-col items-center justify-center gap-0.5 border-r border-white/5 bg-white/[0.02] px-3 py-8 text-center transition-colors duration-300 group-hover:border-green-500/20 group-hover:bg-green-950/20">
          <span
            className="text-3xl font-bold leading-none tabular-nums text-white/90"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            {date.day}
          </span>
          <span
            className="mt-1 text-[11px] font-bold tracking-widest text-green-500/80"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            {date.month}
          </span>
          <span className="text-[10px] text-white/30">{date.year}</span>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-center gap-2.5 px-7 py-7">
          <div className="flex items-start justify-between gap-4">
            <h3
              className="text-xl font-bold leading-snug text-white transition-colors duration-200 group-hover:text-green-400 md:text-2xl"
              style={{
                fontFamily: "'Syne', sans-serif",
                textShadow: hovered ? "0 0 24px rgba(0,222,109,0.25)" : "none",
              }}
            >
              {item.title}
            </h3>
            <span className="mt-1 shrink-0 text-lg text-white/20 transition-all duration-200 group-hover:translate-x-1 group-hover:text-green-400">
              →
            </span>
          </div>
          <p
            className="text-sm leading-relaxed text-white/45 transition-colors duration-200 group-hover:text-white/60 md:text-base"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {item.short_description}
          </p>
          <span
            className="mt-1 text-xs font-bold tracking-widest text-green-500/50 uppercase transition-colors duration-200 group-hover:text-green-500/80"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            Read full article →
          </span>
        </div>
      </article>
    </Link>
  );
}

function SmallCard({ item, index }: { item: NewsItem; index: number }) {
  const [hovered, setHovered] = useState(false);
  const date = formatDate(item.Date);

  return (
    <Link
      href={`https://onthepixel.net/news/${item.url}`}
      className="group block h-full"
      style={{ animationDelay: `${(index + 1) * 80}ms` }}
    >
      <article
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="relative flex h-full overflow-hidden rounded-xl border border-white/5 bg-white/[0.03] transition-all duration-300 hover:border-green-500/30 hover:bg-white/[0.06]"
        style={{
          boxShadow: hovered
            ? "0 0 0 1px rgba(0,222,109,0.15), 0 8px 32px rgba(0,222,109,0.06)"
            : "none",
        }}
      >
        {/* Glow line left */}
        <div className="pointer-events-none absolute left-0 top-0 h-full w-0.5 origin-top scale-y-0 rounded-full bg-gradient-to-b from-green-400 to-green-600 transition-transform duration-300 group-hover:scale-y-100" />

        {/* Date column */}
        <div className="flex w-20 shrink-0 flex-col items-center justify-center gap-0.5 border-r border-white/5 bg-white/[0.02] px-3 py-5 text-center transition-colors duration-300 group-hover:border-green-500/20 group-hover:bg-green-950/20">
          <span
            className="text-2xl font-bold leading-none tabular-nums text-white/90"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            {date.day}
          </span>
          <span
            className="mt-0.5 text-[10px] font-bold tracking-widest text-green-500/80"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            {date.month}
          </span>
          <span className="text-[10px] text-white/30">{date.year}</span>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-center gap-1.5 px-5 py-5">
          <div className="flex items-start justify-between gap-3">
            <h3
              className="text-base font-semibold leading-snug text-white transition-colors duration-200 group-hover:text-green-400"
              style={{
                fontFamily: "'Syne', sans-serif",
                textShadow: hovered ? "0 0 20px rgba(0,222,109,0.2)" : "none",
              }}
            >
              {item.title}
            </h3>
            <span className="mt-0.5 shrink-0 text-white/20 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-green-400">
              →
            </span>
          </div>
          <p
            className="line-clamp-2 text-sm leading-relaxed text-white/45 transition-colors duration-200 group-hover:text-white/60"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {item.short_description}
          </p>
        </div>
      </article>
    </Link>
  );
}

function SkeletonFeatured() {
  return (
    <div className="flex overflow-hidden rounded-xl border border-white/5 bg-white/[0.03] animate-pulse">
      <div className="w-24 shrink-0 border-r border-white/5 bg-white/[0.02] px-3 py-8 flex flex-col items-center gap-1.5">
        <div className="h-8 w-9 rounded bg-white/10" />
        <div className="h-2.5 w-8 rounded bg-white/10" />
        <div className="h-2 w-6 rounded bg-white/5" />
      </div>
      <div className="flex flex-1 flex-col justify-center gap-3 px-7 py-7">
        <div className="h-6 w-3/4 rounded bg-white/10" />
        <div className="h-4 w-full rounded bg-white/5" />
        <div className="h-4 w-2/3 rounded bg-white/5" />
        <div className="h-3 w-28 rounded bg-white/5 mt-1" />
      </div>
    </div>
  );
}

function SkeletonSmall() {
  return (
    <div className="flex overflow-hidden rounded-xl border border-white/5 bg-white/[0.03] animate-pulse">
      <div className="w-20 shrink-0 border-r border-white/5 bg-white/[0.02] px-3 py-5 flex flex-col items-center gap-1">
        <div className="h-7 w-8 rounded bg-white/10" />
        <div className="h-2.5 w-7 rounded bg-white/10" />
        <div className="h-2 w-5 rounded bg-white/5" />
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

  const featured = newsItems[0] ?? null;
  const rest = newsItems.slice(1, 3);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500&display=swap');
      `}</style>

      <section className="bg-gray-950 py-10 px-4">
        <div className="container mx-auto px-4 py-10">

          {/* Section header */}
          <div className="mb-8">
            <div className="mb-1.5 flex items-center gap-2.5">
              <span className="inline-block h-1 w-6 rounded-full bg-green-500" />
              <span
                className="text-xs font-bold uppercase tracking-[0.2em] text-green-500/70"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                Latest Updates
              </span>
            </div>
            <h2
              id="news"
              className="text-3xl font-bold tracking-tight text-white"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              NEWS
            </h2>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex flex-col gap-3">
              <SkeletonFeatured />
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <SkeletonSmall />
                <SkeletonSmall />
              </div>
            </div>
          ) : newsItems.length === 0 ? (
            <div className="rounded-xl border border-white/5 bg-white/[0.02] px-6 py-12 text-center">
              <p
                className="text-sm text-white/30"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                No news available at the moment.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {/* Featured article — full width */}
              {featured && <FeaturedCard item={featured} />}

              {/* Two smaller cards in a row below */}
              {rest.length > 0 && (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {rest.map((item, i) => (
                    <SmallCard key={i} item={item} index={i} />
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </section>
    </>
  );
}
