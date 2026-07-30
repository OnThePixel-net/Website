import React from "react";
import Image from "next/image";
import Link from "next/link";
import { getServerTranslations } from "@/lib/i18n/server";
import { getPublicTeamMembers, type PublicTeamMember } from "@/lib/pocketid";
import Reveal from "@/components/gsap/Reveal";

async function getTeamMembers(): Promise<PublicTeamMember[]> {
  try {
    // Sourced from the PocketID team system (the dashboard), not the legacy
    // Directus CMS. Degrades to an empty list if PocketID is unreachable.
    return await getPublicTeamMembers();
  } catch {
    return [];
  }
}

export default async function Team() {
  // `getPublicTeamMembers` already orders members by group weight (highest
  // first), so no further sorting is needed here.
  const [sortedMembers, { t }] = await Promise.all([
    getTeamMembers(),
    getServerTranslations(),
  ]);

  return (
    <section className="py-10 px-4 bg-gray-950">
      <div className="container mx-auto px-4 py-10">
        <Reveal direction="up">
          <h1 id="team" className="text-3xl font-bold mb-4 text-white">
            {t.team.heading}
          </h1>
        </Reveal>
        {sortedMembers.length > 0 ? (
          <Reveal
            staggerChildren
            stagger={0.06}
            duration={0.7}
            distance={30}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3"
          >
            {sortedMembers.map((member) => {
              const avatarId = member.minecraftUuid || member.username;

              return (
                <div
                  key={member.id}
                  className="m-1 flex items-center rounded-md bg-white/10 p-4 transition-transform duration-300 hover:scale-105 hover:bg-white/15 gap-4"
                >
                  <div className="relative shrink-0 rounded-lg overflow-hidden">
                    <Image
                      alt={member.name}
                      src={`https://api.mcskin.me/pfp/${avatarId}`}
                      width={64}
                      height={64}
                      className="rounded-lg object-cover"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="font-bold text-white truncate">{member.name}</p>
                    {member.rankName ? (
                      <p
                        className="text-sm font-semibold tracking-wide truncate"
                        style={{ color: member.rankColor }}
                      >
                        {member.rankName.toUpperCase()}
                      </p>
                    ) : (
                      <p className="text-sm text-gray-400">{t.team.memberFallback}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </Reveal>
        ) : (
          <div className="text-gray-400">{t.team.empty}</div>
        )}

        <Reveal direction="up" delay={0.05} className="mt-12 p-6 bg-white/10 rounded-lg border-l-4 border-green-500">
          <h2
            className="text-lg font-bold"
            style={{ color: "#00de6d", textShadow: "0 0 10px #00de6d" }}
          >
            {t.team.joinTitle}
          </h2>
          <p className="mt-2 text-gray-300">{t.team.joinText}</p>
          <Link
            href="/apply"
            className="inline-block mt-4 px-5 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg transition-colors font-medium"
          >
            {t.team.applyNow} →
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
