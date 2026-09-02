"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Newspaper,
  Users,
  UserCog,
  ClipboardList,
  ArrowRight,
  TrendingUp,
  Shield,
} from "lucide-react";
import { LEVEL_NONE, permissionLevel } from "@/lib/permissions";
import AuthGuard from "./auth-guard";

interface StatsState {
  newsCount: number | null;
  creatorsCount: number | null;
  teamCount: number | null;
  applyCount: number | null;
  loading: boolean;
}

/** Length of a named array on a JSON response, 0 when it is missing or not one. */
function listLength(data: unknown, key: string): number {
  const list = (data as Record<string, unknown> | null)?.[key];
  return Array.isArray(list) ? list.length : 0;
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
        Manage{" "}
        <ArrowRight
          size={12}
          className="transition-transform group-hover:translate-x-0.5"
        />
      </div>
    </Link>
  );
}

function OverviewContent() {
  const { data: session } = useSession();
  const permissions = session?.user?.permissions;
  // Which areas this account may even look at. Everything below keys off these
  // four: a tile, its quick-action link and — importantly — the request behind
  // it are all skipped for an area at level 0. Fetching anyway would only
  // produce a 403 the operator sees as a broken dashboard.
  const canNews = permissionLevel(permissions, "news") > LEVEL_NONE;
  const canCreators = permissionLevel(permissions, "creators") > LEVEL_NONE;
  const canTeam = permissionLevel(permissions, "team") > LEVEL_NONE;
  const canApply = permissionLevel(permissions, "apply") > LEVEL_NONE;

  const [stats, setStats] = useState<StatsState>({
    newsCount: null,
    creatorsCount: null,
    teamCount: null,
    applyCount: null,
    loading: true,
  });

  useEffect(() => {
    async function load() {
      // `null` for an area that is not fetched at all; its tile is not
      // rendered, so the value is never read.
      const count = async (
        allowed: boolean,
        url: string,
        pick: (data: unknown) => number,
      ): Promise<number | null> => {
        if (!allowed) return null;
        try {
          const res = await fetch(url);
          if (!res.ok) return 0;
          return pick(await res.json());
        } catch {
          return 0;
        }
      };

      const [newsCount, creatorsCount, teamCount, applyCount] =
        await Promise.all([
          count(canNews, "/api/dashboard/news", (d) => listLength(d, "data")),
          count(canCreators, "/api/dashboard/creators", (d) =>
            listLength(d, "data"),
          ),
          count(canTeam, "/api/dashboard/team", (d) => listLength(d, "users")),
          count(canApply, "/api/dashboard/apply", (d) => listLength(d, "data")),
        ]);

      setStats({
        newsCount,
        creatorsCount,
        teamCount,
        applyCount,
        loading: false,
      });
    }
    load();
  }, [canNews, canCreators, canTeam, canApply]);

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
        {canNews && (
          <StatCard
            label="Total News"
            value={stats.newsCount}
            icon={Newspaper}
            href="/dashboard/news"
            color="bg-green-500/20"
          />
        )}
        {canCreators && (
          <StatCard
            label="Total Creators"
            value={stats.creatorsCount}
            icon={Users}
            href="/dashboard/creators"
            color="bg-blue-500/20"
          />
        )}
        {canTeam && (
          <StatCard
            label="Team Members"
            value={stats.teamCount}
            icon={UserCog}
            href="/dashboard/team"
            color="bg-orange-500/20"
          />
        )}
        {canApply && (
          <StatCard
            label="Bewerbungen"
            value={stats.applyCount}
            icon={ClipboardList}
            href="/dashboard/apply"
            color="bg-purple-500/20"
          />
        )}
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
            {canNews && (
              <Link
                href="/dashboard/news"
                className="flex items-center gap-2 rounded-lg bg-green-500/10 px-3 py-2 text-sm font-medium text-green-400 transition-colors hover:bg-green-500/20"
              >
                <Newspaper size={14} /> Manage News
              </Link>
            )}
            {canCreators && (
              <Link
                href="/dashboard/creators"
                className="flex items-center gap-2 rounded-lg bg-blue-500/10 px-3 py-2 text-sm font-medium text-blue-400 transition-colors hover:bg-blue-500/20"
              >
                <Users size={14} /> Manage Creators
              </Link>
            )}
            {canTeam && (
              <Link
                href="/dashboard/team"
                className="flex items-center gap-2 rounded-lg bg-orange-500/10 px-3 py-2 text-sm font-medium text-orange-400 transition-colors hover:bg-orange-500/20"
              >
                <UserCog size={14} /> Manage Team
              </Link>
            )}
            {canTeam && (
              // Ranks live in the same area as the roster, so the same level
              // decides both links; the tiles above stay one per area.
              <Link
                href="/dashboard/roles"
                className="flex items-center gap-2 rounded-lg bg-orange-500/10 px-3 py-2 text-sm font-medium text-orange-400 transition-colors hover:bg-orange-500/20"
              >
                <Shield size={14} /> Manage Rollen
              </Link>
            )}
            {canApply && (
              <Link
                href="/dashboard/apply"
                className="flex items-center gap-2 rounded-lg bg-purple-500/10 px-3 py-2 text-sm font-medium text-purple-400 transition-colors hover:bg-purple-500/20"
              >
                <ClipboardList size={14} /> Manage Bewerbungen
              </Link>
            )}
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
