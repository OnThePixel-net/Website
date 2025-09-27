import React from "react";
import TopPage from "@/components/page/top";
import PlayerStatistics from "@/components/page/PlayerStatistics";

interface PageProps {
  params: Promise<{
    username: string;
  }>;
}

// Da es unendlich viele mögliche Benutzernamen gibt, generieren wir eine leere Liste
// Dies ermöglicht es Next.js, die Seiten dynamisch zu erstellen
export async function generateStaticParams() {
  // Für Player-Statistiken können wir nicht alle möglichen Benutzernamen vorhersagen
  // Eine leere Liste bedeutet, dass alle Parameter zur Laufzeit behandelt werden
  return [];
}

const StatisticsPage: React.FC<PageProps> = async ({ params }) => {
  // Wir können die params hier extrahieren, aber PlayerStatistics
  // wird sie selbst aus der URL lesen
  const { username } = await params;
  
  return (
    <section className="bg-gray-950 min-h-screen">
      <TopPage />
      <PlayerStatistics />
    </section>
  );
};

export default StatisticsPage;
