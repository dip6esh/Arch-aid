"use client";
import { useEffect, useState } from "react";
import { lenisRef } from "./SmoothScroll";

/** Floating "back to top" button; appears once the visitor has scrolled past the first screen. */
export function ScrollTop() {
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const upd = () => setVis(scrollY > innerHeight);
    addEventListener("scroll", upd, { passive: true }); upd();
    return () => removeEventListener("scroll", upd);
  }, []);
  const up = () => {
    const l = lenisRef.current;
    if (l) l.scrollTo(0, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
    else scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <button
      onClick={up}
      aria-label="Scroll to top"
      tabIndex={vis ? 0 : -1}
      className={`fixed bottom-24 right-4 z-40 grid size-12 place-items-center rounded-full border border-white/15 bg-char/90 text-cream shadow-2xl backdrop-blur-xl transition-all duration-500 hover:bg-acc lg:bottom-8 lg:right-6 ${vis ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"}`}
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 19V5M5 12l7-7 7 7" /></svg>
    </button>
  );
}
