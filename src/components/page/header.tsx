"use client";
import { useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { FaCopy } from "react-icons/fa6";
import { useTranslations } from "@/lib/i18n/LanguageProvider";
import gsap from "gsap";

export default function Header() {
  const t = useTranslations();
  const rootRef = useRef<HTMLDivElement | null>(null);

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
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
      const buttons = root.querySelectorAll("[data-anim='btn']");
      const bg = root.querySelector("[data-anim='bg']");

      if (prefersReduced) {
        gsap.set([logo, title, tagline, buttons, bg], { autoAlpha: 1 });
        return;
      }

      gsap.set([logo, title, tagline, buttons], { autoAlpha: 0 });

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
          buttons,
          { y: 24, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.12 },
          "-=0.3",
        );

      const titleEl = title as HTMLElement | null;
      if (titleEl) {
        gsap.to(titleEl, {
          textShadow:
            "0 0 25px rgba(255,255,255,0.9), 0 0 50px rgba(0,222,109,0.35)",
          repeat: -1,
          yoyo: true,
          duration: 2.4,
          ease: "sine.inOut",
          delay: 2,
        });
      }
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      key="1"
      className="relative flex min-h-screen flex-col items-center justify-center text-white"
    >
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div data-anim="bg" className="absolute inset-0">
          <Image
            alt="Background Image"
            className="h-full w-full object-cover brightness-75 filter"
            height="1080"
            src="/67971722-5ba1-4e3d-8788-c5a6ccbe042e"
            width="1920"
          />
        </div>
        <div className="absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-950" />
      </div>
      <main className="flex flex-col items-center">
        <div data-anim="logo" className="relative mb-4">
          <Image
            alt="Logo"
            height="100"
            src="/bf6cf0de-bf69-44d1-b107-6ad846ab7c9e"
            style={{
              aspectRatio: "100/100",
              objectFit: "cover",
            }}
            width="250"
          />
        </div>
        <h1
          data-anim="title"
          className="mb-4 text-4xl font-bold sm:text-5xl md:text-6xl"
          style={{
            color: "#fff",
            textShadow: "0 0 15px #fff",
          }}
        >
          OnThePixel.net
        </h1>
        <p data-anim="tagline" className="mb-8 text-center">
          {t.hero.tagline}
        </p>
        <div className="flex space-x-4">
          <Link href="/leaderboard" data-anim="btn">
            <Button className="flex h-12 w-36 items-center bg-green-700 px-4 py-2 text-lg text-white transition-transform duration-500 hover:scale-105 sm:w-40 sm:px-6 sm:text-xl md:w-48 md:text-2xl">
              {t.hero.leaderboard}
            </Button>
          </Link>
          <Button
            data-anim="btn"
            className="flex size-12 items-center rounded bg-green-700 px-4 py-2"
            onClick={() => copyToClipboard("OnThePixel.net")}
            aria-label={t.hero.copyAddress}
          >
            <FaCopy className="size-20 text-white" aria-hidden="true" />
          </Button>
          <Link href="https://discord.onthepixel.net" data-anim="btn">
            <Button className="flex h-12 w-36 items-center bg-green-700 px-4 py-2 text-lg text-white transition-transform duration-500 hover:scale-105 sm:w-40 sm:px-6 sm:text-xl md:w-48 md:text-2xl">
              {t.hero.discord}
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
