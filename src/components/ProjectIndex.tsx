"use client";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ALL_CATEGORY, PROJECTS, PROJECT_CATEGORIES, coverOf, type Project } from "@/lib/content";
import { EASE, Reveal } from "./Reveal";
import { isPlainClick, useGo, warm } from "./Transition";
import { Arrow } from "./Arrow";

const pad = (n: number) => String(n + 1).padStart(2, "0");
const TABS = [ALL_CATEGORY, ...PROJECT_CATEGORIES];
const countOf = (c: string) => (c === ALL_CATEGORY ? PROJECTS.length : PROJECTS.filter((p) => p.cat === c).length);

/**
 * Every project as a text index, built the same way as the Celebrity Clients index:
 * sticky filter chips with counts, then a numbered list. Hover a row (mouse) for a small tilted photo beside the pointer;
 * click or tap to open that project (the picture grows out of the preview when it is showing).
 */
export function ProjectIndex({ list, cat, onCat }: { list: Project[]; cat: string; onCat: (c: string) => void }) {
  const goTo = useGo();
  const [hover, setHover] = useState<number | null>(null);
  const [canHover, setCanHover] = useState(false); // phones and tablets never show the preview, so they should not download hidden photos
  const pv = useRef<HTMLDivElement>(null);
  const at = useRef({ x: 0, y: 0, w: 0, h: 0 });

  useEffect(() => { setCanHover(matchMedia("(hover: hover) and (pointer: fine)").matches); }, []);
  useEffect(() => { setHover(null); }, [list]); // the filter changed: the hovered row may be gone

  const put = (x0: number, y0: number) => {
    if (!pv.current) return;
    const w = pv.current.offsetWidth, h = pv.current.offsetHeight;
    const x = Math.min(x0 + 28, innerWidth - w - 16), y = Math.max(86, Math.min(y0 - h / 2, innerHeight - h - 16));
    at.current = { x, y, w, h };
    pv.current.style.transform = `translate3d(${x}px,${y}px,0) rotate(-2.5deg)`;
  };
  const place = (e: React.PointerEvent) => { if (e.pointerType === "mouse") put(e.clientX, e.clientY); };

  const open = (q: Project, i: number, e: React.MouseEvent) => {
    if (!isPlainClick(e)) return;
    e.preventDefault();
    const r = at.current;
    goTo(`/projects/${q.slug}`, hover === i && r.w
      ? { mode: "card", rect: { x: r.x, y: r.y, w: r.w, h: r.h }, src: coverOf(q), title: q.name, eyebrow: q.cat, radius: 12 }
      : { mode: "wipe", title: q.name });
  };

  return (
    <div className="mt-[clamp(3.5rem,8vw,7rem)] text-left">
      <div className="sticky top-[calc(76px+env(safe-area-inset-top))] z-20 border-y border-line bg-bg2/85 backdrop-blur-xl">
        <div className="wrap flex gap-2 overflow-x-auto py-3 [scrollbar-width:none]" role="group" aria-label="Filter projects">
          {TABS.map((c) => (
            <button key={c} type="button" onClick={() => onCat(c)} aria-pressed={cat === c}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-300 ${cat === c ? "border-ink bg-ink text-bg" : "border-line hover:border-acc hover:text-acc"}`}>
              {c} <sup className="ml-0.5 text-[0.65rem] opacity-60">{countOf(c)}</sup>
            </button>
          ))}
        </div>
      </div>

      <div className="wrap pt-4 sm:pt-8">
        <Reveal>
          <p className="pb-2 text-xs font-bold tabular-nums text-mute">{String(list.length).padStart(2, "0")} projects</p>
        </Reveal>
        <ul className="relative" onPointerMove={place} onPointerLeave={() => setHover(null)}>
          <AnimatePresence mode="popLayout" initial={false}>
            {list.map((q, i) => (
              <motion.li key={q.slug} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: EASE }} className="border-b border-line">
                <Link href={`/projects/${q.slug}`} onClick={(e) => open(q, i, e)}
                  onPointerEnter={(e) => { if (e.pointerType === "mouse") { warm(coverOf(q)); place(e); setHover(i); } }}
                  onFocus={(e) => { const r = e.currentTarget.getBoundingClientRect(); put(r.left + r.width * 0.55, r.top + r.height / 2); setHover(i); }}
                  onBlur={() => setHover(null)}
                  className="group grid w-full grid-cols-[2.25rem_1fr_auto] items-baseline gap-x-3 py-4 text-left transition-colors duration-300 hover:text-acc focus-visible:text-acc sm:grid-cols-[4rem_1fr_15rem_2rem] sm:py-5">
                  <span className="text-xs font-bold tabular-nums text-mute">{pad(i)}</span>
                  <span className="font-serif text-[clamp(1.6rem,4vw,3rem)] leading-[1.05] transition-transform duration-500 ease-[cubic-bezier(.2,.7,.2,1)] group-hover:translate-x-2 group-focus-visible:translate-x-2">{q.name}</span>
                  <span className="col-start-2 row-start-2 mt-1 text-sm text-mute sm:col-start-3 sm:row-start-1 sm:mt-0 sm:text-base">{[q.cat, q.loc].filter(Boolean).join(" · ")}</span>
                  <span aria-hidden className="col-start-3 row-start-1 justify-self-end text-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100 sm:col-start-4"><Arrow dir="up-right" /></span>
                </Link>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>

      {/* Hover preview: every photo is stacked here, so switching rows never waits for an image */}
      <div ref={pv} aria-hidden
        className={`pointer-events-none fixed left-0 top-0 z-30 hidden aspect-[4/3] w-52 overflow-hidden rounded-xl bg-bg2 shadow-[0_24px_48px_-20px_rgb(0_0_0/.55)] ring-1 ring-black/5 transition-opacity duration-200 lg:w-64 [@media(hover:hover)]:block ${hover === null ? "opacity-0" : "opacity-100"}`}>
        {canHover && list.map((q, i) => (
          <Image key={q.slug} src={coverOf(q)} alt="" fill sizes="16rem" loading="eager" className={`object-cover transition-opacity duration-150 ${hover === i ? "opacity-100" : "opacity-0"}`} />
        ))}
      </div>
    </div>
  );
}
