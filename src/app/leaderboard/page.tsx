import Link from "next/link";
import React from "react";
import TopPage from "@/components/page/top";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function Leaderboards() {
  return (
    <>
      <TopPage />
      <section className="bg-gray-950 pt-36">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-2xl font-bold mb-5">LEADERBOARDS</h1>
          <p className="mb-8 text-gray-400">
            Check out the top players across different game modes on OnThePixel.net. 
            Compete with others and climb the rankings!
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Pixels Leaderboard */}
            <LeaderboardCard 
              title="Pixels"
              description="The Pixels leaderboard shows the richest players on the server."
              link="/leaderboard/pixels"
              enabled={true}
              comingSoon={true}
            />
            
            {/* BedWars Leaderboard */}
            <LeaderboardCard 
              title="BedWars"
              description="Players ranked by score, kills, and deaths in BedWars matches."
              link="#"
              enabled={false}
              comingSoon={true}
            />
            
            {/* Duels Leaderboard */}
            <LeaderboardCard 
              title="Duels"
              description="The best duelists ranked by wins, K/D ratio and win streaks."
              link="/leaderboard/duels"
              comingSoon={true}
              enabled={true}
            />
            
            {/* Parkour Leaderboard */}
            <LeaderboardCard 
              title="TNTRun"
              description="Players ranked based on how far they've progressed in parkour courses."
              link="#"
              enabled={false}
              comingSoon={true}
            />
            
            {/* SkyWars Leaderboard - Disabled */}
            <LeaderboardCard 
              title="BuildFFA"
              description="SkyWars leaderboards will be available soon!"
              link="/leaderboard/buildffa"
              enabled={true}
              comingSoon={true}
            />
          </div>
        </div>
      </section>
    </>
  );
}

interface LeaderboardCardProps {
  title: string;
  description: string;
  link: string;
  enabled: boolean;
  comingSoon?: boolean;
}

function LeaderboardCard({ title, description, link, enabled, comingSoon }: LeaderboardCardProps) {
  const content = (
    <Card className={`h-full border-gray-800 transition-all duration-300 ${enabled ? 'hover:border-green-500 hover:shadow-md hover:shadow-green-900/20' : 'opacity-70'}`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold">{title}</h2>
          {comingSoon && (
            <Badge className="text-sm bg-amber-600 text-white border-none">Coming Soon</Badge>
          )}
          {!enabled && !comingSoon && (
            <Badge className="text-sm bg-red-600 text-white border-none">Unavailable</Badge>
          )}
        </div>
        <p className="text-gray-400">{description}</p>
        
        {enabled && (
          <div className="mt-4 flex justify-end">
            <span className="text-green-400 text-sm">View leaderboard →</span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (!enabled) {
    return content;
  }

  return (
    <Link href={link} className="block h-full">
      {content}
    </Link>
  );
}
