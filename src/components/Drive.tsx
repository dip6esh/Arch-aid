"use client";
import { useEffect, type RefObject } from "react";

type Opts = {
  /** Resting velocity (units/s) the motion eases back to when nobody is dragging. */
  base: () => number;
  /** Receives the raw position; paints it and returns the (possibly wrapped) position to keep. */
  apply: (pos: number) => number;
  /** How far one pointer move should shift the position. */
  delta: (e: PointerEvent, prev: PointerEvent) => number;
  /** Element the user grabs. */
  grab?: RefObject<HTMLElement | null>;
};

/**
 * Auto-moving element you can also grab: it drifts at `base` by default, follows the pointer (back and forth)
 * while pressed, and on release keeps the throw's momentum before easing back to the default drift.
 */
export function useDrive(ref: RefObject<Element | null>, o: Opts) {
  useEffect(() => {
    const el = (o.grab ?? ref).current as HTMLElement | null; if (!el) return;
    let pos = 0, vel = o.base(), drag = false, prev: PointerEvent | null = null, raf = 0, t0 = 0, vis = true;
    const frame = (t: number) => {
      const dt = Math.min(0.05, Math.max(0, (t - t0) / 1000)); t0 = t;
      if (!drag) { vel += (o.base() - vel) * Math.min(1, dt * 2.5); pos += vel * dt; }
      pos = o.apply(pos);
      raf = requestAnimationFrame(frame);
    };
    const start = () => { if (!raf && vis) { t0 = performance.now(); raf = requestAnimationFrame(frame); } };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };
    const down = (e: PointerEvent) => { if (e.button > 0) return; drag = true; prev = e; vel = 0; el.setPointerCapture(e.pointerId); el.style.cursor = "grabbing"; };
    const move = (e: PointerEvent) => {
      if (!drag || !prev) return;
      const d = o.delta(e, prev), dt = (e.timeStamp - prev.timeStamp) / 1000;
      pos += d; if (dt > 0) vel = vel * 0.6 + (d / dt) * 0.4; prev = e;
    };
    const up = () => {
      if (!drag) return; drag = false; el.style.cursor = "";
      if (prev && performance.now() - prev.timeStamp > 80) vel = 0; // held still before letting go: no throw
      prev = null;
    };
    const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (vis) start(); else stop(); });
    io.observe(el);
    el.addEventListener("pointerdown", down); el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up);
    start();
    return () => { stop(); io.disconnect(); el.removeEventListener("pointerdown", down); el.removeEventListener("pointermove", move); el.removeEventListener("pointerup", up); el.removeEventListener("pointercancel", up); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

export const reduced = () => typeof matchMedia !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;
