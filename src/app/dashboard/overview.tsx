"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Newspaper, Users, ArrowRight, TrendingUp } from "lucide-react";
import AuthGuard from "./auth-guard";

interface StatsState {
  newsCount: number | null;
  creatorsCount: number | null;
  loading: boolean;
}

function StatCard({
  label,
  value,
  icon: Icon,
  href,
  color,
}: {
  label: string;
  value: number | null;
  icon: React.ElementType;
  href: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden rounded-xl border border-white/5 bg-white/[0.03] p-6 transition-all duration-200 hover:border-white/10 hover:bg-white/[0.06]"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-white/40">{label}</p>
          <p className="mt-2 text-4xl font-bold text-white">
            {value === null ? (
              <span className="inline-block h-9 w-16 animate-pulse rounded bg-white/10" />
            ) : (
              value
            )}
          </p>
        </div>
        <div className={`rounded-lg p-3 ${color}`}>
          <Icon size={22} className="text-white" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1 text-xs text-white/30 transition-colors group-hover:text-white/60">
        Manage <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  );
}

function OverviewContent() {
  const [stats, setStats] = useState<StatsState>({
    newsCount: null,
    creatorsCount: null,
    loading: true,
  });

  useEffect(() => {
    async function load() {
      try {
        const [newsRes, creatorsRes] = await Promise.all([
          fetch("https://cms.onthepixel.net/items/News?limit=1&meta=total_count"),
          fetch("https://cms.onthepixel.net/items/Creators?limit=1&meta=total_count"),
        ]);
        const [newsData, creatorsData] = await Promise.all([
          newsRes.json(),
          creatorsRes.json(),
        ]);
        setStats({
          newsCount: newsData?.meta?.total_count ?? newsData?.data?.length ?? 0,
          creatorsCount: creatorsData?.meta?.total_count ?? creatorsData?.data?.length ?? 0,
          loading: false,
        });
      } catch {
        setStats((s) => ({ ...s, loading: false, newsCount: 0, creatorsCount: 0 }));
      }
    }
    load();
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1
          className="text-3xl font-bold text-white"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-white/40">
          Manage your news and creators content.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Total News"
          value={stats.newsCount}
          icon={Newspaper}
          href="/dashboard/news"
          color="bg-green-500/20"
        />
        <StatCard
          label="Total Creators"
          value={stats.creatorsCount}
          icon={Users}
          href="/dashboard/creators"
          color="bg-blue-500/20"
        />
        <div className="rounded-xl border border-white/5 bg-white/[0.03] p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-white/40">Quick Actions</p>
            </div>
            <div className="rounded-lg bg-purple-500/20 p-3">
              <TrendingUp size={22} className="text-white" />
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <Link
              href="/dashboard/news"
              className="flex items-center gap-2 rounded-lg bg-green-500/10 px-3 py-2 text-sm font-medium text-green-400 transition-colors hover:bg-green-500/20"
            >
              <Newspaper size={14} /> Manage News
            </Link>
            <Link
              href="/dashboard/creators"
              className="flex items-center gap-2 rounded-lg bg-blue-500/10 px-3 py-2 text-sm font-medium text-blue-400 transition-colors hover:bg-blue-500/20"
            >
              <Users size={14} /> Manage Creators
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardOverview() {
  return (
    <AuthGuard>
      <OverviewContent />
    </AuthGuard>
  );
}
