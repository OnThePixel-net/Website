import React from "react";
import Link from "next/link";
import TopPage from "@/components/page/top";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getServerTranslations, getServerLocale } from "@/lib/i18n/server";
import {
  DATE_LOCALES,
  DIRECTUS_LOCALES,
  Locale,
  translations,
} from "@/lib/i18n/translations";

interface NewsTranslation {
  id?: number;
  News_url?: string;
  languages_code: string;
  title?: string | null;
  short_description?: string | null;
  text?: string | null;
}

interface NewsItem {
  title: string;
  text: string;
  date: string;
  url: string;
  icon: string | null;
  short_description?: string;
  translations?: NewsTranslation[];
}

interface PageProps {
  params: Promise<{ url: string }>;
}

function formatDate(dateStr: string, locale: Locale): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(DATE_LOCALES[locale], {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function parseMarkdownLinks(text: string) {
  const parts: Array<{ type: string; content?: string; text?: string; url?: string }> = [];
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match;

  while ((match = linkRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", content: text.substring(lastIndex, match.index) });
    }
    parts.push({ type: "link", text: match[1], url: match[2] });
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", content: text.substring(lastIndex) });
  }

  return parts.length > 0 ? parts : [{ type: "text", content: text }];
}

async function getNewsItem(url: string): Promise<NewsItem | null> {
  try {
    const response = await fetch(
      `https://cms.onthepixel.net/items/News?filter%5Burl%5D%5B_eq%5D=${encodeURIComponent(url)}`,
      { next: { revalidate: 300 } },
    );
    if (!response.ok) return null;
    const data = await response.json();
    return (data.data?.[0] as NewsItem | undefined) ?? null;
  } catch {
    return null;
  }
}

async function getAllNewsTranslations(): Promise<NewsTranslation[]> {
  try {
    const response = await fetch(
      "https://cms.onthepixel.net/items/News_translations",
      { next: { revalidate: 300 } },
    );
    if (!response.ok) return [];
    const data = await response.json();
    return (data.data || []) as NewsTranslation[];
  } catch {
    return [];
  }
}

function findTranslationFor(
  url: string,
  languageCode: string,
  list: NewsTranslation[],
): NewsTranslation | undefined {
  return list.find(
    (tr) => tr.News_url === url && tr.languages_code === languageCode,
  );
}

function applyTranslation(
  item: NewsItem,
  tr: NewsTranslation | undefined,
): NewsItem {
  if (!tr) return item;
  return {
    ...item,
    title: tr.title?.trim() ? tr.title : item.title,
    short_description: tr.short_description?.trim()
      ? tr.short_description
      : item.short_description,
    text: tr.text?.trim() ? tr.text : item.text,
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { url } = await params;
  const locale = await getServerLocale();
  const [base, allTr] = await Promise.all([
    getNewsItem(url),
    locale === "en" ? Promise.resolve([]) : getAllNewsTranslations(),
  ]);
  if (!base) return { title: "News — OnThePixel.net" };
  const tr =
    locale === "en"
      ? undefined
      : findTranslationFor(url, DIRECTUS_LOCALES[locale], allTr);
  const item = applyTranslation(base, tr);
  return {
    title: `${item.title} — OnThePixel.net`,
    description: item.short_description ?? item.text.slice(0, 160),
    openGraph: {
      title: item.title,
      description: item.short_description ?? item.text.slice(0, 160),
      images: item.icon ? [`https://cdn.onthepixel.net/${item.icon}`] : [],
    },
  };
}

export default async function NewsPage({ params }: PageProps) {
  const { url } = await params;
  const { locale, t } = await getServerTranslations();
  const [base, allTr] = await Promise.all([
    getNewsItem(url),
    locale === "en" ? Promise.resolve([]) : getAllNewsTranslations(),
  ]);

  if (!base) notFound();

  const tr =
    locale === "en"
      ? undefined
      : findTranslationFor(url, DIRECTUS_LOCALES[locale], allTr);

  // Non-English locale + no translation: show confirmation page instead of
  // the article content.
  if (locale !== "en" && !tr) {
    return <NotTranslatedNotice url={url} t={t} />;
  }

  const newsItem = applyTranslation(base, tr);
  const textLines = newsItem.text.split("\n");

  return (
    <>
      <TopPage />
      <section className="bg-gray-950 min-h-screen">
        <div className="container mx-auto max-w-3xl px-4 py-10">

          <Link
            href="/#news"
            className="mb-8 inline-flex items-center gap-1.5 text-sm text-white/40 transition-colors duration-200 hover:text-green-400"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            ← {t.news.backToNews}
          </Link>

          {/* Hero image */}
          <div className="relative mb-8 w-full overflow-hidden rounded-xl">
            {newsItem.icon ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`https://cdn.onthepixel.net/${newsItem.icon}?w=900&auto=format`}
                srcSet={`https://cdn.onthepixel.net/${newsItem.icon}?w=600&auto=format 600w, https://cdn.onthepixel.net/${newsItem.icon}?w=900&auto=format 900w, https://cdn.onthepixel.net/${newsItem.icon}?w=1400&auto=format 1400w`}
                sizes="(max-width: 768px) 100vw, 768px"
                alt={newsItem.title}
                className="h-56 w-full object-cover md:h-72"
              />
            ) : (
              <div
                className="relative h-56 w-full overflow-hidden md:h-72"
                style={{
                  background: "linear-gradient(135deg, #0d2b1a 0%, #0a3d1f 50%, #052910 100%)",
                }}
              >
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage: `radial-gradient(circle at 20% 50%, rgba(0,222,109,0.4) 0%, transparent 55%),
                                      radial-gradient(circle at 80% 20%, rgba(0,222,109,0.15) 0%, transparent 40%)`,
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className="select-none text-8xl font-black text-white/[0.04]"
                    style={{ fontFamily: "'Syne', sans-serif" }}
                  >
                    OTP
                  </span>
                </div>
              </div>
            )}
            <div className="absolute bottom-0 left-0 h-20 w-full bg-gradient-to-t from-gray-950 to-transparent" />
          </div>

          {/* Title + date */}
          <div className="mb-8">
            <h1
              className="mb-3 text-2xl font-bold leading-snug md:text-3xl"
              style={{
                fontFamily: "'Syne', sans-serif",
                color: "#00de6d",
                textShadow: "0 0 30px rgba(0,222,109,0.25)",
              }}
            >
              {newsItem.title}
            </h1>
            <div className="flex items-center gap-3">
              <span className="inline-block h-px w-5 rounded-full bg-green-500/50" />
              <span
                className="text-sm text-white/35"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {formatDate(newsItem.date, locale)}
              </span>
            </div>
          </div>

          {/* Article body */}
          <div className="rounded-xl border border-white/5 bg-white/[0.03] p-6 md:p-8">
            <div
              className="leading-relaxed text-white/60"
              style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.9375rem" }}
            >
              {textLines.map((line, lineIndex) => {
                const parts = parseMarkdownLinks(line);
                return (
                  <React.Fragment key={lineIndex}>
                    {parts.map((part, partIndex) => {
                      if (part.type === "link" && part.url && part.text) {
                        return (
                          <a
                            key={partIndex}
                            href={part.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-400 underline decoration-green-500/30 underline-offset-2 transition-colors duration-200 hover:text-green-300 hover:decoration-green-400/60"
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

          <div className="mt-8">
            <Link
              href="/#news"
              className="inline-flex items-center gap-1.5 text-sm text-white/30 transition-colors duration-200 hover:text-green-400"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              ← {t.news.backToNews}
            </Link>
          </div>

        </div>
      </section>
    </>
  );
}

function NotTranslatedNotice({
  url,
  t,
}: {
  url: string;
  t: (typeof translations)[Locale];
}) {
  return (
    <>
      <TopPage />
      <section className="bg-gray-950 min-h-screen">
        <div className="container mx-auto max-w-2xl px-4 py-16">
          <div className="rounded-xl border border-white/5 bg-white/[0.03] p-8 md:p-10 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-400 ring-1 ring-yellow-500/30">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-6"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4" />
                <path d="M12 16h.01" />
              </svg>
            </div>
            <h1
              className="mb-3 text-xl font-bold text-white md:text-2xl"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {t.news.notTranslatedTitle}
            </h1>
            <p
              className="mx-auto mb-8 max-w-md text-sm text-white/50 md:text-base"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {t.news.notTranslatedText}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href={`/en/news/${url}`}
                className="rounded-lg bg-green-700 px-6 py-2.5 font-semibold text-white transition-colors hover:bg-green-600"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {t.news.readInEnglishButton}
              </Link>
              <Link
                href="/#news"
                className="rounded-lg bg-white/5 px-6 py-2.5 font-semibold text-white ring-1 ring-white/10 transition-colors hover:bg-white/10"
                style={{ fontFamily: "'Syne', sans-serif" }}
              >
                {t.news.goBack}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
