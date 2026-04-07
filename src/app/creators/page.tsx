import React from "react";
import Creators, { Creator, LiveStatus } from "@/components/page/creators";
import TopPage from "@/components/page/top";

async function getCreatorsData() {
  try {
    const creatorsRes = await fetch(
      "https://cms.onthepixel.net/items/Creators?fields=*.*.*",
      { next: { revalidate: 300 } }
    );
    if (!creatorsRes.ok) return { creators: [], followersMap: {}, liveMap: {} };
    const creatorsData = await creatorsRes.json();
    const creators: Creator[] = creatorsData.data || [];

    const [followersResults, liveResults] = await Promise.all([
      Promise.all(
        creators.map(async (creator) => {
          try {
            const res = await fetch(
              `https://api.onthepixel.net/creators/followers/${creator.Name}`,
              { next: { revalidate: 3600 } }
            );
            if (res.ok) {
              const data = await res.json();
              if (data.success && data.data?.social) {
                const count =
                  data.data.social.followers || data.data.social.subscribers || 0;
                return { name: creator.Name, count };
              }
            }
          } catch {}
          return { name: creator.Name, count: 0 };
        })
      ),
      Promise.all(
        creators.map(async (creator) => {
          try {
            const res = await fetch(
              `https://api.onthepixel.net/creators/live/${creator.Name}`,
              { next: { revalidate: 60 } }
            );
            if (res.ok) {
              const data = await res.json();
              if (data.success && data.data) {
                return {
                  name: creator.Name,
                  status: {
                    isLive: data.data.isLive || false,
                    platform: data.data.platform,
                    title: data.data.title,
                    viewers: data.data.viewers,
                  } as LiveStatus,
                };
              }
            }
          } catch {}
          return { name: creator.Name, status: { isLive: false } as LiveStatus };
        })
      ),
    ]);

    const followersMap: Record<string, number> = {};
    followersResults.forEach(({ name, count }) => {
      followersMap[name] = count;
    });

    const liveMap: Record<string, LiveStatus> = {};
    liveResults.forEach(({ name, status }) => {
      liveMap[name] = status;
    });

    return { creators, followersMap, liveMap };
  } catch {
    return { creators: [], followersMap: {}, liveMap: {} };
  }
}

export default async function CreatorsPage() {
  const { creators, followersMap, liveMap } = await getCreatorsData();

  return (
    <section className="min-h-screen bg-gray-950">
      <TopPage />
      <Creators
        initialCreators={creators}
        initialFollowers={followersMap}
        initialLiveStatus={liveMap}
      />
    </section>
  );
}
