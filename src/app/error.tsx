"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="flex min-h-screen flex-col items-center justify-center bg-gray-950 px-4 text-center">
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500&display=swap');`}</style>

      <p
        className="mb-4 text-8xl font-black text-white/5 select-none"
        style={{ fontFamily: "'Syne', sans-serif" }}
      >
        500
      </p>

      <h1
        className="mb-3 text-2xl font-bold text-white md:text-3xl"
        style={{ fontFamily: "'Syne', sans-serif", color: "#00de6d", textShadow: "0 0 30px rgba(0,222,109,0.3)" }}
      >
        Something went wrong
      </h1>

      <p
        className="mb-8 max-w-sm text-white/40"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        An unexpected error occurred. Try again or return to the home page.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-green-700 px-6 py-2.5 font-semibold text-white transition-colors hover:bg-green-600"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-lg bg-white/5 px-6 py-2.5 font-semibold text-white ring-1 ring-white/10 transition-colors hover:bg-white/10"
          style={{ fontFamily: "'Syne', sans-serif" }}
        >
          Go home
        </Link>
      </div>
    </section>
  );
}
