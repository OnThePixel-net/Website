import React from "react";
import TopPage from "@/components/page/top";
import PlayerStatistics from "@/components/page/PlayerStatistics";

interface PageProps {
  params: Promise<{
    username: string;
  }>;
}

// The page is rendered on-demand for each requested username — the root
// layout already reads the locale cookie/header and so the whole tree is
// dynamic.
export const dynamic = "force-dynamic";

const StatisticsPage: React.FC<PageProps> = async ({ params }) => {
  const { username } = await params;
  
  return (
    <section className="bg-gray-950 min-h-screen">
      <TopPage />
      <PlayerStatistics initialUsername={username} />
    </section>
  );
};

export default StatisticsPage;
