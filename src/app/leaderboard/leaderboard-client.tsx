"use client";
import Link from "next/link";
import React from "react";
import TopPage from "@/components/page/top";
import { useTranslations } from "@/lib/i18n/LanguageProvider";

export default function Leaderboards() {
  const t = useTranslations();
  return (
    <>
      <TopPage />
      <section className="bg-gray-950 pt-36">
        <div className="container mx-auto px-4 py-10">
          <h1 className="mb-5 text-2xl font-bold">{t.leaderboards.heading}</h1>
          <p className="mb-8">{t.leaderboards.intro}</p>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Pixels */}
            <Link href="/leaderboard/pixels" className="block h-full">
              <div className="group flex h-full flex-col overflow-hidden rounded-lg border border-transparent bg-white/5 transition-all duration-300 hover:scale-105 hover:border-green-500/50 hover:bg-white/10">
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="mb-3 text-xl font-bold">
                    {t.leaderboards.pixelsTitle}
                  </h2>
                  <p className="flex-1 text-sm text-gray-300">
                    {t.leaderboards.pixelsDesc}
                  </p>
                  <span className="mt-4 text-sm text-green-400 transition-colors group-hover:text-green-300">
                    {t.leaderboards.view} →
                  </span>
                </div>
              </div>
            </Link>

            {/* BuildFFA */}
            <Link href="/leaderboard/buildffa" className="block h-full">
              <div className="group flex h-full flex-col overflow-hidden rounded-lg border border-transparent bg-white/5 transition-all duration-300 hover:scale-105 hover:border-green-500/50 hover:bg-white/10">
                <div className="flex flex-1 flex-col p-5">
                  <h2 className="mb-3 text-xl font-bold">
                    {t.leaderboards.buildffaTitle}
                  </h2>
                  <p className="flex-1 text-sm text-gray-300">
                    {t.leaderboards.buildffaDesc}
                  </p>
                  <span className="mt-4 text-sm text-green-400 transition-colors group-hover:text-green-300">
                    {t.leaderboards.view} →
                  </span>
                </div>
              </div>
            </Link>

            {/* Duels */}
            <div className="flex h-full flex-col overflow-hidden rounded-lg bg-white/5 opacity-50">
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-xl font-bold">
                    {t.leaderboards.duelsTitle}
                  </h2>
                  <span className="rounded border border-amber-500/30 bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-400">
                    {t.leaderboards.soon}
                  </span>
                </div>
                <p className="flex-1 text-sm text-gray-300">
                  {t.leaderboards.duelsDesc}
                </p>
                <span className="invisible mt-4 text-sm">
                  {t.leaderboards.view} →
                </span>
              </div>
            </div>

            {/* BedWars */}
            <div className="flex h-full flex-col overflow-hidden rounded-lg bg-white/5 opacity-50">
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-xl font-bold">
                    {t.leaderboards.bedwarsTitle}
                  </h2>
                  <span className="rounded border border-amber-500/30 bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-400">
                    {t.leaderboards.soon}
                  </span>
                </div>
                <p className="flex-1 text-sm text-gray-300">
                  {t.leaderboards.bedwarsDesc}
                </p>
                <span className="invisible mt-4 text-sm">
                  {t.leaderboards.view} →
                </span>
              </div>
            </div>

            {/* TNTRun */}
            <div className="flex h-full flex-col overflow-hidden rounded-lg bg-white/5 opacity-50">
              <div className="flex flex-1 flex-col p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-xl font-bold">
                    {t.leaderboards.tntrunTitle}
                  </h2>
                  <span className="rounded border border-amber-500/30 bg-amber-500/20 px-2 py-0.5 text-xs font-bold text-amber-400">
                    {t.leaderboards.soon}
                  </span>
                </div>
                <p className="flex-1 text-sm text-gray-300">
                  {t.leaderboards.tntrunDesc}
                </p>
                <span className="invisible mt-4 text-sm">
                  {t.leaderboards.view} →
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
