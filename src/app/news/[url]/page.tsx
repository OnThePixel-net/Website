'use client';

import React, { useEffect, useState } from "react";
import Link from "next/link";
import TopPage from "@/components/page/top";

interface NewsItem {
  title: string;
  text: string;
  date: string;
  url: string;
}

interface PageProps {
  params: Promise<{ url: string; }>;
}

function parseMarkdownLinks(text: string) {
  const parts: Array<{type: string; content?: string; text?: string; url?: string}> = [];
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.substring(lastIndex, match.index) });
    }
    parts.push({ type: 'link', text: match[1], url: match[2] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.substring(lastIndex) });
  }

  return parts.length > 0 ? parts : [{ type: 'text', content: text }];
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

        if (!response.ok) { setError(true); return; }

        const data = await response.json();
        if (data.data && data.data.length > 0) {
          setNewsItem(data.data[0]);
        } else {
          setError(true);
        }
      } catch {
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
          <div className="container mx-auto px-4 py-10 max-w-3xl">
            <div className="animate-pulse space-y-4">
              <div className="h-6 w-3/4 bg-white/10 rounded" />
              <div className="h-4 w-1/4 bg-white/5 rounded" />
              <div className="space-y-2 mt-8">
                <div className="h-4 bg-white/5 rounded" />
                <div className="h-4 bg-white/5 rounded" />
                <div className="h-4 w-2/3 bg-white/5 rounded" />
              </div>
            </div>
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
          <div className="container mx-auto px-4 py-10 max-w-3xl">
            <Link
              href="/#news"
              className="inline-block mb-6 text-sm text-gray-400 hover:text-green-400 transition-colors"
            >
              ← Back to News
            </Link>
            <div className="bg-white/5 rounded-lg p-8 text-center">
              <p className="text-gray-400">News article not found.</p>
            </div>
          </div>
        </section>
      </>
    );
  }

  const textLines = newsItem.text.split('\n');

  return (
    <>
      <TopPage />
      <section className="bg-gray-950 pt-36 min-h-screen">
        <div className="container mx-auto px-4 py-10 max-w-3xl">
          <Link
            href="/#news"
            className="inline-block mb-8 text-sm text-gray-400 hover:text-green-400 transition-colors duration-200"
          >
            ← Back to News
          </Link>

          <div className="mb-8 border-l-4 border-green-500 pl-5">
            <h1
              className="text-2xl font-bold mb-2"
              style={{ color: "#00de6d", textShadow: "0 0 10px #00de6d" }}
            >
              {newsItem.title}
            </h1>
            <span className="text-sm text-gray-400">{newsItem.date}</span>
          </div>

          <div className="bg-white/5 rounded-lg p-6 text-gray-300 leading-relaxed text-sm">
            {textLines.map((line, lineIndex) => {
              const parts = parseMarkdownLinks(line);
              return (
                <React.Fragment key={lineIndex}>
                  {parts.map((part, partIndex) => {
                    if (part.type === 'link' && part.url && part.text) {
                      return (
                        <a
                          key={partIndex}
                          href={part.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-400 hover:text-green-300 underline"
                        >
                          {part.text}
                        </a>
                      );
                    }
                    return <span key={partIndex}>{part.content}</span>;
                  })}
                  {lineIndex < textLines.length - 1 && <br />}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
