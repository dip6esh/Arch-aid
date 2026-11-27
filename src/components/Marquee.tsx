"use client";
import { useRef } from "react";
import { reduced, useDrive } from "./Drive";

const T = ["Residential", "Hospitality", "Corporate", "Retail", "Specialised Interiors", "Architecture", "Landscape"];

/** Bold tilted ticker band between the hero and the first section. Drifts left on its own; drag it either way. */
export function Marquee() {
  const band = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const half = () => (track.current?.scrollWidth ?? 0) / 2;
  useDrive(track, {
    grab: band,
    base: () => (reduced() ? 0 : -half() / 32), // one loop every 32s, same as before
    delta: (e, p) => e.clientX - p.clientX,
    apply: (pos) => {
      const w = half(); if (!w) return pos;
      pos %= w; if (pos > 0) pos -= w; // seamless loop in both directions
      if (track.current) track.current.style.transform = `translate3d(${pos}px,0,0)`;
      return pos;
    },
  });
  const row = T.map((t) => (
    <span key={t} className="flex items-center gap-8 pr-8"><span>{t}</span><span className="text-[.5em] text-char/60">✦</span></span>
  ));
  return (
    <div aria-hidden className="overflow-hidden py-6 sm:py-12">
      <div ref={band} data-cursor="Drag" className="relative left-1/2 w-[112%] -translate-x-1/2 -rotate-[1deg] cursor-grab select-none overflow-hidden bg-acc py-3 text-char [touch-action:pan-y] sm:py-4">
        <div ref={track} className="flex w-max whitespace-nowrap font-serif text-[clamp(2rem,5vw,4.5rem)] italic leading-none will-change-transform">{row}{row}</div>
      </div>
    </div>
  );
}
