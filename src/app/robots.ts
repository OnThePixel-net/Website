import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/i18n/seo";

// Dashboard pages are also marked noindex via metadata, but keeping them
// out of `disallow` too saves crawl budget by stopping bots from fetching
// them at all.
const DISALLOW = ["/api/", "/apply/api/", "/redeem/api/", "/dashboard/"];

// AI/answer-engine crawlers that should be explicitly allowed so
// OnThePixel.net can be cited/surfaced in AI answers. Each gets its own
// rule (rather than relying on the `*` rule) so it stays allowed even if
// a crawler's default behavior for unlisted user agents ever changes.
const AI_USER_AGENTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "meta-externalagent",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: DISALLOW,
      },
      ...AI_USER_AGENTS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: DISALLOW,
      })),
    ],
    // llms.txt (an AI-crawler-friendly summary of the site) lives at
    // /llms.txt. MetadataRoute.Robots has no field for it, so it's only
    // referenced here as a comment.
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
