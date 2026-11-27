"use client";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { coverOf, type Project } from "@/lib/content";
import { Reveal, Words } from "./Reveal";
import { TLink } from "./Transition";
import { Arrow } from "./Arrow";

const pad = (n: number) => String(n).padStart(2, "0");
/** Card leans toward the mouse (a few degrees) while its photo slides the other way, like looking through a window. Mouse only. */
const lean = (e: React.PointerEvent<HTMLElement>) => {
  if (e.pointerType !== "mouse") return;
  const el = e.currentTarget, r = el.getBoundingClientRect();
  const nx = (e.clientX - r.left) / r.width - 0.5, ny = (e.clientY - r.top) / r.height - 0.5;
  el.style.setProperty("--ry", `${(nx * 9).toFixed(2)}deg`); el.style.setProperty("--rx", `${(-ny * 7).toFixed(2)}deg`);
  el.style.setProperty("--px", `${(-nx * 5).toFixed(2)}%`); el.style.setProperty("--py", `${(-ny * 5).toFixed(2)}%`);
};
const settle = (e: React.PointerEvent<HTMLElement>) => { ["--rx", "--ry", "--px", "--py"].forEach((v) => e.currentTarget.style.removeProperty(v)); };

const ALL = { mode: "curtain", eyebrow: "Index", title: "All projects" } as const;

/**
 * Scrollable strip of the other projects, shown under a project's album.
 * Scroll, swipe, drag (mouse) or use the arrows. Tapping a card grows its picture into that project's page;
 * "View all projects" sweeps back to the main Projects page.
 */
export function MoreProjects({ projects }: { projects: Project[] }) {
  const rail = useRef<HTMLUListElement>(null);
  const thumb = useRef<HTMLDivElement>(null);
  const drag = useRef({ on: false, x: 0, left: 0, moved: 0, v: 0, lx: 0, lt: 0, raf: 0 });
  const step = useRef(0);
  const tick = useRef(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [cur, setCur] = useState(0);

  // read layout only when the size changes, never while scrolling
  const size = useCallback(() => {
    const el = rail.current;
    if (!el) return;
    const card = el.querySelector("li");
    step.current = card ? card.offsetWidth + (parseFloat(getComputedStyle(el).columnGap) || 16) : el.clientWidth * 0.8;
  }, []);

  // cheap per-scroll update: refs and style writes only; state changes only when a value actually flips
  const measure = useCallback(() => {
    const el = rail.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    const t = el.scrollWidth > 0 ? Math.min(1, el.clientWidth / el.scrollWidth) : 1;
    const p = max > 0 ? Math.min(1, Math.max(0, el.scrollLeft / max)) : 0;
    if (thumb.current) { thumb.current.style.width = `${t * 100}%`; thumb.current.style.left = `${p * (1 - t) * 100}%`; }
    setAtStart(el.scrollLeft < 4);
    setAtEnd(max <= 4 || el.scrollLeft > max - 4);
    setCur(Math.min(projects.length - 1, Math.round(el.scrollLeft / (step.current || 1))));
  }, [projects.length]);
  const onScroll = () => { if (!tick.current) tick.current = requestAnimationFrame(() => { tick.current = 0; measure(); }); };

  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    size(); measure();
    const ro = new ResizeObserver(() => { size(); measure(); });
    ro.observe(el);
    // a sideways trackpad swipe scrolls the rail itself; vertical wheel is left to the page
    const wheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault(); e.stopPropagation();
      el.scrollLeft += e.deltaX;
    };
    el.addEventListener("wheel", wheel, { passive: false });
    return () => { ro.disconnect(); el.removeEventListener("wheel", wheel); cancelAnimationFrame(tick.current); cancelAnimationFrame(drag.current.raf); };
  }, [measure, size]);

  const nudge = (dir: number) => rail.current?.scrollBy({ left: dir * (step.current || 320), behavior: "smooth" });

  // mouse drag with a little momentum (touch and trackpads already scroll natively)
  const down = (e: React.PointerEvent) => {
    const el = rail.current;
    if (e.pointerType !== "mouse" || e.button !== 0 || !el) return;
    cancelAnimationFrame(drag.current.raf);
    drag.current = { on: true, x: e.clientX, left: el.scrollLeft, moved: 0, v: 0, lx: e.clientX, lt: e.timeStamp, raf: 0 };
  };
  const move = (e: React.PointerEvent) => {
    const d = drag.current, el = rail.current;
    if (!d.on || !el) return;
    const dx = e.clientX - d.x;
    d.moved = Math.max(d.moved, Math.abs(dx));
    if (d.moved < 6) return;
    if (!el.hasPointerCapture(e.pointerId)) { el.setPointerCapture(e.pointerId); el.style.cursor = "grabbing"; }
    el.scrollLeft = d.left - dx;
    const dt = (e.timeStamp - d.lt) / 1000;
    if (dt > 0) d.v = d.v * 0.6 + (-(e.clientX - d.lx) / dt) * 0.4; // px/s, positive = scrolling forward
    d.lx = e.clientX; d.lt = e.timeStamp;
  };
  const up = (e: React.PointerEvent) => {
    const d = drag.current, el = rail.current;
    if (!d.on || !el) return;
    d.on = false;
    if (el.hasPointerCapture(e.pointerId)) el.releasePointerCapture(e.pointerId);
    el.style.cursor = "";
    if (d.moved < 6 || e.timeStamp - d.lt > 90) return; // a click, or held still before letting go: no throw
    let v = Math.max(-4000, Math.min(4000, d.v)), t0 = performance.now();
    const coast = (t: number) => {
      const dt = Math.min(0.05, (t - t0) / 1000); t0 = t;
      el.scrollLeft += v * dt;
      v *= Math.pow(0.04, dt); // friction: about 96% of the speed gone after a second
      if (Math.abs(v) > 20) d.raf = requestAnimationFrame(coast);
    };
    d.raf = requestAnimationFrame(coast);
  };
  // a drag that ended on a card must not open it
  const stopClick = (e: React.MouseEvent) => { if (drag.current.moved >= 6) { e.preventDefault(); e.stopPropagation(); drag.current.moved = 0; } };

  // solid, shadowed discs that sit over the strip's left/right edges, vertically centred on the cards; the one with nowhere to go fades out
  const arrow = "absolute top-1/2 z-20 grid size-11 -translate-y-1/2 place-items-center rounded-full border border-line bg-bg text-ink shadow-[0_8px_28px_rgb(0_0_0/.28)] transition-all duration-300 hover:scale-105 hover:border-acc hover:bg-acc hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-acc disabled:pointer-events-none disabled:opacity-0 sm:size-14";

  return (
    <section className="overflow-hidden bg-bg2 py-[clamp(3rem,6vw,5rem)]" aria-label="More projects">
      <div className="wrap flex flex-wrap items-end justify-between gap-x-8 gap-y-6">
        <div>
          <Reveal><p className="eyebrow mb-4">More projects</p></Reveal>
          <Words className="max-w-[14ch] text-[clamp(2.4rem,5.5vw,4.5rem)] leading-[1]">Keep exploring.</Words>
        </div>
      </div>

      <div className="relative mt-4 sm:mt-6">
      <button type="button" aria-label="Scroll projects back" disabled={atStart} onClick={() => nudge(-1)} className={`${arrow} left-3 sm:left-6`}><Arrow dir="left" className="size-5 sm:size-6" /></button>
      <button type="button" aria-label="Scroll projects forward" disabled={atEnd} onClick={() => nudge(1)} className={`${arrow} right-3 sm:right-6`}><Arrow className="size-5 sm:size-6" /></button>
      <ul ref={rail} data-cursor="Drag" onScroll={onScroll} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onClickCapture={stopClick}
        className="rail-pad flex cursor-grab gap-4 overflow-x-auto overscroll-x-contain py-4 [@media(pointer:coarse)]:snap-x [@media(pointer:coarse)]:snap-proximity [scrollbar-width:none] sm:gap-5 [&::-webkit-scrollbar]:hidden">
        {projects.map((q, i) => (
          <li key={q.slug} className="w-[78%] shrink-0 snap-start sm:w-[26rem] lg:w-[30rem]">
            <TLink href={`/projects/${q.slug}`} draggable={false} data-cursor="View" aria-label={`${q.name}, ${q.cat}`}
              via={{ mode: "card", src: coverOf(q), title: q.name, eyebrow: q.cat, radius: 24 }}
              onPointerMove={(e) => { if (!drag.current.on) lean(e); }} onPointerLeave={settle}
              className="tilt group relative block aspect-[4/3] select-none overflow-hidden rounded-[1.5rem] bg-char text-white">
              <div className="tilt-img absolute inset-0">
                <Image src={coverOf(q)} alt="" fill draggable={false} sizes="(min-width:1024px) 30rem, (min-width:640px) 26rem, 78vw" className="object-cover" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
              <span className="absolute left-5 top-5 rounded-full bg-black/35 px-3 py-1 text-[0.7rem] font-bold tabular-nums tracking-[.15em] backdrop-blur-sm">{pad(i + 1)}</span>
              <span aria-hidden className="absolute right-5 top-5 grid size-11 -translate-y-1 place-items-center rounded-full bg-acc opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100"><Arrow dir="up-right" className="size-5" /></span>
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                <p className="text-[0.7rem] font-semibold uppercase tracking-[.2em] text-white/70">{[q.cat, q.loc].filter(Boolean).join(" · ")}</p>
                <p className="mt-1 font-serif text-[1.9rem] leading-tight sm:text-[2.2rem]">{q.name}</p>
              </div>
            </TLink>
          </li>
        ))}

        {/* last stop: back to the full list */}
        <li className="w-[78%] shrink-0 snap-start sm:w-[26rem] lg:w-[30rem]">
          <TLink href="/projects" draggable={false} data-cursor="All" via={ALL}
            className="group flex aspect-[4/3] select-none flex-col justify-between rounded-[1.5rem] bg-char p-6 text-cream transition-colors duration-500 hover:bg-acc sm:p-8">
            <p className="text-[0.7rem] font-bold uppercase tracking-[.25em] text-acc transition-colors group-hover:text-white">{projects.length + 1} albums</p>
            <p className="font-serif text-[clamp(2.2rem,4vw,3.25rem)] leading-[1]">See every project.</p>
            <span aria-hidden className="grid size-14 place-items-center self-end rounded-full bg-acc text-xl text-white transition-all duration-500 group-hover:-rotate-45 group-hover:bg-white group-hover:text-acc"><Arrow className="size-6" /></span>
          </TLink>
        </li>
      </ul>
      </div>

      <div className="wrap mt-8 flex flex-wrap items-center gap-x-6 gap-y-5">
        <p className="text-xs font-bold tabular-nums text-acc">{pad(cur + 1)} <span className="text-mute">/ {pad(projects.length)}</span></p>
        <div className="relative h-px min-w-[8rem] flex-1 bg-line" aria-hidden>
          <div ref={thumb} className="absolute -top-px h-[3px] rounded-full bg-acc transition-[left] duration-150" style={{ width: "20%", left: 0 }} />
        </div>
      </div>
    </section>
  );
}
