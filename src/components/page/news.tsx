import React from "react";
import Link from "next/link";

interface NewsItem {
  title: string;
  date: string;
  short_description: string;
  url: string;
  icon_url: string | null;
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

const FALLBACK_GRADIENTS = [
  "linear-gradient(135deg, #0d2b1a 0%, #0a3d1f 50%, #052910 100%)",
  "linear-gradient(135deg, #0a1f2e 0%, #0d3347 50%, #041520 100%)",
  "linear-gradient(135deg, #1a1a0d 0%, #2b2b0a 50%, #101005 100%)",
];

function NewsCard({
  item,
  index,
  featured,
}: {
  item: NewsItem;
  index: number;
  featured?: boolean;
}) {
  const fallback = FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length];

  return (
    <Link href={`/news/${item.url}`} className="group block h-full">
      <article className="relative flex h-full flex-col overflow-hidden rounded-xl border border-white/5 bg-white/[0.03] transition-all duration-300 hover:border-green-500/30 hover:bg-white/[0.05] hover:shadow-[0_0_0_1px_rgba(0,222,109,0.15),0_12px_40px_rgba(0,222,109,0.07)]">
        {/* Top glow line */}
        <div className="pointer-events-none absolute left-0 top-0 z-10 h-0.5 w-full origin-left scale-x-0 bg-gradient-to-r from-green-400 via-green-500 to-transparent transition-transform duration-300 group-hover:scale-x-100" />

        {/* Image area */}
        <div className={`relative w-full shrink-0 overflow-hidden ${featured ? "h-52 md:h-64" : "h-40"}`}>
          {item.icon_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.icon_url}
              alt={item.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div
              className="h-full w-full transition-transform duration-500 group-hover:scale-105"
              style={{ background: fallback }}
            >
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `radial-gradient(circle at 20% 50%, rgba(0,222,109,0.3) 0%, transparent 50%),
                                    radial-gradient(circle at 80% 20%, rgba(0,222,109,0.15) 0%, transparent 40%)`,
                }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className="select-none text-5xl font-black text-white/5"
                  style={{ fontFamily: "'Syne', sans-serif" }}
                >
                  OTP
                </span>
              </div>
            </div>
          )}

          <div className="absolute bottom-0 left-0 h-16 w-full bg-gradient-to-t from-gray-950/80 to-transparent" />

          <div className="absolute bottom-3 left-4">
            <span
              className="rounded-md bg-black/50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-green-400 backdrop-blur-sm"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {formatDate(item.date)}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-2 p-5">
          <div className="flex items-start justify-between gap-3">
            <h3
              className={`font-bold leading-snug text-white transition-colors duration-200 group-hover:text-green-400 group-hover:[text-shadow:0_0_20px_rgba(0,222,109,0.2)] ${
                featured ? "text-xl md:text-2xl" : "text-base"
              }`}
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              {item.title}
            </h3>
            <span className="mt-0.5 shrink-0 text-white/20 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-green-400">
              →
            </span>
          </div>
          <p
            className={`leading-relaxed text-white/45 transition-colors duration-200 group-hover:text-white/60 ${
              featured ? "text-sm md:text-base" : "line-clamp-2 text-sm"
            }`}
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {item.short_description}
          </p>
        </div>
      </article>
    </Link>
  );
}

async function getNews(): Promise<NewsItem[]> {
  try {
    const response = await fetch("https://cms.onthepixel.net/items/News", {
      next: { revalidate: 300 },
    });
    if (!response.ok) return [];
    const data = await response.json();
    return (data.data || []).sort(
      (a: NewsItem, b: NewsItem) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } catch {
    return [];
  }
}

export default async function News() {
  const newsItems = await getNews();
  const featured = newsItems[0] ?? null;
  const rest = newsItems.slice(1, 3);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500&display=swap');
      `}</style>

      <section className="bg-gray-950 py-10 px-4">
        <div className="container mx-auto px-4 py-10">
          <div className="mb-8">
            <h2
              id="news"
              className="text-3xl font-bold tracking-tight text-white"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              NEWS
            </h2>
          </div>

          {newsItems.length === 0 ? (
            <div className="rounded-xl border border-white/5 bg-white/[0.02] px-6 py-12 text-center">
              <p className="text-sm text-white/30" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                No news available at the moment.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {featured && <NewsCard item={featured} index={0} featured />}
              {rest.length > 0 && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {rest.map((item, i) => (
                    <NewsCard key={i} item={item} index={i + 1} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
