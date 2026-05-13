"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaCheck, FaCopy, FaDiscord } from "react-icons/fa6";
import { Trophy, ChevronDown } from "lucide-react";
import { useTranslations } from "@/lib/i18n/LanguageProvider";
import gsap from "gsap";

const SERVER_ADDRESS = "OnThePixel.net";

export default function Header() {
  const t = useTranslations();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [copied, setCopied] = useState(false);

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const ctx = gsap.context(() => {
      const logo = root.querySelector("[data-anim='logo']");
      const title = root.querySelector("[data-anim='title']");
      const tagline = root.querySelector("[data-anim='tagline']");
      const ipPill = root.querySelector("[data-anim='ip']");
      const buttons = root.querySelectorAll("[data-anim='btn']");
      const bg = root.querySelector("[data-anim='bg']");
      const orbs = root.querySelectorAll("[data-anim='orb']");
      const scrollHint = root.querySelector("[data-anim='scroll']");

      if (prefersReduced) {
        gsap.set(
          [logo, title, tagline, ipPill, buttons, bg, orbs, scrollHint],
          { autoAlpha: 1 },
        );
        return;
      }

      gsap.set([logo, title, tagline, ipPill, buttons, scrollHint], {
        autoAlpha: 0,
      });

      const tl = gsap.timeline({
        defaults: { ease: "power3.out", duration: 0.9 },
      });

      tl.fromTo(
        bg,
        { scale: 1.15, autoAlpha: 0.6 },
        { scale: 1, autoAlpha: 1, duration: 1.4, ease: "power2.out" },
      )
        .fromTo(
          logo,
          { y: -30, autoAlpha: 0, scale: 0.85 },
          { y: 0, autoAlpha: 1, scale: 1, duration: 1, ease: "back.out(1.7)" },
          "-=1.0",
        )
        .fromTo(
          title,
          { y: 40, autoAlpha: 0, letterSpacing: "0.4em" },
          { y: 0, autoAlpha: 1, letterSpacing: "0em" },
          "-=0.5",
        )
        .fromTo(
          tagline,
          { y: 20, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.7 },
          "-=0.5",
        )
        .fromTo(
          ipPill,
          { y: 16, autoAlpha: 0, scale: 0.95 },
          { y: 0, autoAlpha: 1, scale: 1, duration: 0.6 },
          "-=0.4",
        )
        .fromTo(
          buttons,
          { y: 24, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.12 },
          "-=0.3",
        )
        .fromTo(
          scrollHint,
          { y: -8, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.6 },
          "-=0.2",
        );

      gsap.to(orbs, {
        y: "+=20",
        x: "+=10",
        duration: 6,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        stagger: { each: 1.4, from: "random" },
      });

      const scrollEl = scrollHint as HTMLElement | null;
      if (scrollEl) {
        gsap.to(scrollEl, {
          y: 8,
          repeat: -1,
          yoyo: true,
          duration: 1.2,
          ease: "sine.inOut",
        });
      }
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-white"
    >
      {/* Background image + overlays */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div data-anim="bg" className="absolute inset-0">
          <Image
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover brightness-[0.55] filter"
            height={1080}
            src="/bc993216-3548-4e87-bb85-bfb349c3d3b3"
            width={1920}
            priority
          />
        </div>

        {/* Floating green orbs */}
        <div
          data-anim="orb"
          className="absolute -top-32 -left-32 h-[28rem] w-[28rem] rounded-full bg-green-500/20 blur-[120px]"
        />
        <div
          data-anim="orb"
          className="absolute -bottom-40 -right-24 h-[32rem] w-[32rem] rounded-full bg-emerald-500/15 blur-[140px]"
        />
        <div
          data-anim="orb"
          className="absolute top-1/3 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-green-400/10 blur-[100px]"
        />

        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "radial-gradient(ellipse at center, black 40%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse at center, black 40%, transparent 75%)",
          }}
        />

        {/* Bottom fade into page */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-gray-950/30 to-gray-950" />
      </div>

      <section className="flex w-full max-w-3xl flex-col items-center text-center">
        <div data-anim="logo" className="relative mb-6">
          <div className="absolute inset-0 -z-10 rounded-full bg-green-500/30 blur-3xl" />
          <Image
            alt="OnThePixel.net logo"
            height={220}
            src="/bf6cf0de-bf69-44d1-b107-6ad846ab7c9e"
            width={220}
            className="drop-shadow-[0_0_30px_rgba(0,222,109,0.35)]"
          />
        </div>

        <h1
          data-anim="title"
          className="mb-4 bg-gradient-to-b from-white via-white to-green-200 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-6xl md:text-7xl"
          style={{
            fontFamily: "'Syne', sans-serif",
            filter: "drop-shadow(0 0 24px rgba(0,222,109,0.25))",
          }}
        >
          OnThePixel.net
        </h1>

        <p
          data-anim="tagline"
          className="mb-7 max-w-xl text-base text-white/70 sm:text-lg"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          {t.hero.tagline}
        </p>

        {/* Server IP pill */}
        <button
          data-anim="ip"
          type="button"
          onClick={() => copyToClipboard(SERVER_ADDRESS)}
          aria-label={t.hero.copyAddress}
          className="group mb-8 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.06] px-5 py-2.5 backdrop-blur-md transition-all duration-200 hover:border-green-400/40 hover:bg-white/[0.09] hover:shadow-[0_0_40px_rgba(0,222,109,0.18)]"
        >
          <span className="h-2 w-2 animate-pulse rounded-full bg-green-400 shadow-[0_0_10px_rgba(0,222,109,0.9)]" />
          <span
            className="font-mono text-sm font-semibold tracking-wider text-white sm:text-base"
            style={{ fontFamily: "'Syne', sans-serif" }}
          >
            {SERVER_ADDRESS}
          </span>
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors duration-200 ${
              copied
                ? "bg-green-500/25 text-green-300"
                : "bg-white/5 text-white/60 group-hover:bg-green-500/15 group-hover:text-green-300"
            }`}
          >
            {copied ? (
              <FaCheck className="h-3 w-3" aria-hidden="true" />
            ) : (
              <FaCopy className="h-3 w-3" aria-hidden="true" />
            )}
          </span>
        </button>

        {/* Primary CTAs */}
        <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
          <Link href="/leaderboard" data-anim="btn">
            <span
              className="group relative inline-flex h-12 min-w-44 items-center justify-center gap-2 overflow-hidden rounded-lg bg-gradient-to-br from-green-500 to-emerald-700 px-6 text-base font-semibold text-white shadow-[0_10px_30px_-10px_rgba(0,222,109,0.6)] transition-all duration-300 hover:shadow-[0_18px_45px_-12px_rgba(0,222,109,0.8)] sm:text-lg"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              <Trophy className="h-5 w-5" aria-hidden="true" />
              {t.hero.leaderboard}
            </span>
          </Link>

          <Link
            href="https://discord.onthepixel.net"
            data-anim="btn"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span
              className="group inline-flex h-12 min-w-44 items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/[0.04] px-6 text-base font-semibold text-white backdrop-blur-md transition-all duration-300 hover:border-green-400/50 hover:bg-white/[0.08] hover:shadow-[0_0_30px_rgba(0,222,109,0.18)] sm:text-lg"
              style={{ fontFamily: "'Syne', sans-serif" }}
            >
              <FaDiscord
                className="h-5 w-5 text-[#8c9eff] transition-transform duration-300 group-hover:scale-110"
                aria-hidden="true"
              />
              {t.hero.discord}
            </span>
          </Link>
        </div>
      </section>

      {/* Scroll hint */}
      <div
        data-anim="scroll"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/40"
        aria-hidden="true"
      >
        <ChevronDown className="h-6 w-6" />
      </div>
    </div>
  );
}
