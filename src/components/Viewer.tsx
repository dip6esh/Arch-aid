"use client";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { img, type Project } from "@/lib/content";
import { useEnquiry } from "./EnquiryDialog";
import { EASE } from "./Reveal";
import { lenisRef } from "./SmoothScroll";

const pad = (n: number) => String(n).padStart(2, "0");

/** Full-screen project viewer: swipe, arrow keys, Esc. */
export function Viewer({ items, index, onChange }: { items: Project[]; index: number | null; onChange: (i: number | null) => void }) {
  const enquire = useEnquiry();
  const isOpen = index !== null;
  const [slide, setSlide] = useState(0);
  useEffect(() => { setSlide(0); }, [index]); // each project opens on its first image
  const pics = index !== null ? (items[index].gallery?.length ? items[index].gallery! : [img(items[index].img)]) : [];
  const go = useCallback((d: number) => { setSlide((s) => (pics.length ? (s + d + pics.length) % pics.length : 0)); }, [pics.length]);

  useEffect(() => {
    if (!isOpen) return;
    lenisRef.current?.stop();
    document.documentElement.style.overflow = "hidden";
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") onChange(null); if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); };
    addEventListener("keydown", key);
    return () => { removeEventListener("keydown", key); lenisRef.current?.start(); document.documentElement.style.overflow = ""; };
  }, [isOpen, go, onChange]);

  const p = index !== null ? items[index] : null;
  return (
    <AnimatePresence>
      {p && index !== null && (
        <motion.div key="viewer" role="dialog" aria-modal="true" aria-label={p.name} data-lenis-prevent
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[90] flex flex-col bg-[#151311] text-cream">
          <div className="flex items-center justify-between p-5 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-10">
            <span className="text-sm tabular-nums text-white/60">{pad(slide + 1)} / {pad(pics.length)}</span>
            <button autoFocus aria-label="Close" onClick={() => onChange(null)} className="grid size-11 place-items-center rounded-full border border-white/25 text-xl transition hover:bg-white/10">×</button>
          </div>
          <div className="relative min-h-0 flex-1">
            <motion.div key={`${index}-${slide}`} drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.25}
              onDragEnd={(_, i) => { if (i.offset.x < -70 || i.velocity.x < -500) go(1); else if (i.offset.x > 70 || i.velocity.x > 500) go(-1); }}
              initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: EASE }}
              className="absolute inset-x-4 inset-y-0 cursor-grab active:cursor-grabbing sm:inset-x-24">
              <Image src={pics[slide] ?? img(p.img)} alt={`${p.name} – image ${slide + 1} of ${pics.length}`} fill sizes="100vw" priority draggable={false} className="pointer-events-none object-contain" />
            </motion.div>
            {/* Warm-up: the neighbouring slides load (invisibly, at the same size) while this one is being looked at. */}
            {pics.length > 1 && (
              <div aria-hidden className="pointer-events-none invisible absolute inset-x-4 inset-y-0 sm:inset-x-24">
                {[...new Set([(slide + 1) % pics.length, (slide - 1 + pics.length) % pics.length])].map((k) => (
                  <Image key={pics[k]} src={pics[k]} alt="" fill sizes="100vw" loading="eager" fetchPriority="low" className="object-contain" />
                ))}
              </div>
            )}
            {pics.length > 1 && <>
              <button aria-label="Previous image" onClick={() => go(-1)} className="absolute left-4 top-1/2 hidden size-12 -translate-y-1/2 place-items-center rounded-full border border-white/25 transition hover:bg-white/10 sm:grid">←</button>
              <button aria-label="Next image" onClick={() => go(1)} className="absolute right-4 top-1/2 hidden size-12 -translate-y-1/2 place-items-center rounded-full border border-white/25 transition hover:bg-white/10 sm:grid">→</button>
            </>}
          </div>
          {pics.length > 1 && (
            <div className="flex justify-start gap-2 overflow-x-auto px-5 pt-3 [scrollbar-width:none] sm:justify-center sm:px-10 [&::-webkit-scrollbar]:hidden">
              {pics.map((src, i) => (
                <button key={src} aria-label={`Show image ${i + 1}`} aria-current={i === slide} onClick={() => setSlide(i)}
                  className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-lg border transition ${i === slide ? "border-white opacity-100" : "border-transparent opacity-45 hover:opacity-80"}`}>
                  <Image src={src} alt="" fill sizes="80px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
          <div className="flex flex-wrap items-end justify-between gap-4 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-10">
            <div><h3 className="text-3xl sm:text-4xl">{p.name}</h3><p className="mt-1 text-sm text-white/60">{p.cat}{p.loc ? `, ${p.loc}` : ""} · <span className="sm:hidden">{pics.length > 1 ? "Swipe" : ""}</span><span className="hidden sm:inline">{pics.length > 1 ? "Use ← → keys" : ""}</span></p></div>
            <button onClick={() => { onChange(null); setTimeout(enquire, 450); }} className="rounded-full border border-white/70 px-6 py-3.5 text-sm font-medium transition hover:bg-white/15">Discuss a similar project</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
