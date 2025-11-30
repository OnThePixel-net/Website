'use client';

import React, { useEffect, useState } from "react";
import TopPage from "@/components/page/top";

interface NewsItem {
  title: string;
  text: string;
  Date: string;
  url: string;
}

interface PageProps {
  params: Promise<{ url: string; }>;
}

export default function NewsPage({ params }: PageProps) {
  const [newsItem, setNewsItem] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [url, setUrl] = useState<string>('');

  useEffect(() => {
    async function loadParams() {
      const resolvedParams = await params;
      setUrl(resolvedParams.url);
    }
    loadParams();
  }, [params]);

  useEffect(() => {
    if (!url) return;

    async function fetchNewsItem() {
      try {
        setLoading(true);
        const response = await fetch(
          `https://cms.onthepixel.net/items/News?filter%5B_and%5D%5B0%5D%5Burl%5D%5B_eq%5D=${url}`
        );

        if (!response.ok) {
          setError(true);
          return;
        }

        const data = await response.json();

        if (data.data && data.data.length > 0) {
          setNewsItem(data.data[0]);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error('Error fetching news:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchNewsItem();
  }, [url]);

  if (loading) {
    return (
      <>
        <TopPage />
        <section className="bg-gray-950 pt-36 min-h-screen">
          <div className="container mx-auto px-4 py-10">
            <h1 className="text-2xl font-bold mb-5">NEWS</h1>
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
        <section className="bg-gray-950 pt-36 min-h-screen">
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
      <section className="bg-gray-950 pt-36 min-h-screen">
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
