"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type Direction = "up" | "down" | "left" | "right" | "fade";

interface RevealProps {
  children: React.ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  distance?: number;
  stagger?: number;
  start?: string;
  className?: string;
  staggerChildren?: boolean;
}

const OFFSETS: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: 40 },
  down: { x: 0, y: -40 },
  left: { x: 40, y: 0 },
  right: { x: -40, y: 0 },
  fade: { x: 0, y: 0 },
};

export default function Reveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.9,
  distance,
  stagger = 0.1,
  start = "top 85%",
  className,
  staggerChildren = false,
}: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) {
      gsap.set(el, { autoAlpha: 1 });
      return;
    }

    const targets: Element[] = staggerChildren
      ? Array.from(el.children)
      : [el];

    const base = OFFSETS[direction];
    const mult = distance !== undefined ? distance / 40 : 1;

    gsap.set(targets, {
      autoAlpha: 0,
      x: base.x * mult,
      y: base.y * mult,
    });

    const tween = gsap.to(targets, {
      autoAlpha: 1,
      x: 0,
      y: 0,
      duration,
      delay,
      stagger,
      ease: "power3.out",
      scrollTrigger: {
        trigger: el,
        start,
        toggleActions: "play none none none",
      },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [direction, delay, duration, distance, stagger, start, staggerChildren]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
