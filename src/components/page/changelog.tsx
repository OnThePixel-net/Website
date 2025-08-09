import React, { useState, useEffect } from "react";

interface NewsItem {
  url: string;
  title: string;
  short_description: string;
  Text: string;
  Date: string;
}

interface NewsApiResponse {
  data: NewsItem[];
}

export default function ChangeLog() {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://cms.onthepixel.net/items/News');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: NewsApiResponse = await response.json();
        setNewsItems(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch news');
        console.error('Error fetching news:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return (
      <section className="py-10 px-4 bg-gray-950">
        <div className="container mx-auto px-4 py-10">
          <h1 id="changelog" className="text-3xl font-bold mb-4 text-white">
            CHANGELOG
          </h1>
          <div className="text-gray-300">Loading...</div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-10 px-4 bg-gray-950">
        <div className="container mx-auto px-4 py-10">
          <h1 id="changelog" className="text-3xl font-bold mb-4 text-white">
            CHANGELOG
          </h1>
          <div className="text-red-400">Error: {error}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-10 px-4 bg-gray-950">
      <div className="container mx-auto px-4 py-10">
        <h1 id="changelog" className="text-3xl font-bold mb-4 text-white">
          CHANGELOG
        </h1>
        {newsItems.map((item, index) => (
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
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 text-green-500 hover:text-green-400 transition-colors duration-200 text-sm font-medium"
                style={{ color: "#00de6d" }}
              >
                Mehr lesen →
              </a>
            </div>
          </div>
        ))}
        {newsItems.length === 0 && (
          <div className="text-gray-400">Keine News verfügbar.</div>
        )}
      </div>
    </section>
  );
}
