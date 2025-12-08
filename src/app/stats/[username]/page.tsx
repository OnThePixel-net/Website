import React from "react";
import TopPage from "@/components/page/top";
import PlayerStatistics from "@/components/page/PlayerStatistics";

interface PageProps {
  params: Promise<{
    username: string;
  }>;
}

// WICHTIG: Entferne "export const dynamicParams = true;"
// Für Static Export nur leere generateStaticParams
export async function generateStaticParams() {
  // Leere Liste - keine Seiten werden vorab generiert
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
