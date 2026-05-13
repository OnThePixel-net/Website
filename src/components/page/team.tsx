import React from "react";
import Image from "next/image";
import Link from "next/link";
import { getServerTranslations } from "@/lib/i18n/server";
import Reveal from "@/components/gsap/Reveal";

interface Rank {
  uuid: string;
  Name: string;
  Color: string;
  Discord_role_id: string;
  Priority: number;
}

interface TeamMember {
  minecraft_username: string;
  Name: string;
  Ranks?: Rank;
}

async function getTeamMembers(): Promise<TeamMember[]> {
  try {
    const response = await fetch(
      "https://cms.onthepixel.net/items/Team?fields=*.*.*",
      { next: { revalidate: 300 } },
    );
    if (!response.ok) return [];
    const data = await response.json();
    return data.data || [];
  } catch {
    return [];
  }
}

function hexToRgb(hex: string): string {
  const value = hex.replace("#", "");
  if (value.length !== 6) return "0, 222, 109";
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b))
    return "0, 222, 109";
  return `${r}, ${g}, ${b}`;
}

export default async function Team() {
  const [teamMembers, { t }] = await Promise.all([
    getTeamMembers(),
    getServerTranslations(),
  ]);

  const sortedMembers = [...teamMembers].sort((a, b) => {
    const priorityA = a.Ranks ? a.Ranks.Priority : 999;
    const priorityB = b.Ranks ? b.Ranks.Priority : 999;
    return priorityA - priorityB;
  });

  return (
    <section className="relative bg-gray-950 px-4 py-16">
      {/* Decorative top divider */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-px w-3/4 -translate-x-1/2 bg-gradient-to-r from-transparent via-green-500/40 to-transparent" />

      <div className="container mx-auto px-4 py-6">
        <Reveal direction="up" className="mb-10">
          <div className="flex items-center gap-3">
            <span className="h-8 w-1 rounded-full bg-gradient-to-b from-green-400 to-emerald-600" />
            <h2
              id="team"
              className="text-3xl font-bold tracking-tight text-white sm:text-4xl"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {t.team.heading}
            </h2>
          </div>
        </Reveal>

        {sortedMembers.length > 0 ? (
          <Reveal
            staggerChildren
            stagger={0.06}
            duration={0.7}
            distance={30}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {sortedMembers.map((member, index) => {
              const mainRank = member.Ranks;
              const rankRgb = mainRank ? hexToRgb(mainRank.Color) : null;

              return (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-xl border border-white/5 bg-white/[0.03] p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/10 hover:bg-white/[0.05]"
                  style={
                    rankRgb
                      ? ({
                          ["--rank-rgb" as never]: rankRgb,
                        } as React.CSSProperties)
                      : undefined
                  }
                >
                  {/* Rank glow on hover */}
                  {rankRgb && (
                    <div
                      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{
                        background:
                          "radial-gradient(circle at top left, rgba(var(--rank-rgb), 0.18) 0%, transparent 60%)",
                      }}
                    />
                  )}

                  <div className="relative flex items-center gap-4">
                    <div
                      className="relative shrink-0 overflow-hidden rounded-lg ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-[1.03]"
                      style={
                        rankRgb
                          ? {
                              boxShadow:
                                "0 0 0 0 rgba(var(--rank-rgb), 0)",
                            }
                          : undefined
                      }
                    >
                      <Image
                        alt={member.minecraft_username}
                        src={`https://mcskin.me/api/pfp/${member.minecraft_username}.png?transparent=true`}
                        width={64}
                        height={64}
                        className="h-16 w-16 object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate font-bold text-white"
                        style={{ fontFamily: "'Syne', sans-serif" }}
                      >
                        {member.Name}
                      </p>
                      {mainRank ? (
                        <span
                          className="mt-1 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider"
                          style={{
                            color: mainRank.Color,
                            backgroundColor: `rgba(${rankRgb}, 0.12)`,
                            border: `1px solid rgba(${rankRgb}, 0.25)`,
                          }}
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: mainRank.Color }}
                          />
                          {mainRank.Name}
                        </span>
                      ) : (
                        <p className="mt-1 text-xs text-white/40">
                          {t.team.memberFallback}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </Reveal>
        ) : (
          <div className="rounded-xl border border-white/5 bg-white/[0.02] px-6 py-12 text-center text-sm text-white/40">
            {t.team.empty}
          </div>
        )}

        <Reveal direction="up" delay={0.05} className="mt-12">
          <div className="relative overflow-hidden rounded-2xl border border-green-500/20 bg-gradient-to-br from-green-500/10 via-emerald-700/5 to-transparent p-6 md:p-8">
            <div
              className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-green-500/15 blur-3xl"
              aria-hidden="true"
            />
            <div className="relative flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
              <div className="max-w-2xl">
                <h3
                  className="text-xl font-bold text-green-300 sm:text-2xl"
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    textShadow: "0 0 18px rgba(0,222,109,0.35)",
                  }}
                >
                  {t.team.joinTitle}
                </h3>
                <p className="mt-2 text-sm text-white/65 sm:text-base">
                  {t.team.joinText}
                </p>
              </div>
              <Link
                href="/apply"
                className="group inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_30px_-10px_rgba(0,222,109,0.6)] transition-all duration-300 hover:shadow-[0_18px_40px_-12px_rgba(0,222,109,0.8)] sm:text-base"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {t.team.applyNow}
                <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                  →
                </span>
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
