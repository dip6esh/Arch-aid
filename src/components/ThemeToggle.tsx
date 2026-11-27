"use client";
import { useEffect, useState, type MouseEvent } from "react";
import { flushSync } from "react-dom";

let busy = 0; // reveals in flight (a second click replaces the first, so count them)

/** Light / dark switch. The choice is saved in localStorage; the first visit follows the system setting (see THEME_INIT in layout.tsx). */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [dark, setDark] = useState<boolean | null>(null);
  useEffect(() => { setDark(document.documentElement.dataset.theme === "dark"); }, []);

  const toggle = (e: MouseEvent<HTMLButtonElement>) => {
    const next = !dark;
    const apply = () => {
      flushSync(() => setDark(next));
      document.documentElement.dataset.theme = next ? "dark" : "light";
      try { localStorage.setItem("theme", next ? "dark" : "light"); } catch {}
    };
    // The new theme spreads out from the button as a circle (View Transitions API). Browsers without it, and reduced-motion visitors, just switch.
    const doc = document as Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void>; finished: Promise<void> } };
    if (!doc.startViewTransition || matchMedia("(prefers-reduced-motion: reduce)").matches) { apply(); return; }
    const r = e.currentTarget.getBoundingClientRect();
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    const reach = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)); // far enough to cover the farthest corner
    // Everything that moves on its own holds still while the reveal plays (see `switching` in Drive.tsx and globals.css)
    const root = document.documentElement;
    busy++; root.setAttribute("data-theme-switching", "");
    const done = () => { if (--busy <= 0) { busy = 0; root.removeAttribute("data-theme-switching"); } };
    const t = doc.startViewTransition(apply);
    t.finished.then(done, done);
    t.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${reach}px at ${x}px ${y}px)`] },
        { duration: 850, easing: "cubic-bezier(.65, 0, .25, 1)", pseudoElement: "::view-transition-new(root)" },
      );
    }).catch(() => {});
  };

  return (
    <button type="button" onClick={toggle} aria-label={dark ? "Switch to light theme" : "Switch to dark theme"} title={dark ? "Light theme" : "Dark theme"}
      className={`grid size-11 shrink-0 place-items-center rounded-full transition-colors duration-300 hover:bg-white/10 ${className}`}>
      {dark === null ? <span className="size-5" /> : dark ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
          <circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
        </svg>
      )}
    </button>
  );
}
