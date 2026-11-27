"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ALL_CATEGORY, FEATURED, PROJECTS, PROJECT_CATEGORIES, coverOf, img } from "@/lib/content";
import type { Origin } from "@/lib/origin";
import { Reveal, Words } from "./Reveal";
import { CurvedGallery } from "./CurvedGallery";
import { ProjectIndex } from "./ProjectIndex";
import { TLink, isPlainClick, useGo, warm } from "./Transition";
import { Arrow } from "./Arrow";

const pad = (n: number) => String(n).padStart(2, "0");

/** Category filter, styled as "ALL PROJECT / RESIDENCE / CORPORATE …" */
function CategoryTabs({ value, onChange, className = "" }: { value: string; onChange: (c: string) => void; className?: string }) {
  const tabs = [ALL_CATEGORY, ...PROJECT_CATEGORIES];
  return (
    <nav aria-label="Project categories" className={className}>
      <ul className="flex items-center gap-x-4 whitespace-nowrap text-[0.72rem] font-bold uppercase tracking-[0.16em] sm:gap-x-6 sm:text-[0.8rem]">
        {tabs.map((c, i) => (
          <li key={c} className="flex items-center gap-x-4 sm:gap-x-6">
            {i > 0 && <span aria-hidden className="text-mute/60">/</span>}
            <button type="button" aria-pressed={c === value} onClick={() => onChange(c)}
              className={`py-2 transition-colors ${c === value ? "text-acc" : "text-ink hover:text-acc"}`}>{c}</button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/**
 * Selected work as the same curved gallery used on the Celebrity Clients page.
 * Drag or throw it, tap a card to roll it to the middle, tap the centred card (or "View album") to open its project page.
 * `featured` = the lighter home-page showcase (no filter, links through to /projects). Default = the full filterable gallery.
 */
export function Projects({ featured = false }: { featured?: boolean }) {
  const roll = useRef<((i: number) => void) | null>(null);
  const goTo = useGo();
  const origin = useRef<(() => Origin | null) | null>(null);
  const [active, setActive] = useState(0);
  const [cat, setCat] = useState<string>(ALL_CATEGORY);
  const list = useMemo(() => (featured ? FEATURED : cat === ALL_CATEGORY ? PROJECTS : PROJECTS.filter((p) => p.cat === cat)), [cat, featured]);
  const items = useMemo(() => list.map((p) => ({ key: p.slug, src: img(p.img), alt: `${p.cat} interior: ${p.name}` })), [list]);
  const pick = (c: string) => { setCat(c); setActive(0); };
  // the picture grows out of the front card into the project page
  const openProject = (i: number, from: Origin | null = origin.current?.() ?? null) => {
    const q = list[i];
    goTo(`/projects/${q.slug}`, { mode: "card", rect: from, src: coverOf(q), title: q.name, eyebrow: q.cat });
  };
  const go = (d: number) => roll.current?.((active + d + list.length) % list.length);
  const p = list[Math.min(active, list.length - 1)];
  useEffect(() => { if (p) warm(coverOf(p)); }, [p]); // the front card's big picture is ready before it is tapped

  return (
    <section id="projects" className={`overflow-x-clip bg-bg2 ${featured ? "py-[clamp(3.5rem,8vw,7rem)]" : "pb-[clamp(3.5rem,8vw,7rem)] pt-[calc(76px+2.5rem)]"}`}>
      <div className="wrap text-center">
        <Reveal><p className="eyebrow mb-5">Selected work</p></Reveal>
        <Words className="mx-auto max-w-[16ch] text-[clamp(2.6rem,7vw,5.5rem)] leading-[1]">Spaces we’ve brought to life.</Words>
        <Reveal><p className="mx-auto mt-5 max-w-md text-mute">Drag to turn the wall, then tap a space to step inside.</p></Reveal>
        {!featured && <CategoryTabs value={cat} onChange={pick} className="mt-7 flex justify-start overflow-x-auto [scrollbar-width:none] sm:justify-center [&::-webkit-scrollbar]:hidden" />}
      </div>

      {list.length === 0 ? (
        <p className="wrap mt-10 text-center font-serif text-2xl text-mute">Albums for {cat} are coming soon.</p>
      ) : (
        <>
          <div className="mt-4 sm:mt-6">
            <CurvedGallery key={cat} items={items} landscape onActive={setActive} rollRef={roll} originRef={origin} onOpen={openProject} />
          </div>
          <div className="wrap mt-3 min-h-[8.5rem] text-center">
            <div key={active} className="swap" aria-live="polite">
              <p className="text-xs font-bold tabular-nums text-acc">{pad(active + 1)} <span className="text-mute">/ {pad(list.length)}</span></p>
              <h3 className="mt-1 font-serif text-[clamp(1.9rem,4.5vw,3.25rem)] font-normal leading-none">{p.name}</h3>
              <p className="mt-2 text-sm text-mute">{p.cat}</p>
            </div>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button type="button" aria-label="Previous project" onClick={() => go(-1)} className="grid size-11 place-items-center rounded-full border border-line transition-colors hover:border-acc hover:text-acc"><Arrow dir="left" /></button>
              <Link href={`/projects/${p.slug}`} onClick={(e) => { if (!isPlainClick(e)) return; e.preventDefault(); openProject(Math.min(active, list.length - 1)); }} className="btn btn-solid">View Album <span className="btn-dot"><Arrow dir="up-right" /></span></Link>
              <button type="button" aria-label="Next project" onClick={() => go(1)} className="grid size-11 place-items-center rounded-full border border-line transition-colors hover:border-acc hover:text-acc"><Arrow /></button>
            </div>
          </div>
        </>
      )}

      {!featured && list.length > 0 && <ProjectIndex list={list} cat={cat} onCat={pick} />}

      <div className="wrap mt-8 flex flex-wrap justify-center gap-3">
        {featured && <TLink href="/projects" via={{ mode: "curtain", eyebrow: "Index", title: "All projects" }} className="btn btn-solid">View All Projects <span className="btn-dot"><Arrow /></span></TLink>}
      </div>

    </section>
  );
}
