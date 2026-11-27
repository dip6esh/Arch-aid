"use client";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { reduced } from "./Drive";

const DEG = 180 / Math.PI;
const MIN_CARDS = 8; // a short list is repeated so the loop never looks empty at the edges

export type RibbonItem = { key: string; src: string; alt?: string };
export type RibbonRoll = { current: ((i: number) => void) | null };

/**
 * The wavy rolling ribbon, shared by the Celebrity Clients page, the home-page "Selected work" and the Projects page.
 * Every card rides a wave: it rises and falls (a ripple that keeps travelling along the strip), swells towards you in the
 * middle and tilts to follow the curve. It drifts by itself, can be grabbed and thrown, is nudged by page scroll, leans
 * towards the mouse, and a tap on any card rolls it to the centre (a tap on the centred card calls `onOpen`).
 * The wave is sized from the card width, so a phone gets the same rolling look as a desktop.
 *
 * `onActive(i)` reports the index (in `items`) of the card nearest the centre. `rollRef.current(i)` rolls to item i.
 */
export function WaveRibbon({
  items, onActive, rollRef, onOpen, landscape = false, eager = false, hidden = true, label,
}: {
  items: RibbonItem[]; onActive: (i: number) => void; rollRef: RibbonRoll; onOpen?: (i: number) => void;
  landscape?: boolean; eager?: boolean; hidden?: boolean; label?: string;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const cards = useRef<HTMLLIElement[]>([]);
  const len = items.length;
  const reps = Math.max(1, Math.ceil(MIN_CARDS / Math.max(1, len)));
  const list = Array.from({ length: reps }, () => items).flat();
  const cb = useRef({ onActive, onOpen });
  cb.current = { onActive, onOpen };

  useEffect(() => {
    const el = stage.current, els = cards.current.slice(0, len * reps), n = els.length;
    if (!el || !n) return;
    const still = reduced();
    let pos = 0, vel = 0, drag = false, raf = 0, t0 = 0, vis = true, clock = 0, idle = 0, cur = -1;
    let target: number | null = null, mx = 0, my = 0, tx = 0, ty = 0, lastScroll = scrollY;
    let startX = 0, startT = 0, prevX = 0, prevT = 0, moved = 0;

    const frame = (t: number) => {
      const dt = Math.min(0.05, Math.max(0, (t - t0) / 1000)); t0 = t; clock += dt;
      const cw = els[0].offsetWidth, ch = els[0].offsetHeight, W = el.clientWidth;
      const step = cw * 1.05, total = step * n;

      // motion: eased roll to a tapped card, otherwise drag / throw / gentle drift
      if (target !== null) {
        const d = target - pos; pos += d * Math.min(1, dt * 7); vel = 0;
        if (Math.abs(d) < 0.4) { pos = target; target = null; }
      } else if (!drag) {
        const base = still || idle > 0 ? 0 : 50;
        vel += (base - vel) * Math.min(1, dt * 2.5); pos += vel * dt;
      }
      idle = Math.max(0, idle - dt);
      const wrapped = ((pos % total) + total) % total;
      if (target !== null) target += wrapped - pos;
      pos = wrapped;
      mx += (tx - mx) * Math.min(1, dt * 4); my += (ty - my) * Math.min(1, dt * 4);

      // wave geometry, in card widths so it looks the same on every screen
      const small = W < 640;
      const lam = (step * (small ? 6.2 : 7.5)) / (2 * Math.PI);  // one wave spans ~6-7 cards
      const Z = cw * (small ? 1 : 0.95), A = ch * (small ? 0.3 : 0.26), P = cw * 6.5;
      const ripple = still ? 0 : clock * 0.9;
      let best = 0, bd = Infinity;
      for (let i = 0; i < n; i++) {
        let x = i * step - pos;
        x = ((((x + total / 2) % total) + total) % total) - total / 2; // nearest copy to the centre: endless loop
        const ph = x / lam, depth = Math.cos(ph), z = depth * Z, s = P / (P - z);
        const y = Math.sin(ph - ripple) * A + my * 10;
        const ry = Math.atan((Math.sin(ph) * Z) / lam) * DEG + mx * 7;
        const rz = Math.atan((Math.cos(ph - ripple) * A) / lam) * DEG * 0.5;
        const c = els[i];
        c.style.transform = `translate3d(${x * s - cw / 2}px,${y * s - ch / 2}px,0) scale(${s}) perspective(${cw * 5}px) rotateY(${ry}deg) rotateZ(${rz}deg)`;
        c.style.opacity = String(0.45 + 0.55 * ((depth + 1) / 2));
        c.style.zIndex = String(Math.round(z + Z));
        if (Math.abs(x) < bd) { bd = Math.abs(x); best = i; }
      }
      if (best !== cur) { cur = best; cb.current.onActive(best % len); }
      raf = requestAnimationFrame(frame);
    };
    const start = () => { if (!raf && vis) { t0 = performance.now(); raf = requestAnimationFrame(frame); } };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };

    // roll to item i (an index into `items`): of its repeated copies, take the one that is the shortest way round
    const roll = (i: number) => {
      const step = els[0].offsetWidth * 1.05, total = step * n;
      let best = Infinity;
      for (let k = i % len; k < n; k += len) {
        let d = (((k * step - pos) % total) + total) % total;
        if (d > total / 2) d -= total;
        if (Math.abs(d) < Math.abs(best)) best = d;
      }
      target = pos + best; idle = 3;
    };
    rollRef.current = roll;
    const down = (e: PointerEvent) => {
      if (e.button > 0) return;
      drag = true; target = null; vel = 0; moved = 0; startX = prevX = e.clientX; startT = prevT = e.timeStamp;
      try { el.setPointerCapture(e.pointerId); } catch { /* pointer already gone */ }
      el.style.cursor = "grabbing";
    };
    const move = (e: PointerEvent) => {
      if (!drag) {
        if (e.pointerType === "mouse") { const r = el.getBoundingClientRect(); tx = ((e.clientX - r.left) / r.width) * 2 - 1; ty = ((e.clientY - r.top) / r.height) * 2 - 1; }
        return;
      }
      const d = -(e.clientX - prevX), dt = (e.timeStamp - prevT) / 1000;
      pos += d; moved += Math.abs(d);
      if (dt > 0) vel = Math.max(-3000, Math.min(3000, vel * 0.6 + (d / dt) * 0.4));
      prevX = e.clientX; prevT = e.timeStamp;
    };
    const up = (e: PointerEvent) => {
      if (!drag) return;
      drag = false; el.style.cursor = "";
      if (e.timeStamp - prevT > 80) vel = 0; // held still before letting go: no throw
      if (e.type === "pointerup" && moved < 8 && e.timeStamp - startT < 500 && Math.abs(e.clientX - startX) < 8) { // a tap
        const hit = document.elementsFromPoint(e.clientX, e.clientY).find((n) => (n as HTMLElement).dataset.i !== undefined) as HTMLElement | undefined;
        if (hit) {
          const k = Number(hit.dataset.i);
          if (k === cur && cb.current.onOpen) cb.current.onOpen(k % len); // already in the middle: open it
          else roll(k);                                                    // otherwise roll it to the middle
        }
      }
    };
    const leave = () => { tx = ty = 0; };
    const onScroll = () => { const dy = scrollY - lastScroll; lastScroll = scrollY; if (!drag && target === null && idle === 0) pos += dy * 0.35; }; // page scroll spins the strip (not just after a roll)
    const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (vis) start(); else stop(); });
    io.observe(el);
    el.addEventListener("pointerdown", down); el.addEventListener("pointermove", move); el.addEventListener("pointerleave", leave);
    el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up);
    addEventListener("scroll", onScroll, { passive: true });
    start();
    return () => {
      rollRef.current = null; stop(); io.disconnect(); removeEventListener("scroll", onScroll);
      el.removeEventListener("pointerdown", down); el.removeEventListener("pointermove", move); el.removeEventListener("pointerleave", leave);
      el.removeEventListener("pointerup", up); el.removeEventListener("pointercancel", up);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [len, reps]);

  const size = landscape
    ? "h-[calc(var(--cw)*1.55)] [--cw:clamp(12rem,58vw,16rem)] sm:[--cw:19rem] lg:[--cw:25rem]"
    : "h-[calc(var(--cw)*2.5)] [--cw:clamp(6.5rem,29vw,8.5rem)] sm:[--cw:10.5rem] lg:[--cw:13rem]";
  return (
    <div ref={stage} data-cursor="Drag" aria-hidden={hidden || undefined} aria-label={label}
      className={`relative ${size} cursor-grab select-none overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_9%,#000_91%,transparent)] [touch-action:pan-y]`}>
      <ul className="absolute left-1/2 top-1/2">
        {list.map((it, k) => (
          <li key={`${k}-${it.key}`} data-i={k} ref={(el) => { if (el) cards.current[k] = el; }}
            className={`absolute left-0 top-0 ${landscape ? "aspect-[3/2]" : "aspect-[4/5]"} w-[var(--cw)] overflow-hidden rounded-2xl bg-bg2 opacity-0 shadow-[0_26px_50px_-26px_rgb(0_0_0/.6)] ring-1 ring-black/5 will-change-transform`}>
            <Image src={it.src} alt={it.alt ?? ""} fill sizes={landscape ? "(min-width:1024px) 26rem, 60vw" : "(min-width:1024px) 14rem, 30vw"}
              loading={eager ? "eager" : undefined} draggable={false} className="pointer-events-none object-cover object-top" />
          </li>
        ))}
      </ul>
    </div>
  );
}
