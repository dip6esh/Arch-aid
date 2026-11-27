"use client";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { CLIENTS } from "@/lib/content";
import { EASE, Reveal, Words } from "./Reveal";
import { lenisRef } from "./SmoothScroll";
import { CurvedGallery, type GalleryRoll } from "./CurvedGallery";
import { Arrow } from "./Arrow";

const pad = (n: number) => String(n + 1).padStart(2, "0");

/** Filter chips are derived from each client's description, so nothing extra has to be maintained in content.ts. */
const GROUPS = ["All", "Entertainment", "Public Life", "Sport"] as const;
type Group = (typeof GROUPS)[number];
const groupOf = (role: string): Exclude<Group, "All"> =>
  /actor|actress|director|singer|big boss/i.test(role) ? "Entertainment" : /cricket/i.test(role) ? "Sport" : "Public Life";

const RIBBON_ITEMS = CLIENTS.map(([n, , photo]) => ({ key: n, src: photo }));

function Ribbon({ active, onActive, rollRef }: { active: number; onActive: (i: number) => void; rollRef: GalleryRoll }) {
  const [name, role] = CLIENTS[active];
  return (
    <div>
      <CurvedGallery items={RIBBON_ITEMS} onActive={onActive} rollRef={rollRef} eager />
      <div className="wrap mt-3 min-h-[6.5rem] text-center" aria-hidden>
        <div key={active} className="swap">
          <p className="text-xs font-bold tabular-nums text-acc">{pad(active)} <span className="text-mute">/ {CLIENTS.length}</span></p>
          <p className="mt-1 font-serif text-[clamp(1.9rem,4.5vw,3.25rem)] leading-none">{name}</p>
          <p className="mt-2 text-sm text-mute">{role}</p>
        </div>
      </div>
      <p aria-hidden className="mt-2 text-center text-[0.7rem] font-bold uppercase tracking-[0.25em] text-mute">Drag · tap a portrait</p>
    </div>
  );
}

/** Everyone, as a text index. Hover a name (mouse) for a small photo beside the pointer; click or tap to jump to them in the gallery. */
function Index({ active, onPick }: { active: number; onPick: (i: number) => void }) {
  const [group, setGroup] = useState<Group>("All");
  const [hover, setHover] = useState<number | null>(null);
  const pv = useRef<HTMLDivElement>(null);
  const [canHover, setCanHover] = useState(false); // phones and tablets never show the hover preview, so they should not download 18 hidden portraits
  useEffect(() => { setCanHover(matchMedia("(hover: hover) and (pointer: fine)").matches); }, []);
  const count = (g: Group) => (g === "All" ? CLIENTS.length : CLIENTS.filter((c) => groupOf(c[1]) === g).length);
  const list = CLIENTS.map((c, i) => ({ c, i })).filter(({ c }) => group === "All" || groupOf(c[1]) === group);
  const place = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !pv.current) return;
    const w = pv.current.offsetWidth, h = pv.current.offsetHeight;
    const x = Math.min(e.clientX + 28, innerWidth - w - 16), y = Math.max(86, Math.min(e.clientY - h / 2, innerHeight - h - 16));
    pv.current.style.transform = `translate3d(${x}px,${y}px,0) rotate(-2.5deg)`;
  };
  return (
    <section className="pb-[clamp(3.5rem,7vw,6.5rem)]">
      <div className="sticky top-[calc(76px+env(safe-area-inset-top))] z-20 border-y border-line bg-bg/85 backdrop-blur-xl">
        <div className="wrap flex gap-2 overflow-x-auto py-3 [scrollbar-width:none]" role="group" aria-label="Filter clients">
          {GROUPS.map((g) => (
            <button key={g} onClick={() => setGroup(g)} aria-pressed={group === g}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-300 ${group === g ? "border-ink bg-ink text-bg" : "border-line hover:border-acc hover:text-acc"}`}>
              {g} <sup className="ml-0.5 text-[0.65rem] opacity-60">{count(g)}</sup>
            </button>
          ))}
        </div>
      </div>
      <div className="wrap pt-4 sm:pt-8">
        <ul className="relative" onPointerMove={place} onPointerLeave={() => setHover(null)}>
          <AnimatePresence mode="popLayout" initial={false}>
            {list.map(({ c: [name, role], i }) => (
              <motion.li key={name} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4, ease: EASE }} className="border-b border-line">
                <button type="button" onClick={() => onPick(i)} aria-label={`${name}, ${role}. Show in the gallery`} aria-current={active === i}
                  onPointerEnter={(e) => { if (e.pointerType === "mouse") { place(e); setHover(i); } }}
                  className={`group grid w-full grid-cols-[2.25rem_1fr_auto] items-baseline gap-x-3 py-4 text-left transition-colors duration-300 sm:grid-cols-[4rem_1fr_15rem_2rem] sm:py-5 ${active === i ? "text-acc" : "hover:text-acc"}`}>
                  <span className={`text-xs font-bold tabular-nums ${active === i ? "text-acc" : "text-mute"}`}>{pad(i)}</span>
                  <span className="font-serif text-[clamp(1.6rem,4vw,3rem)] leading-[1.05] transition-transform duration-500 ease-[cubic-bezier(.2,.7,.2,1)] group-hover:translate-x-2">{name}</span>
                  <span className="col-start-2 row-start-2 mt-1 text-sm text-mute sm:col-start-3 sm:row-start-1 sm:mt-0 sm:text-base">{role}</span>
                  <span aria-hidden className="col-start-3 row-start-1 justify-self-end text-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:col-start-4"><Arrow dir="up-right" /></span>
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
      {/* Hover preview: every portrait is stacked here, so switching names never waits for an image */}
      <div ref={pv} aria-hidden
        className={`pointer-events-none fixed left-0 top-0 z-30 hidden aspect-[4/5] w-40 overflow-hidden rounded-xl bg-bg2 shadow-[0_24px_48px_-20px_rgb(0_0_0/.55)] ring-1 ring-black/5 transition-opacity duration-200 lg:w-48 [@media(hover:hover)]:block ${hover === null ? "opacity-0" : "opacity-100"}`}>
        {canHover && CLIENTS.map(([n, , photo], i) => (
          <Image key={n} src={photo} alt="" fill sizes="12rem" loading="eager" className={`object-cover object-top transition-opacity duration-150 ${hover === i ? "opacity-100" : "opacity-0"}`} />
        ))}
      </div>
    </section>
  );
}

export function ClientsPage() {
  const [active, setActive] = useState(0);
  const roll = useRef<((i: number) => void) | null>(null);
  // Click / tap: bring that person to the middle of the gallery and take the page back up to it.
  const pick = (i: number) => {
    roll.current?.(i);
    if (lenisRef.current) lenisRef.current.scrollTo(0); else scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <>
      {/* Hero: open and light (no dark box), the gallery sits straight across the page */}
      <section className="relative overflow-hidden pt-[calc(76px+env(safe-area-inset-top)+clamp(1.5rem,5vw,3.5rem))] pb-[clamp(2rem,5vw,4rem)]">
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-[22%] h-[70%]"
          style={{ background: "radial-gradient(55% 50% at 50% 55%, color-mix(in srgb, var(--acc) 22%, transparent), transparent 72%)" }} />
        <div className="wrap relative text-center">
          <span className="eyebrow">Trusted by</span>
          <Words as="h1" className="mx-auto mt-4 max-w-[14ch] text-[clamp(2.75rem,8vw,7rem)] leading-[0.98]">Celebrity Clients</Words>
          <Reveal><p className="mx-auto mt-5 max-w-md text-mute">Film personalities, public figures and leaders who have trusted ARCH-AID with their spaces.</p></Reveal>
        </div>
        <div className="relative mt-2 sm:mt-4"><Ribbon active={active} onActive={setActive} rollRef={roll} /></div>
      </section>
      <Index active={active} onPick={pick} />
    </>
  );
}
