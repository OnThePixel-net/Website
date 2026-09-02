"use client";

import { LocaleLink } from "@/components/LocaleLink";
import { useEffect } from "react";
import { useTranslations } from "@/lib/i18n/LanguageProvider";

/**
 * The branded 500 screen, together with the logging and the retry button an
 * error boundary needs.
 *
 * There are two boundaries and they cannot be one file: the public site and
 * the dashboard sit in sibling route groups, so an `error.tsx` in either one
 * covers only that group. Both re-export this component, which keeps a failure
 * in an admin page looking exactly like a failure anywhere else on the site.
 */
export default function ErrorScreen({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="flex min-h-screen flex-col items-center justify-center bg-gray-950 px-4 text-center">
      <p
        className="mb-4 text-8xl font-black text-white/5 select-none"
        style={{ fontFamily: "'Syne', sans-serif" }}
      >
        500
      </p>

      <h1
        className="mb-3 text-2xl font-bold text-white md:text-3xl"
        style={{
          fontFamily: "'Syne', sans-serif",
          color: "#00de6d",
          textShadow: "0 0 30px rgba(0,222,109,0.3)",
        }}
      >
        {t.error.heading}
      </h1>

      <p
        className="mb-8 max-w-sm text-white/40"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        {t.error.description}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-green-700 px-6 py-2.5 font-semibold text-white transition-colors hover:bg-green-600"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          {t.common.tryAgain}
        </button>
        <LocaleLink
          href="/"
          className="rounded-lg bg-white/5 px-6 py-2.5 font-semibold text-white ring-1 ring-white/10 transition-colors hover:bg-white/10"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          {t.error.goHome}
        </LocaleLink>
      </div>
    </section>
  );
}
