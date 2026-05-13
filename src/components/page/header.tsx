"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FaCheck, FaCopy } from "react-icons/fa6";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      const ip = root.querySelector("[data-anim='ip']");
      const buttons = root.querySelectorAll("[data-anim='btn']");
      const bg = root.querySelector("[data-anim='bg']");
      const scrollHint = root.querySelector("[data-anim='scroll']");

      if (prefersReduced) {
        gsap.set([logo, title, tagline, ip, buttons, bg, scrollHint], {
          autoAlpha: 1,
        });
        return;
      }

      gsap.set([logo, title, tagline, ip, buttons, scrollHint], {
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
          { y: 30, autoAlpha: 0 },
          { y: 0, autoAlpha: 1 },
          "-=0.5",
        )
        .fromTo(
          tagline,
          { y: 20, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.7 },
          "-=0.5",
        )
        .fromTo(
          ip,
          { y: 16, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.6 },
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
      className="relative flex min-h-screen flex-col items-center justify-center px-4 text-white"
    >
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div data-anim="bg" className="absolute inset-0">
          <Image
            alt=""
            aria-hidden="true"
            className="h-full w-full object-cover brightness-75 filter"
            height="1080"
            src="/bc993216-3548-4e87-bb85-bfb349c3d3b3"
            width="1920"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-950" />
      </div>

      <main className="flex flex-col items-center text-center">
        <div data-anim="logo" className="relative mb-4">
          <Image
            alt="Logo"
            height="100"
            src="/bf6cf0de-bf69-44d1-b107-6ad846ab7c9e"
            style={{ aspectRatio: "100/100", objectFit: "cover" }}
            width="250"
          />
        </div>

        <h1
          data-anim="title"
          className="mb-4 text-4xl font-bold sm:text-5xl md:text-6xl"
          style={{ color: "#fff" }}
        >
          OnThePixel.net
        </h1>

        <p data-anim="tagline" className="mb-6 text-white/75">
          {t.hero.tagline}
        </p>

        <button
          data-anim="ip"
          type="button"
          onClick={() => copyToClipboard(SERVER_ADDRESS)}
          aria-label={t.hero.copyAddress}
          className="mb-8 inline-flex items-center gap-2 text-white/80 transition-colors hover:text-white"
        >
          <span className="font-mono text-sm sm:text-base">
            {SERVER_ADDRESS}
          </span>
          {copied ? (
            <FaCheck
              className="h-3.5 w-3.5 text-green-400"
              aria-hidden="true"
            />
          ) : (
            <FaCopy className="h-3.5 w-3.5" aria-hidden="true" />
          )}
        </button>

        <div className="flex flex-col items-stretch gap-3 sm:flex-row">
          <Link href="/leaderboard" data-anim="btn">
            <Button className="flex h-12 w-full items-center justify-center bg-green-700 px-6 text-lg text-white transition-transform duration-500 hover:scale-105 sm:w-44 md:text-xl">
              {t.hero.leaderboard}
            </Button>
          </Link>
          <Link
            href="https://discord.onthepixel.net"
            data-anim="btn"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="flex h-12 w-full items-center justify-center bg-green-700 px-6 text-lg text-white transition-transform duration-500 hover:scale-105 sm:w-44 md:text-xl">
              {t.hero.discord}
            </Button>
          </Link>
        </div>
      </main>

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
