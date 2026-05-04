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
          <h1 className="text-2xl font-bold mb-5">{t.leaderboards.heading}</h1>
          <p className="mb-8">{t.leaderboards.intro}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Pixels */}
            <Link href="/leaderboard/pixels" className="block h-full">
              <div className="h-full flex flex-col bg-white/5 rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:bg-white/10 border border-transparent hover:border-green-500/50 group">
                <div className="flex flex-col flex-1 p-5">
                  <h2 className="text-xl font-bold mb-3">{t.leaderboards.pixelsTitle}</h2>
                  <p className="text-sm text-gray-300 flex-1">
                    {t.leaderboards.pixelsDesc}
                  </p>
                  <span className="text-sm text-green-400 group-hover:text-green-300 transition-colors mt-4">
                    {t.leaderboards.view} →
                  </span>
                </div>
              </div>
            </Link>

            {/* BuildFFA */}
            <Link href="/leaderboard/buildffa" className="block h-full">
              <div className="h-full flex flex-col bg-white/5 rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:bg-white/10 border border-transparent hover:border-green-500/50 group">
                <div className="flex flex-col flex-1 p-5">
                  <h2 className="text-xl font-bold mb-3">{t.leaderboards.buildffaTitle}</h2>
                  <p className="text-sm text-gray-300 flex-1">
                    {t.leaderboards.buildffaDesc}
                  </p>
                  <span className="text-sm text-green-400 group-hover:text-green-300 transition-colors mt-4">
                    {t.leaderboards.view} →
                  </span>
                </div>
              </div>
            </Link>

            {/* Duels */}
            <div className="h-full flex flex-col bg-white/5 rounded-lg overflow-hidden opacity-50">
              <div className="flex flex-col flex-1 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-bold">{t.leaderboards.duelsTitle}</h2>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {t.leaderboards.soon}
                  </span>
                </div>
                <p className="text-sm text-gray-300 flex-1">
                  {t.leaderboards.duelsDesc}
                </p>
                <span className="invisible text-sm mt-4">{t.leaderboards.view} →</span>
              </div>
            </div>

            {/* BedWars */}
            <div className="h-full flex flex-col bg-white/5 rounded-lg overflow-hidden opacity-50">
              <div className="flex flex-col flex-1 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-bold">{t.leaderboards.bedwarsTitle}</h2>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {t.leaderboards.soon}
                  </span>
                </div>
                <p className="text-sm text-gray-300 flex-1">
                  {t.leaderboards.bedwarsDesc}
                </p>
                <span className="invisible text-sm mt-4">{t.leaderboards.view} →</span>
              </div>
            </div>

            {/* TNTRun */}
            <div className="h-full flex flex-col bg-white/5 rounded-lg overflow-hidden opacity-50">
              <div className="flex flex-col flex-1 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xl font-bold">{t.leaderboards.tntrunTitle}</h2>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    {t.leaderboards.soon}
                  </span>
                </div>
                <p className="text-sm text-gray-300 flex-1">
                  {t.leaderboards.tntrunDesc}
                </p>
                <span className="invisible text-sm mt-4">{t.leaderboards.view} →</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
