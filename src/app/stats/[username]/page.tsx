import PlayerStatistics from "@/components/page/PlayerStatistics";

interface PageProps {
  params: {
    username: string;
  };
}

const StatisticsPage: React.FC<PageProps> = async ({ params }) => {
  const { username } = params;

  return (
    <section className="bg-gray-950 min-h-screen">
      <TopPage />
      <PlayerStatistics initialUsername={username} />
    </section>
  );
};

export default StatisticsPage;
