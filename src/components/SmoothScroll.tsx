"use client";
import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

/** Shared handle so overlays (preloader, viewer) can pause page scrolling. */
export const lenisRef: { current: Lenis | null } = { current: null };

export function SmoothScroll() {
  const path = usePathname();
  useEffect(() => { lenisRef.current?.scrollTo(0, { immediate: true }); }, [path]); // every page opens at its top
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({ lerp: 0.09 }); // touch devices keep native momentum scrolling
    lenisRef.current = lenis;
    let id = requestAnimationFrame(function raf(t) { lenis.raf(t); id = requestAnimationFrame(raf); });
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest<HTMLAnchorElement>('a[href^="#"]');
      const h = a?.getAttribute("href");
      if (!a || !h || h === "#") return;
      const el = document.querySelector<HTMLElement>(h);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
    };
    document.addEventListener("click", onClick);
    return () => { document.removeEventListener("click", onClick); cancelAnimationFrame(id); lenis.destroy(); lenisRef.current = null; };
  }, []);
  return null;
}
