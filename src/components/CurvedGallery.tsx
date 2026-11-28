"use client";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { originOf, type Origin } from "@/lib/origin";
import { reduced, switching } from "./Drive";

const MIN_CARDS = 16;  // a short list is repeated so the wall never has a gap, even on a wide screen
const BASE = 0.3;      // resting spin, in cards per second
const RESUME = 2.5;    // seconds of calm after a touch before the spin picks up again
const outCubic = (t: number) => 1 - (1 - t) ** 3;

export type GalleryItem = { key: string; src: string; alt?: string };
export type GalleryRoll = { current: ((i: number) => void) | null };

const wrap = (v: number, n: number) => ((((v + n / 2) % n) + n) % n) - n / 2;
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

/**
 * Curved gallery, shared by the home-page "Selected work", the Projects page and the Celebrity Clients page.
 * Panels stand on the inside of a cylinder and you look at them from its middle: the centre one faces you, the rest curve
 * round towards you and fall away into shadow. The wall keeps slowly revolving by itself; grab it (mouse or finger) to spin it
 * by hand, throw it and it coasts before settling back into its slow turn. The wall leans a little towards the mouse.
 * Tap a panel to bring it to the front; tapping the front one calls `onOpen`. Auto-spin stops while `paused`.
 *
 * `onActive(i)` reports the index (in `items`) of the panel nearest the front. `rollRef.current(i)` brings item i to the front.
 * `onOpen(i, from)` also receives where the panel is on screen, so the viewer can grow out of it. `originRef.current()` measures the front panel.
 */
export function CurvedGallery({
  items, onActive, rollRef, onOpen, originRef, landscape = false, eager = false, hidden = true, label, paused = false,
}: {
  items: GalleryItem[]; onActive: (i: number) => void; rollRef: GalleryRoll; onOpen?: (i: number, from: Origin | null) => void;
  originRef?: { current: (() => Origin | null) | null };
  landscape?: boolean; eager?: boolean; hidden?: boolean; label?: string; paused?: boolean;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const cards = useRef<HTMLLIElement[]>([]);
  const inner = useRef<HTMLDivElement[]>([]);
  const shade = useRef<HTMLDivElement[]>([]);
  const len = items.length;
  const reps = Math.max(1, Math.ceil(MIN_CARDS / Math.max(1, len)));
  const list = Array.from({ length: reps }, () => items).flat();
  const cb = useRef({ onActive, onOpen, paused });
  cb.current = { onActive, onOpen, paused };

  useEffect(() => {
    const el = stage.current, els = cards.current.slice(0, len * reps), ims = inner.current, sh = shade.current, n = els.length;
    if (!el || !n) return;
    const still = reduced();
    let pos = 0, vel = 0, drag = false, raf = 0, t0 = 0, vis = true, cur = -1, idle = 0.8, intro = still ? 1 : 0;
    let tw: { from: number; to: number; t: number; dur: number } | null = null;
    let mx = 0, my = 0, tx = 0, ty = 0;
    let startX = 0, startT = 0, prevX = 0, prevT = 0, moved = 0;

    const frame = (t: number) => {
      if (switching()) { t0 = t; raf = requestAnimationFrame(frame); return; } // theme reveal playing: hold still
      const dt = Math.min(0.05, Math.max(0, (t - t0) / 1000)); t0 = t;
      const cw = els[0].offsetWidth, ch = els[0].offsetHeight, W = el.clientWidth;
      // the wall is a cylinder seen from inside. Its radius comes from the card width (so a phone gets the same look as before) but is
      // never smaller than 0.44 x the stage width: that is what lets the curved wall run all the way out to both edges of a wide screen
      // (a card at 1.15 rad lands about 1.23 R from the middle), instead of stopping short with empty space either side.
      const R = Math.max(cw * 1.8, W * 0.44), theta = (cw * 1.06) / R, P = R * 1.3, k = (P + R) / P;
      if (intro < 1) intro = Math.min(1, intro + dt / 1.8);
      const e = outCubic(intro);

      if (tw) {
        tw.t += dt; const u = Math.min(1, tw.t / tw.dur);
        pos = tw.from + (tw.to - tw.from) * outCubic(u); vel = 0;
        if (u >= 1) { pos = tw.to; tw = null; idle = RESUME; }
      } else if (!drag) {
        const base = still || idle > 0 || cb.current.paused || intro < 1 ? 0 : BASE; // keeps revolving unless someone has just touched it
        vel += (base - vel) * Math.min(1, dt * 2.2); pos += vel * dt;
      }
      idle = Math.max(0, idle - dt);
      const w = wrap(pos, n) - pos;
      if (w !== 0) { pos += w; if (tw) { tw.from += w; tw.to += w; } }
      mx += (tx - mx) * Math.min(1, dt * 4); my += (ty - my) * Math.min(1, dt * 4);

      let best = 0, bd = Infinity;
      for (let i = 0; i < n; i++) {
        const d = wrap(i - pos + (1 - e) * 2.5, n), ang = Math.abs(d) * theta * (0.35 + 0.65 * e); // the wall unfolds as it arrives
        const a = Math.sign(d) * -ang + mx * 0.07;
        const c = els[i];
        const op = clamp((1.3 - ang) / 0.25, 0, 1) * e; // solid right out to the screen edge; gone only once the card has turned off-screen / side-on
        c.style.visibility = op < 0.02 ? "hidden" : "visible";
        c.style.opacity = String(op);
        c.style.zIndex = String(Math.round(Math.cos(ang) * 10));
        c.style.transform = `scale(${k}) perspective(${P}px) rotateX(${(-my * 2).toFixed(2)}deg) rotateY(${a.toFixed(4)}rad) translate3d(0,${(-my * 6).toFixed(1)}px,${-R}px) translate3d(${-cw / 2}px,${-ch / 2}px,0)`;
        if (sh[i]) sh[i].style.opacity = (0.55 * Math.min(1, ang / 1.2) ** 1.2).toFixed(3); // the wall darkens as it curves away, which is what reads as a cylinder
        if (ims[i]) ims[i].style.transform = `translate3d(${(-clamp(d, -1.4, 1.4) * 4).toFixed(2)}%,0,0) scale(1.12)`;
        if (Math.abs(d) < bd) { bd = Math.abs(d); best = i; }
      }
      if (best !== cur) { cur = best; cb.current.onActive(best % len); }
      // reduced motion and nothing moving: stop painting until the next interaction
      if (still && !drag && !tw && intro >= 1 && Math.abs(vel) < 0.01) raf = 0; else raf = requestAnimationFrame(frame);
    };
    const wake = () => { if (!raf && vis) { t0 = performance.now(); raf = requestAnimationFrame(frame); } };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };
    const stepPx = () => els[0].offsetWidth * 1.05;

    // bring item i (an index into `items`) to the front, by the shortest way round
    const roll = (i: number) => {
      let best = Infinity;
      for (let k = i % len; k < n; k += len) { const d = wrap(k - pos, n); if (Math.abs(d) < Math.abs(best)) best = d; }
      tw = { from: pos, to: pos + best, t: 0, dur: still ? 0.001 : 0.7 + 0.15 * Math.min(Math.abs(best), 4) }; vel = 0; wake();
    };
    rollRef.current = roll;
    if (originRef) originRef.current = () => originOf(els[cur]);

    const down = (e: PointerEvent) => {
      if (e.button > 0) return;
      drag = true; tw = null; vel = 0; moved = 0; idle = RESUME; startX = prevX = e.clientX; startT = prevT = e.timeStamp;
      try { el.setPointerCapture(e.pointerId); } catch { /* pointer already gone */ }
      el.style.cursor = "grabbing"; wake();
    };
    const move = (e: PointerEvent) => {
      if (!drag) {
        if (e.pointerType === "mouse" && !still) { const r = el.getBoundingClientRect(); tx = ((e.clientX - r.left) / r.width) * 2 - 1; ty = ((e.clientY - r.top) / r.height) * 2 - 1; wake(); }
        return;
      }
      const d = -(e.clientX - prevX) / stepPx(), dt = (e.timeStamp - prevT) / 1000;
      pos += d; moved += Math.abs(e.clientX - prevX);
      if (dt > 0) vel = clamp(vel * 0.6 + (d / dt) * 0.4, -8, 8);
      prevX = e.clientX; prevT = e.timeStamp; idle = RESUME;
    };
    const up = (e: PointerEvent) => {
      if (!drag) return;
      drag = false; el.style.cursor = ""; idle = RESUME;
      if (e.type === "pointerup" && moved < 8 && e.timeStamp - startT < 500 && Math.abs(e.clientX - startX) < 8) { // a tap
        vel = 0;
        const hit = document.elementsFromPoint(e.clientX, e.clientY).find((n) => (n as HTMLElement).dataset.i !== undefined) as HTMLElement | undefined;
        if (hit) {
          const k = Number(hit.dataset.i);
          if (k === cur && cb.current.onOpen) cb.current.onOpen(k % len, originOf(hit)); // already at the front: open it
          else roll(k);                                                     // otherwise bring it round to the front
        }
      } else if (e.timeStamp - prevT > 80) vel = 0; // held still before letting go: no throw
    };
    const leave = () => { tx = ty = 0; };
    const key = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault(); roll(((cur + (e.key === "ArrowRight" ? 1 : -1)) % n + n) % n);
    };
    // horizontal trackpad swipes spin the wall; vertical scrolling is left to the page
    const wheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault(); tw = null; pos += (e.deltaX / stepPx()) * 0.8; idle = RESUME; wake();
    };
    const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (vis) wake(); else stop(); });
    const ro = new ResizeObserver(() => wake());
    io.observe(el); ro.observe(el);
    el.addEventListener("pointerdown", down); el.addEventListener("pointermove", move); el.addEventListener("pointerleave", leave);
    el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up);
    el.addEventListener("keydown", key); el.addEventListener("wheel", wheel, { passive: false });
    wake();
    return () => {
      rollRef.current = null; if (originRef) originRef.current = null; stop(); io.disconnect(); ro.disconnect();
      el.removeEventListener("pointerdown", down); el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave);
      el.removeEventListener("pointerup", up); el.removeEventListener("pointercancel", up);
      el.removeEventListener("keydown", key); el.removeEventListener("wheel", wheel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [len, reps]);

  const size = landscape
    ? "h-[calc(var(--cw)*1.12)] [--cw:clamp(15rem,64vw,18rem)] sm:[--cw:22rem] lg:[--cw:26rem]"
    : "h-[calc(var(--cw)*1.85)] [--cw:clamp(10rem,50vw,12rem)] sm:[--cw:14rem] lg:[--cw:16rem]";
  return (
    <div ref={stage} data-cursor="Drag" aria-hidden={hidden || undefined} aria-label={label} tabIndex={hidden ? undefined : 0}
      className={`relative ${size} cursor-grab select-none overflow-hidden [touch-action:pan-y] focus-visible:outline-offset-[-3px]`}>
      <ul className="absolute left-1/2 top-1/2">
        {list.map((it, k) => (
          <li key={`${k}-${it.key}`} data-i={k} ref={(el) => { if (el) cards.current[k] = el; }}
            className={`absolute left-0 top-0 ${landscape ? "aspect-[4/3]" : "aspect-[4/5]"} w-[var(--cw)] overflow-hidden bg-bg2 opacity-0 [transform-origin:0_0] will-change-transform`}>
            <div ref={(el) => { if (el) inner.current[k] = el; }} className="absolute inset-0 will-change-transform">
              <Image src={it.src} alt={it.alt ?? ""} fill sizes={landscape ? "(min-width:1024px) 30rem, 70vw" : "(min-width:1024px) 18rem, 55vw"}
                loading={eager ? "eager" : undefined} draggable={false} className="pointer-events-none object-cover object-top" />
            </div>
            <div ref={(el) => { if (el) shade.current[k] = el; }} aria-hidden className="pointer-events-none absolute inset-0 bg-black opacity-0" />
          </li>
        ))}
      </ul>
    </div>
  );
}
