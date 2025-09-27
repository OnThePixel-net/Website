import React from "react";
import TopPage from "@/components/page/top";

interface NewsItem {
  title: string;
  text: string;
  Date: string;
  url: string;
}

interface PageProps {
  params: Promise<{
    url: string;
  }>;
}

// Generate static params for all news articles
export async function generateStaticParams() {
  try {
    const response = await fetch('https://cms.onthepixel.net/items/News');
    if (!response.ok) {
      return [];
    }
    
    const data = await response.json();
    const newsItems = data.data || [];
    
    return newsItems.map((item: NewsItem) => ({
      url: item.url,
    }));
  } catch (error) {
    console.error('Error fetching news for static generation:', error);
    return [];
  }
}

async function getNewsItem(url: string): Promise<NewsItem | null> {
  try {
    const response = await fetch(`https://cms.onthepixel.net/items/News?filter%5B_and%5D%5B0%5D%5Burl%5D%5B_eq%5D=${url}`, {
      next: { revalidate: 60 } // Revalidate every minute
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      return data.data[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching news:', error);
    return null;
  }
}

export default async function NewsPage({ params }: PageProps) {
  const { url } = await params;
  const newsItem = await getNewsItem(url);

  if (!newsItem) {
    return (
      <>
        <TopPage />
        <section className="bg-gray-950 pt-36">
          <div className="container mx-auto px-4 py-10">
            <h1 className="text-2xl font-bold mb-5">NEWS</h1>
            <div className="text-red-400">News article not found</div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <TopPage />
      <section className="bg-gray-950 pt-36">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-2xl font-bold mb-5">{newsItem.title}</h1>
          <div className="mb-4 text-gray-400 text-sm">{newsItem.Date}</div>
          <div className="mb-8 text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
            {newsItem.text}
          </div>
        </div>
      </section>
    </>
  );
}
