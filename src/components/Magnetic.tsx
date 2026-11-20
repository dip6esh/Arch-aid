"use client";
import { motion, useMotionValue, useSpring } from "motion/react";
import { useEffect, useRef } from "react";
import { useRevealProgress } from "./Reveal";

/** Wrapper that gently pulls its child toward the mouse. Mouse only: touch devices are untouched. */
export function Magnetic({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0), my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 220, damping: 16 }), y = useSpring(my, { stiffness: 220, damping: 16 });
  return (
    <motion.div ref={ref} style={{ x, y }} className={`inline-block ${className}`}
      onPointerMove={(e) => { if (e.pointerType !== "mouse") return; const r = ref.current!.getBoundingClientRect(); mx.set((e.clientX - r.left - r.width / 2) * 0.28); my.set((e.clientY - r.top - r.height / 2) * 0.28); }}
      onPointerLeave={() => { mx.set(0); my.set(0); }}>
      {children}
    </motion.div>
  );
}

/** Counts up as it scrolls into view and back down as you scroll up (scrubbed to scroll position). */
export function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const p = useRevealProgress(ref, 96, 62);
  useEffect(() => {
    const u = (v: number) => { if (ref.current) ref.current.textContent = Math.round(to * (1 - Math.pow(1 - v, 3))) + suffix; };
    u(p.get());
    return p.on("change", u);
  }, [p, to, suffix]);
  return <span ref={ref}>0{suffix}</span>;
}
