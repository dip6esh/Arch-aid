"use client";
import { motion, useMotionValue } from "motion/react";
import { useEffect, useState } from "react";

/** Desktop-only follower. Any element with data-cursor="Label" grows the bubble and shows that label.
 *  Position is written straight to the transform (no spring) so it never trails the real pointer;
 *  only the size change is animated, and that uses scale so it stays on the GPU. */
export function Cursor() {
  const x = useMotionValue(-100), y = useMotionValue(-100);
  const [label, setLabel] = useState("");
  const [on, setOn] = useState(false);

  useEffect(() => {
    if (!matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    setOn(true);
    const move = (e: PointerEvent) => {
      x.set(e.clientX); y.set(e.clientY);
      const l = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-cursor]")?.dataset.cursor ?? "";
      setLabel((prev) => (prev === l ? prev : l));
    };
    addEventListener("pointermove", move, { passive: true });
    return () => removeEventListener("pointermove", move);
  }, [x, y]);

  if (!on) return null;
  return (
    <motion.div aria-hidden style={{ x, y }} className="pointer-events-none fixed left-0 top-0 z-[100] will-change-transform">
      <div className="relative -translate-x-1/2 -translate-y-1/2">
        <motion.div initial={false} animate={{ scale: label ? 1 : 12 / 92 }} transition={{ type: "spring", stiffness: 380, damping: 30 }}
          className="h-[92px] w-[92px] rounded-full bg-acc" />
        <span className="absolute inset-0 grid place-items-center text-[11px] font-medium uppercase tracking-widest text-white transition-opacity duration-150" style={{ opacity: label ? 1 : 0 }}>{label}</span>
      </div>
    </motion.div>
  );
}
