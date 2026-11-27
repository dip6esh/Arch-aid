"use client";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { reduced } from "./Drive";

const MIN_CARDS = 8; // a short list is repeated so the loop never shows an empty edge
const SHRINK = 0.28; // neighbours sit at 72% of the centre card
const DWELL = 3.4;   // seconds to rest on a card before gliding to the next
const GLIDE = 1.3;   // seconds one glide takes
const RESUME = 4.5;  // seconds of calm after a touch before auto-play resumes
const outCubic = (t: number) => 1 - (1 - t) ** 3;
const inOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export type GalleryItem = { key: string; src: string; alt?: string };
export type GalleryRoll = { current: ((i: number) => void) | null };

const wrap = (v: number, n: number) => ((((v + n / 2) % n) + n) % n) - n / 2;

/**
 * Focus gallery, shared by the home-page "Selected work", the Projects page and the Celebrity Clients page.
 * Flat cards sit in a straight line: the one in the middle is large and sharp, its neighbours are smaller and quieter.
 * It fans out when scrolled into view, then holds on each card for a few seconds and glides to the next with an eased,
 * unhurried move. Drag or swipe (it settles on the nearest card), use the arrow keys, or tap a card to bring it to the
 * middle; tapping the centred card calls `onOpen`. Auto-play pauses while someone is interacting, and while `paused`.
 * Images drift a little inside their frames for depth.
 *
 * `onActive(i)` reports the index (in `items`) of the centred card. `rollRef.current(i)` brings item i to the middle.
 */
export function FocusGallery({
  items, onActive, rollRef, onOpen, landscape = false, eager = false, hidden = true, label, paused = false,
}: {
  items: GalleryItem[]; onActive: (i: number) => void; rollRef: GalleryRoll; onOpen?: (i: number) => void;
  landscape?: boolean; eager?: boolean; hidden?: boolean; label?: string; paused?: boolean;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const cards = useRef<HTMLLIElement[]>([]);
  const inner = useRef<HTMLDivElement[]>([]);
  const len = items.length;
  const reps = Math.max(1, Math.ceil(MIN_CARDS / Math.max(1, len)));
  const list = Array.from({ length: reps }, () => items).flat();
  const cb = useRef({ onActive, onOpen, paused });
  cb.current = { onActive, onOpen, paused };

  useEffect(() => {
    const el = stage.current, els = cards.current.slice(0, len * reps), ims = inner.current, n = els.length;
    if (!el || !n) return;
    const still = reduced();
    let pos = 0, drag = false, raf = 0, t0 = 0, vis = true, cur = -1, hold = 0, idle = 1.2;
    let intro = still ? 1 : 0, tw: { from: number; to: number; t: number; dur: number; ease: (t: number) => number } | null = null;
    let startX = 0, startT = 0, prevX = 0, prevT = 0, moved = 0, v = 0;
    const glide = (to: number, dur: number, ease = outCubic) => { tw = { from: pos, to, t: 0, dur: still ? 0.001 : dur, ease }; };

    const frame = (t: number) => {
      const dt = Math.min(0.05, Math.max(0, (t - t0) / 1000)); t0 = t;
      const cw = els[0].offsetWidth, ch = els[0].offsetHeight, gap = cw * 0.05;
      if (intro < 1) intro = Math.min(1, intro + dt / 1.5);
      const e = outCubic(intro);

      if (tw) {
        tw.t += dt; const k = Math.min(1, tw.t / tw.dur);
        pos = tw.from + (tw.to - tw.from) * tw.ease(k);
        if (k >= 1) { pos = tw.to; tw = null; if (idle < DWELL) idle = DWELL; }
      } else if (!drag) {
        if (hold > 0) { hold -= dt; if (hold <= 0) { glide(Math.round(pos), 0.7); idle = RESUME; } } // after a trackpad swipe, settle on the nearest card
        else if (!still && intro >= 1 && !cb.current.paused) {
          idle -= dt;
          if (idle <= 0) { glide(Math.round(pos) + 1, GLIDE, inOutCubic); idle = DWELL; } // rest, then glide to the next card
        }
      }
      const w = wrap(pos, n) - pos; // keep pos in a small range so the loop never runs out of numbers
      if (w !== 0) { pos += w; if (tw) { tw.from += w; tw.to += w; } }

      let best = 0, bd = Infinity;
      for (let i = 0; i < n; i++) {
        const d = wrap(i - pos, n), ad = Math.abs(d), near = Math.min(ad, 1), far = Math.max(0, ad - 1);
        const s = (1 - SHRINK * near) * (0.9 + 0.1 * e);
        const x = Math.sign(d) * (cw * (near - (SHRINK / 2) * near * near) + gap * near + far * (cw * (1 - SHRINK) + gap)) * (0.45 + 0.55 * e);
        const c = els[i];
        c.style.transform = `translate3d(${x - cw / 2}px,${-ch / 2}px,0) scale(${s})`;
        c.style.opacity = String((ad < 1 ? 1 - 0.5 * ad : Math.max(0.18, 0.5 - 0.2 * (ad - 1))) * e);
        c.style.zIndex = String(Math.round((1 - near) * 10));
        if (ims[i]) ims[i].style.transform = `translate3d(${(-Math.max(-1.4, Math.min(1.4, d)) * 5).toFixed(2)}%,0,0) scale(${(1.14 + 0.05 * (1 - near)).toFixed(3)})`;
        if (ad < bd) { bd = ad; best = i; }
      }
      if (best !== cur) { cur = best; cb.current.onActive(best % len); }
      // reduced motion and nothing happening: stop painting until the next interaction
      if (still && !drag && !tw && hold <= 0 && intro >= 1) raf = 0; else raf = requestAnimationFrame(frame);
    };
    const wake = () => { if (!raf && vis) { t0 = performance.now(); raf = requestAnimationFrame(frame); } };
    const stop = () => { cancelAnimationFrame(raf); raf = 0; };

    // bring item i (an index into `items`) to the middle, by the shortest way round
    const roll = (i: number) => {
      let best = Infinity;
      for (let k = i % len; k < n; k += len) { const d = wrap(k - pos, n); if (Math.abs(d) < Math.abs(best)) best = d; }
      glide(pos + best, 0.6 + 0.2 * Math.min(Math.abs(best), 4)); idle = RESUME; wake();
    };
    rollRef.current = roll;
    const stepPx = () => els[0].offsetWidth * 0.95;

    const down = (e: PointerEvent) => {
      if (e.button > 0) return;
      drag = true; tw = null; hold = 0; idle = RESUME; v = 0; moved = 0; startX = prevX = e.clientX; startT = prevT = e.timeStamp;
      try { el.setPointerCapture(e.pointerId); } catch { /* pointer already gone */ }
      el.style.cursor = "grabbing"; wake();
    };
    const move = (e: PointerEvent) => {
      if (!drag) return;
      const d = -(e.clientX - prevX) / stepPx(), dt = (e.timeStamp - prevT) / 1000;
      pos += d; moved += Math.abs(e.clientX - prevX);
      if (dt > 0) v = v * 0.6 + (d / dt) * 0.4;
      prevX = e.clientX; prevT = e.timeStamp;
    };
    const up = (e: PointerEvent) => {
      if (!drag) return;
      drag = false; el.style.cursor = "";
      const tap = e.type === "pointerup" && moved < 8 && e.timeStamp - startT < 500;
      if (tap) {
        const hit = document.elementsFromPoint(e.clientX, e.clientY).find((n) => (n as HTMLElement).dataset.i !== undefined) as HTMLElement | undefined;
        if (hit) {
          const k = Number(hit.dataset.i);
          if (k === cur && cb.current.onOpen) { glide(Math.round(pos), 0.4); cb.current.onOpen(k % len); } // already in the middle: open it
          else roll(k);                                                                                 // otherwise bring it to the middle
          return;
        }
      }
      if (e.timeStamp - prevT > 80) v = 0; // held still before letting go: no throw
      glide(Math.round(pos + Math.max(-6, Math.min(6, v)) * 0.22), 0.8); idle = RESUME; // a flick carries a card or two, then it settles
      wake();
    };
    const key = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      e.preventDefault(); roll(((cur + (e.key === "ArrowRight" ? 1 : -1)) % n + n) % n);
    };
    // horizontal trackpad swipes move the gallery; vertical scrolling is left to the page
    const wheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault(); tw = null; pos += e.deltaX / stepPx() * 0.8; hold = 0.14; idle = RESUME; wake();
    };
    const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (vis) wake(); else stop(); });
    const ro = new ResizeObserver(() => wake());
    io.observe(el); ro.observe(el);
    el.addEventListener("pointerdown", down); el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up);
    el.addEventListener("keydown", key); el.addEventListener("wheel", wheel, { passive: false });
    wake();
    return () => {
      rollRef.current = null; stop(); io.disconnect(); ro.disconnect();
      el.removeEventListener("pointerdown", down); el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up); el.removeEventListener("pointercancel", up);
      el.removeEventListener("keydown", key); el.removeEventListener("wheel", wheel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [len, reps]);

  const size = landscape
    ? "h-[calc(var(--cw)*0.7)] [--cw:clamp(15rem,74vw,20rem)] sm:[--cw:27rem] lg:[--cw:36rem]"
    : "h-[calc(var(--cw)*1.3)] [--cw:clamp(10rem,52vw,13rem)] sm:[--cw:15rem] lg:[--cw:18rem]";
  return (
    <div ref={stage} data-cursor="Drag" aria-hidden={hidden || undefined} aria-label={label} tabIndex={hidden ? undefined : 0}
      className={`relative ${size} cursor-grab select-none overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)] [touch-action:pan-y] focus-visible:outline-offset-[-3px]`}>
      <ul className="absolute left-1/2 top-1/2">
        {list.map((it, k) => (
          <li key={`${k}-${it.key}`} data-i={k} ref={(el) => { if (el) cards.current[k] = el; }}
            className={`absolute left-0 top-0 ${landscape ? "aspect-[3/2]" : "aspect-[4/5]"} w-[var(--cw)] overflow-hidden rounded-[4px] bg-bg2 opacity-0 shadow-[0_30px_60px_-30px_rgb(0_0_0/.55)] will-change-transform`}>
            <div ref={(el) => { if (el) inner.current[k] = el; }} className="absolute inset-0 will-change-transform">
              <Image src={it.src} alt={it.alt ?? ""} fill sizes={landscape ? "(min-width:1024px) 40rem, 80vw" : "(min-width:1024px) 20rem, 55vw"}
                loading={eager ? "eager" : undefined} draggable={false} className="pointer-events-none object-cover object-top" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
