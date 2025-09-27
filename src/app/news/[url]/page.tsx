"use client";
import React, { useState, useEffect } from "react";
import TopPage from "@/components/page/top";
import { useParams } from "next/navigation";

interface NewsItem {
  title: string;
  text: string;
  Date: string;
  url: string;
}

export default function NewsPage() {
  const params = useParams();
  const url = params.url as string;
  
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNews() {
      if (!url) return;
      
      try {
        const response = await fetch(`https://cms.onthepixel.net/items/News?filter%5B_and%5D%5B0%5D%5Burl%5D%5B_eq%5D=${url}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }
        
        const data = await response.json();
        
        if (data.data && data.data.length > 0) {
          setNewsItem(data.data[0]);
        } else {
          setError('News article not found');
        }
      } catch (error) {
        console.error('Error fetching news:', error);
        setError('Failed to load news article');
      } finally {
        setLoading(false);
      }
    }

    fetchNews();
  }, [url]);

  if (loading) {
    return (
      <>
        <TopPage />
        <section className="bg-gray-950 pt-36">
          <div className="container mx-auto px-4 py-10">
            <h1 className="text-2xl font-bold mb-5"></h1>
            <div className="text-gray-400">Loading...</div>
          </div>
        </section>
      </>
    );
  }

  if (error || !newsItem) {
    return (
      <>
        <TopPage />
        <section className="bg-gray-950 pt-36">
          <div className="container mx-auto px-4 py-10">
            <h1 className="text-2xl font-bold mb-5">NEWS</h1>
            <div className="text-red-400">{error || 'News article not found'}</div>
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
          <div className="mb-8 text-gray-300 text-lg leading-relaxed">
            {newsItem.text}
          </div>
        </div>
      </section>
    </>
  );
}
