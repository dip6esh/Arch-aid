"use client";
import { motion, useMotionValue } from "motion/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/** Desktop-only follower. Any element with data-cursor="Label" grows the bubble and shows that label.
 *  Position is written straight to the transform (no spring) so it never trails the real pointer;
 *  only the size change is animated, and that uses scale so it stays on the GPU. */
export function Cursor() {
  const x = useMotionValue(-100), y = useMotionValue(-100);
  const [label, setLabel] = useState("");
  const [on, setOn] = useState(false);

  const path = usePathname();
  const at = useRef<{ x: number; y: number } | null>(null); // last known pointer position
  const shown = useRef("");
  const check = useRef<() => void>(() => {});

  useEffect(() => {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    setOn(true);
    const set = (l: string) => { shown.current = l; setLabel((prev) => (prev === l ? prev : l)); };
    // what is under the pointer *now*: scrolling, a page change or an overlay can change that without the mouse moving
    let raf = 0;
    const look = () => {
      raf = 0;
      const p = at.current;
      if (!p) return;
      const l = document.elementFromPoint(p.x, p.y)?.closest<HTMLElement>("[data-cursor]")?.dataset.cursor ?? "";
      if (l !== shown.current) set(l);
    };
    const soon = () => { if (!raf) raf = requestAnimationFrame(look); };
    check.current = soon;
    const move = (e: PointerEvent) => {
      at.current = { x: e.clientX, y: e.clientY };
      x.set(e.clientX); y.set(e.clientY);
      const l = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-cursor]")?.dataset.cursor ?? "";
      if (l !== shown.current) set(l);
    };
    const gone = () => { at.current = null; set(""); }; // pointer left the window
    addEventListener("pointermove", move, { passive: true });
    addEventListener("scroll", soon, { passive: true });
    addEventListener("pointerdown", soon, { passive: true });
    addEventListener("click", soon, { passive: true });
    addEventListener("blur", gone);
    document.documentElement.addEventListener("pointerleave", gone);
    const poll = setInterval(() => { if (shown.current) soon(); }, 200); // safety net while a label is showing
    return () => {
      removeEventListener("pointermove", move); removeEventListener("scroll", soon); removeEventListener("pointerdown", soon);
      removeEventListener("click", soon); removeEventListener("blur", gone);
      document.documentElement.removeEventListener("pointerleave", gone);
      clearInterval(poll); cancelAnimationFrame(raf);
    };
  }, [x, y]);

  // new page: whatever was under the pointer is gone, so look again (and once more when the page has settled)
  useEffect(() => {
    check.current();
    const t = setTimeout(() => check.current(), 400);
    return () => clearTimeout(t);
  }, [path]);

  if (!on) return null;
  return (
    <motion.div aria-hidden style={{ x, y }} className="site-cursor pointer-events-none fixed left-0 top-0 z-[100] will-change-transform">
      <div className="relative -translate-x-1/2 -translate-y-1/2">
        <motion.div initial={false} animate={{ scale: label ? 1 : 12 / 92 }} transition={{ type: "spring", stiffness: 380, damping: 30 }}
          className="h-[92px] w-[92px] rounded-full bg-acc" />
        <span className="absolute inset-0 grid place-items-center text-[11px] font-medium uppercase tracking-widest text-white transition-opacity duration-150" style={{ opacity: label ? 1 : 0 }}>{label}</span>
      </div>
    </motion.div>
  );
}
