"use client";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { EASE } from "./Reveal";
import { lenisRef } from "./SmoothScroll";

const TOTAL = 24;
let played = false; // the preloader runs once per visit, not every time someone comes back to Home

export function Preloader() {
  const [pct, setPct] = useState(0);
  const [show, setShow] = useState(() => !played);

  useEffect(() => {
    if (played) return;
    let dead = false, finished = false, n = 0;
    lenisRef.current?.stop();
    document.documentElement.style.overflow = "hidden";
    const finish = () => {
      if (dead || finished) return;
      finished = true; played = true; setPct(100);
      setTimeout(() => { if (dead) return; setShow(false); document.documentElement.style.overflow = ""; lenisRef.current?.start(); }, 350);
    };
    for (let i = 0; i < TOTAL; i++) {
      const im = new Image();
      const bump = () => { if (dead) return; n++; setPct(Math.round((n / TOTAL) * 100)); if (n >= TOTAL) finish(); };
      im.onload = bump; im.onerror = bump; im.src = `/frames/hero-${1000 + i}.webp`;
    }
    const t = setTimeout(finish, 4500); // never trap the visitor on a slow connection
    return () => { dead = true; clearTimeout(t); document.documentElement.style.overflow = ""; lenisRef.current?.start(); };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div exit={{ y: "-100%" }} transition={{ duration: 1, ease: EASE }} className="fixed inset-0 z-[200] grid place-items-center bg-char text-cream">
          <div className="flex flex-col items-center">
            <span className="logo w-44 sm:w-56" role="img" aria-label="ARCH-AID" />
            <div className="mt-8 h-px w-48 bg-white/20"><div className="h-full bg-acc transition-[width] duration-300" style={{ width: `${pct}%` }} /></div>
            <p className="mt-4 text-xs tabular-nums tracking-[.3em] text-white/60">{String(pct).padStart(3, "0")}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
