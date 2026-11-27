"use client";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { createElement, useRef } from "react";

export const EASE: [number, number, number, number] = [0.2, 0.7, 0.2, 1];

/**
 * Scroll-scrubbed progress (0 → 1) for an element: 0 while its top is at/below `from`% of the viewport
 * height, 1 once its top has risen to `to`%. It is tied to scroll position, so scrolling back up plays
 * the animation in reverse, on screen, at the same pace you scroll.
 */
export function useRevealProgress(ref: React.RefObject<HTMLElement | null>, from = 96, to = 68): MotionValue<number> {
  const { scrollYProgress } = useScroll({ target: ref, offset: [`start ${from}%`, `start ${to}%`] });
  const reduce = useReducedMotion();
  const done = useTransform(scrollYProgress, () => 1);
  return reduce ? done : scrollYProgress;
}

const ease = (t: number) => 1 - Math.pow(1 - t, 3);

export function Reveal({ children, delay = 0, className }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const d = delay * 40;
  const p = useRevealProgress(ref, 96 - d, 68 - d);
  const opacity = useTransform(p, (v) => ease(v));
  const y = useTransform(p, (v) => (1 - ease(v)) * 28);
  return <motion.div ref={ref} className={className} style={{ opacity, y }}>{children}</motion.div>;
}

function Word({ w, i, n, p }: { w: string; i: number; n: number; p: MotionValue<number> }) {
  const s = (i / n) * 0.5;
  const y = useTransform(p, (v) => `${(1 - ease(Math.min(1, Math.max(0, (v - s) / 0.5)))) * 110}%`);
  return (
    <>
      <span className="-mb-[.15em] inline-block overflow-hidden pb-[.15em] align-bottom">
        <motion.span className="inline-block" style={{ y }}>{w}</motion.span>
      </span>{" "}
    </>
  );
}

/** Headline that rises word-by-word out of a mask, and drops back in as you scroll up. */
export function Words({ children, className, as = "h2" }: { children: string; className?: string; as?: "h1" | "h2" | "h3" }) {
  const words = children.split(" ");
  const ref = useRef<HTMLElement>(null);
  const p = useRevealProgress(ref, 92, 58);
  const inner = <span aria-hidden className="inline">{words.map((w, i) => <Word key={i} w={w} i={i} n={words.length} p={p} />)}</span>;
  return createElement(as, { ref, className, "aria-label": children }, inner);
}

/**
 * Image that unmasks as it enters (and re-masks as you scroll back up), and drifts slowly while on screen.
 * `drift` = how far it floats, in % (the picture is enlarged just enough to cover it). Use a small value for photos that should not be cropped much.
 */
export function ImageReveal({ children, className = "", drift = 7 }: { children: React.ReactNode; className?: string; drift?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const d = reduce ? 0 : drift;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${d}%`, `${d}%`]);
  const p = useRevealProgress(ref, 100, 55);
  const clipPath = useTransform(p, (v) => { const k = 1 - ease(v); return `inset(${14 * k}% ${10 * k}% ${14 * k}% ${10 * k}%)`; });
  const opacity = useTransform(p, (v) => ease(v));
  return (
    <motion.div ref={ref} className={`relative overflow-hidden ${className}`} style={{ clipPath, opacity }}>
      <motion.div style={{ y, scale: 1 + (d * 2) / 100 + 0.02 }} className="absolute inset-0">{children}</motion.div>
    </motion.div>
  );
}

/** Full-bleed background picture (put it inside a `relative overflow-hidden` section) that slides slowly against the scroll. */
export function Parallax({ children, drift = 8 }: { children: React.ReactNode; drift?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const d = reduce ? 0 : drift;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${d}%`, `${d}%`]);
  return (
    <div ref={ref} aria-hidden className="absolute inset-0 overflow-hidden">
      <motion.div style={{ y, scale: 1 + (d * 2) / 100 + 0.02 }} className="absolute inset-0">{children}</motion.div>
    </div>
  );
}
