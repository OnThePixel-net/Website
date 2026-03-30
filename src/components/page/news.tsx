// src/components/page/changelog.tsx
"use client";
import React, { useState, useEffect } from "react";

interface NewsItem {
  title: string;
  Date: string;
  short_description: string;
  url: string;
}

export default function ChangeLog() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      try {
        const response = await fetch('https://cms.onthepixel.net/items/News');
        
        if (!response.ok) {
          throw new Error('Failed to fetch news');
        }
        
        const data = await response.json();
        setNewsItems(data.data || []);
      } catch (error) {
        console.error('Error fetching news:', error);
        setNewsItems([]);
      } finally {
        setLoading(false);
      }
    }

    fetchNews();
  }, []);

  if (loading) {
    return (
      <section className="py-10 px-4 bg-gray-950">
        <div className="container mx-auto px-4 py-10">
          <h1 id="news" className="text-3xl font-bold mb-4 text-white">
            NEWS
          </h1>
          <div className="text-gray-400">Loading...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 px-4 bg-gray-950">
      <div className="container mx-auto px-4 py-10">
        <h1 id="news" className="text-3xl font-bold mb-4 text-white">
          NEWS
        </h1>
        {newsItems.length > 0 ? (
          newsItems.map((item, index) => (
            <div
              key={index}
              className="bg-white/10 p-4 my-4 border-l-4 border-green-500 rounded-lg"
            >
              <h3
                className="text-lg font-bold text-green-500" 
                style={{ color: "#00de6d", textShadow: "0 0 10px #00de6d" }}
              >
                {item.title}
              </h3>
              <span className="text-xs text-gray-400">{item.Date}</span>
              <div className="text-sm mt-2">
                <p className="text-gray-300">{item.short_description}</p>
                <a
                  href={`https://onthepixel.net/news/${item.url}`}
                  className="inline-block mt-2 text-green-500 hover:text-green-400 transition-colors duration-200 text-sm font-medium"
                  style={{ color: "#00de6d" }}
                >
                  Read more →
                </a>
              </div>
            </div>
          ))
        ) : (
          <div className="text-gray-400">No news available.</div>
        )}
      </div>
    </section>
  );
}
