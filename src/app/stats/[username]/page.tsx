import React from "react";
import TopPage from "@/components/page/top";
import PlayerStatistics from "@/components/page/PlayerStatistics";

interface PageProps {
  params: Promise<{
    username: string;
  }>;
}

// Für Static Export: dynamicParams auf false setzen würde alle unbekannten Routen blockieren
// Stattdessen lassen wir es offen für client-side navigation
export const dynamicParams = true;

export async function generateStaticParams() {
  // Leere Liste zurückgeben - alle Stats werden client-side geladen
  return [];
}

const StatisticsPage: React.FC<PageProps> = async ({ params }) => {
  const { username } = await params;
  
  return (
    <section className="bg-gray-950 min-h-screen">
      <TopPage />
      <PlayerStatistics />
    </section>
  );
};

export default StatisticsPage;
