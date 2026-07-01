import React from "react";
import Link from "next/link";
import TopPage from "@/components/page/top";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getServerTranslations, getServerLocale } from "@/lib/i18n/server";
import {
  buildLocalizedMetadata,
  SITE_NAME,
  SITE_URL,
  DEFAULT_OG_IMAGE,
} from "@/lib/i18n/seo";
import { Locale, translations } from "@/lib/i18n/translations";
import { getDb, schema } from "@/lib/db";
import { ensureTable } from "@/lib/db/migrate";
import { eq } from "drizzle-orm";

interface Translation {
  title: string;
  short_description: string;
  content: string;
}

interface NewsItem {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  content: string;
  image_url: string | null;
  published_at: string;
  author: string;
  translations: Record<string, Translation>;
}

interface PageProps {
  params: Promise<{ url: string }>;
}

function formatDate(dateStr: string, locale: Locale): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString(locale === "de" ? "de-DE" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function estimateReadTime(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
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

function toISODate(dateStr: string): string | undefined {
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
}

async function getNewsItem(slug: string): Promise<NewsItem | null> {
  try {
    await ensureTable();
    const db = getDb();
    const [item] = await db.select().from(schema.news).where(eq(schema.news.slug, slug)).limit(1);
    if (!item) return null;

    const trs = await db.select().from(schema.newsTranslations).where(eq(schema.newsTranslations.news_id, item.id));
    return {
      ...item,
      translations: trs.reduce<Record<string, Translation>>(
        (acc, tr) => {
          acc[tr.language] = { title: tr.title, short_description: tr.short_description, content: tr.content };
          return acc;
        },
        {},
      ),
    };
  } catch {
    return null;
  }
}

function resolveContent(item: NewsItem, locale: Locale): { title: string; short_description: string; content: string } {
  if (locale === "en") {
    return { title: item.title, short_description: item.short_description, content: item.content };
  }
  const tr = item.translations?.[locale];
  return {
    title: tr?.title?.trim() ? tr.title : item.title,
    short_description: tr?.short_description?.trim() ? tr.short_description : item.short_description,
    content: tr?.content?.trim() ? tr.content : item.content,
  };
}

export async function generateStaticParams() {
  try {
    await ensureTable();
    const db = getDb();
    const items = await db.select({ slug: schema.news.slug }).from(schema.news);
    return items.map((i) => ({ url: i.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { url } = await params;
  const locale = await getServerLocale();
  const item = await getNewsItem(url);
  if (!item) return { title: "News — OnThePixel.net" };

  const resolved = resolveContent(item, locale);
  const description = (resolved.short_description || resolved.content.slice(0, 160)).trim();

  return buildLocalizedMetadata({
    locale,
    path: `/news/${url}`,
    title: resolved.title,
    description,
    type: "article",
    publishedTime: toISODate(item.published_at),
    image: item.image_url ?? undefined,
    imageAlt: resolved.title,
  });
}

export default async function NewsPage({ params }: PageProps) {
  const { url } = await params;
  const { locale, t } = await getServerTranslations();
  const item = await getNewsItem(url);

  if (!item) notFound();

  const hasTranslation = locale === "en" || !!(item.translations?.[locale]?.content?.trim() || item.translations?.[locale]?.title?.trim());

  if (locale !== "en" && !hasTranslation) {
    return <NotTranslatedNotice url={url} t={t} />;
  }

  const resolved = resolveContent(item, locale);
  const textLines = resolved.content.split("\n");
  const readTime = estimateReadTime(resolved.content);

  const canonicalUrl =
    locale === "en"
      ? `${SITE_URL}/news/${url}`
      : `${SITE_URL}/${locale}/news/${url}`;

  const articleDescription = (resolved.short_description || resolved.content.slice(0, 160)).trim();
  const publishedIso = toISODate(item.published_at);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: resolved.title,
    description: articleDescription,
    image: item.image_url ? [item.image_url] : [DEFAULT_OG_IMAGE],
    ...(publishedIso ? { datePublished: publishedIso, dateModified: publishedIso } : {}),
    inLanguage: locale === "de" ? "de-DE" : "en-US",
    mainEntityOfPage: { "@type": "WebPage", "@id": canonicalUrl },
    author: item.author
      ? { "@type": "Person", name: item.author }
      : { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: DEFAULT_OG_IMAGE },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <TopPage />
      <section className="bg-gray-950 min-h-screen">
        <div className="container mx-auto max-w-3xl px-4 py-10">

          {/* Back link */}
          <Link
            href="/#news"
            className="mb-8 inline-flex items-center gap-1.5 text-sm text-white/40 transition-colors duration-200 hover:text-green-400"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            ← {t.news.backToNews}
          </Link>

          {/* Hero image */}
          <div className="relative mb-8 w-full overflow-hidden rounded-2xl">
            {item.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.image_url}
                alt={resolved.title}
                width={900}
                height={506}
                fetchPriority="high"
                loading="eager"
                decoding="async"
                className="h-56 w-full object-cover md:h-80"
              />
            ) : (
              <div
                className="relative h-56 w-full overflow-hidden md:h-80"
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
            <div className="absolute bottom-0 left-0 h-24 w-full bg-gradient-to-t from-gray-950 to-transparent" />
          </div>

          {/* Title */}
          <h1
            className="mb-5 text-2xl font-bold leading-snug md:text-4xl"
            style={{
              fontFamily: "'Syne', sans-serif",
              color: "#00de6d",
              textShadow: "0 0 30px rgba(0,222,109,0.25)",
            }}
          >
            {resolved.title}
          </h1>

          {/* Meta row: author + date + read time */}
          <div className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-2">
            {item.author && (
              <div className="flex items-center gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://api.mcskin.me/head/${encodeURIComponent(item.author)}?size=128`}
                  alt={item.author}
                  width={28}
                  height={28}
                  className="h-7 w-7 rounded-full object-cover"
                />
                <span
                  className="text-sm font-medium text-white/70"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                >
                  {item.author}
                </span>
              </div>
            )}
            {item.author && (
              <span className="h-4 w-px bg-white/10" />
            )}
            <div className="flex items-center gap-1.5">
              <span className="inline-block h-px w-4 rounded-full bg-green-500/50" />
              <span
                className="text-sm text-white/35"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {formatDate(item.published_at, locale)}
              </span>
            </div>
            <span className="h-4 w-px bg-white/10" />
            <span
              className="text-xs text-white/25"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {readTime} min read
            </span>
          </div>

          {/* Short description / lead */}
          {resolved.short_description && (
            <p
              className="mb-8 rounded-xl border-l-2 border-green-500/40 bg-green-500/[0.04] px-5 py-4 text-base leading-relaxed text-white/60"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {resolved.short_description}
            </p>
          )}

          {/* Article body */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-6 md:p-8">
            <div
              className="leading-relaxed text-white/65"
              style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.9375rem" }}
            >
              {textLines.map((line, lineIndex) => {
                if (line.trim() === "") {
                  return <div key={lineIndex} className="h-4" />;
                }
                const parts = parseMarkdownLinks(line);
                return (
                  <p key={lineIndex} className="mb-2">
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
                  </p>
                );
              })}
            </div>
          </div>

          {/* Author card */}
          {item.author && (
            <div className="mt-8 flex items-center gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://api.mcskin.me/pfp/${encodeURIComponent(item.author)}?size=128`}
                alt={item.author}
                width={48}
                height={48}
                className="h-12 w-12 shrink-0 rounded-full object-cover"
              />
              <div>
                <p
                  className="text-xs font-semibold uppercase tracking-wider text-white/25"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  {locale === "de" ? "Geschrieben von" : "Written by"}
                </p>
                <p
                  className="text-base font-semibold text-white"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  {item.author}
                </p>
              </div>
            </div>
          )}

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
