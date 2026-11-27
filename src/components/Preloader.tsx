"use client";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { lenisRef } from "./SmoothScroll";

const TOTAL = 24;
let played = false; // the preloader runs once per visit, not every time someone comes back to Home

/** Fired the moment the preloader starts lifting away. The hero headline and the nav bar wait for it, so they arrive as the curtain rises. */
export const INTRO_EVENT = "intro:go";
export const introDone = () => played;

/** True once the intro is out of the way. Pass `wait=false` on pages with no preloader. Read at mount: later changes of `wait` are ignored. */
export function useIntroReady(wait: boolean) {
  const [ready, setReady] = useState(() => !wait || played);
  useEffect(() => {
    if (ready) return;
    const go = () => setReady(true);
    addEventListener(INTRO_EVENT, go);
    const t = setTimeout(go, 7000); // never leave the bar hidden if the preloader never finishes
    return () => { removeEventListener(INTRO_EVENT, go); clearTimeout(t); };
  }, [ready]);
  return ready;
}

export function Preloader() {
  const [pct, setPct] = useState(0);
  const [show, setShow] = useState(() => !played);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (played) return;
    let dead = false, finished = false, n = 0;
    lenisRef.current?.stop();
    document.documentElement.style.overflow = "hidden";
    const timers: ReturnType<typeof setTimeout>[] = [];
    const finish = () => {
      if (dead || finished) return;
      finished = true; played = true; setPct(100);
      // 1) the logo and counter ease away, 2) the panel lifts and, in the same instant, the hero + nav are told to start
      timers.push(setTimeout(() => { if (!dead) setLeaving(true); }, 250));
      timers.push(setTimeout(() => {
        if (dead) return;
        setShow(false); document.documentElement.style.overflow = ""; lenisRef.current?.start();
        window.dispatchEvent(new Event(INTRO_EVENT));
      }, 600));
    };
    for (let i = 0; i < TOTAL; i++) {
      const im = new Image();
      const bump = () => { if (dead) return; n++; setPct(Math.round((n / TOTAL) * 100)); if (n >= TOTAL) finish(); };
      im.onload = bump; im.onerror = bump; im.src = `/frames/hero-${1000 + i}.webp`;
    }
    const t = setTimeout(finish, 4500); // never trap the visitor on a slow connection
    return () => { dead = true; clearTimeout(t); timers.forEach(clearTimeout); document.documentElement.style.overflow = ""; lenisRef.current?.start(); };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div exit={{ y: "-100%" }} transition={{ duration: 0.95, ease: [0.76, 0, 0.24, 1] }} className="fixed inset-0 z-[200] grid place-items-center bg-char text-cream">
          <div className={`flex flex-col items-center transition-all duration-300 ease-in ${leaving ? "-translate-y-3 scale-95 opacity-0" : ""}`}>
            <span className="logo w-44 sm:w-56" role="img" aria-label="ARCH-AID" />
            <div className="mt-8 h-px w-48 bg-white/20"><div className="h-full bg-acc transition-[width] duration-300" style={{ width: `${pct}%` }} /></div>
            <p className="mt-4 text-xs tabular-nums tracking-[.3em] text-white/60">{String(pct).padStart(3, "0")}</p>
          </div>
          {/* gold leading edge, same language as the page-to-page wipe */}
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-[3px] bg-acc" />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
