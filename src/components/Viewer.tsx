"use client";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { img, type Project } from "@/lib/content";
import type { Origin } from "@/lib/origin";
import { reduced } from "./Drive";
import { useEnquiry } from "./EnquiryDialog";
import { EASE } from "./Reveal";
import { lenisRef } from "./SmoothScroll";
import { Arrow } from "./Arrow";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;
const pad = (n: number) => String(n).padStart(2, "0");
const HIDE_AFTER = 4500; // ms of stillness before the controls fade out
const GROW = 0.8;        // seconds for the picture to grow out of its card (and back)

type Area = { w: number; h: number; x: number; y: number };

/**
 * The largest rectangle of the given shape that fits the photo area, centred: exactly where the full-screen photo ends up.
 * `area` is MEASURED from the real photo's own box (not guessed from innerWidth / clientWidth), so the growing picture and the real photo
 * are guaranteed to occupy the same pixels, whatever the scrollbar, gutter or browser does, and the hand-off between them cannot jump.
 */
const fit = (ratio: number, area: Area) => {
  const vw = area.w, vh = area.h;
  let w = vw, h = vw / ratio;
  if (h > vh) { h = vh; w = vh * ratio; }
  return { left: (vw - w) / 2, top: (vh - h) / 2, width: w, height: h };
};

/**
 * Immersive full-screen project viewer.
 * - Opens by growing out of the picture that was clicked (`origin`) and, when closed on that same picture, shrinks back into it.
 * - The photo fills the whole screen; controls float over it, fade away by themselves and return when the mouse moves.
 * - Click / tap the photo to hide or show the controls. ← → keys change the photo WITHOUT bringing the controls back. Esc closes.
 * `start` = which photo to open on. `page` = show the link to the project's own page (turn off when already on it).
 */
export function Viewer({ items, index, onChange, origin = null, start = 0, page = true }: {
  items: Project[]; index: number | null; onChange: (i: number | null) => void; origin?: Origin | null; start?: number; page?: boolean;
}) {
  const enquire = useEnquiry();
  const isOpen = index !== null;
  const [slide, setSlide] = useState(0);
  const [ui, setUi] = useState(true); // controls visible?
  const [mode, setMode] = useState<"off" | "open" | "close">("off"); // the picture travelling between card and full screen
  const [arrived, setArrived] = useState(false);
  const [loaded, setLoaded] = useState(false); // the full-size photo has loaded underneath
  const thumbs = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastPos = useRef({ x: -1, y: -1 }); // last mouse position that counted as "real" movement
  const quietUntil = useRef(0); // after a click-to-hide, ignore mouse jitter for a moment
  const areaRef = useRef<HTMLDivElement>(null); // the real photo's box: the single source of truth for where the picture lands
  const [area, setArea] = useState<Area | null>(null);
  const dialog = useRef<HTMLDivElement>(null); // keyboard focus rests here, not on a button
  const dragging = useRef(false); // a swipe is in progress (or just ended): the tap that follows it must not toggle the controls
  const overUi = useRef(false); // pointer is resting on a control: keep everything visible
  /** Show the controls and (re)start the countdown to hide them. */
  const wake = useCallback(() => {
    setUi(true);
    clearTimeout(timer.current);
    if (!overUi.current) timer.current = setTimeout(() => setUi(false), HIDE_AFTER);
  }, []);
  /** Mouse moved: show the controls, but ignore tiny jitters and the moment right after a click-to-hide. */
  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType === "touch" || Date.now() < quietUntil.current) return;
    const d = Math.hypot(e.clientX - lastPos.current.x, e.clientY - lastPos.current.y);
    if (d < 5) return;
    lastPos.current = { x: e.clientX, y: e.clientY };
    wake();
  };
  const hold = { onPointerEnter: () => { overUi.current = true; clearTimeout(timer.current); }, onPointerLeave: () => { overUi.current = false; wake(); } };

  const ghostOK = !!origin && !reduced();
  // Reset for each opening *during render*, so the very first frame is already right (no flash of controls or of the wrong photo).
  const [seen, setSeen] = useState<number | null>(null);
  if (index !== seen) {
    setSeen(index);
    const g = index !== null && ghostOK;
    setSlide(start); setArrived(false); setLoaded(false); setMode(g ? "open" : "off"); setUi(!g); // with the grow-out, controls wait until the picture has landed
  }
  useEffect(() => {
    overUi.current = false;
    if (index === null) return;
    if (ghostOK) { const t = setTimeout(wake, GROW * 1000 + 100); return () => { clearTimeout(t); clearTimeout(timer.current); }; }
    wake();
    return () => clearTimeout(timer.current);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, wake]);

  // The travelling picture has landed: hand over to the real photo as soon as it has loaded.
  useEffect(() => {
    if (mode !== "open" || !arrived) return;
    if (loaded) { setMode("off"); return; }
    const t = setTimeout(() => setMode("off"), 1500);
    return () => clearTimeout(t);
  }, [mode, arrived, loaded]);

  useIsoLayoutEffect(() => {
    if (index === null) return;
    const measure = () => {
      const r = areaRef.current?.getBoundingClientRect();
      if (r) setArea((a) => (a && a.w === r.width && a.h === r.height && a.x === r.left && a.y === r.top ? a : { w: r.width, h: r.height, x: r.left, y: r.top }));
    };
    measure(); addEventListener("resize", measure);
    return () => removeEventListener("resize", measure);
  }, [index, mode]);

  const pics = index !== null ? (items[index].gallery?.length ? items[index].gallery! : [img(items[index].img)]) : [];
  const go = useCallback((d: number) => { setSlide((s) => (pics.length ? (s + d + pics.length) % pics.length : 0)); }, [pics.length]);

  /** Close. If we are still on the photo we opened from, shrink back into its card first. */
  const requestClose = () => {
    if (mode === "close") return;
    if (ghostOK && slide === start) { clearTimeout(timer.current); setUi(false); setMode("close"); }
    else onChange(null);
  };
  const closeRef = useRef(requestClose);
  closeRef.current = requestClose;

  // The page is locked only while the viewer is really open. The moment closing starts (the photo shrinking back to its card) scrolling is released.
  const locked = isOpen && mode !== "close";
  useEffect(() => {
    if (!locked) return;
    lenisRef.current?.stop();
    document.documentElement.style.overflow = "hidden";
    document.documentElement.dataset.viewer = "open"; // hides the site's gold follower-cursor while the viewer is up
    dialog.current?.focus({ preventScroll: true }); // focus the viewer itself so no control is left "holding" the keyboard
    const key = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
      if (e.key === "Escape") closeRef.current();
      else if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
    };
    addEventListener("keydown", key, true); // capture: runs before anything focused inside the viewer can swallow the key
    return () => { removeEventListener("keydown", key, true); lenisRef.current?.start(); document.documentElement.style.overflow = ""; delete document.documentElement.dataset.viewer; };
  }, [locked, go]);

  // Scrolling while the photo is still shrinking back: finish closing at once, so the page never fights a landing animation aimed at where the card used to be.
  useEffect(() => {
    if (mode !== "close") return;
    const skip = () => onChange(null);
    addEventListener("wheel", skip, { passive: true }); addEventListener("touchmove", skip, { passive: true });
    return () => { removeEventListener("wheel", skip); removeEventListener("touchmove", skip); };
  }, [mode, onChange]);

  // keep the active thumbnail in view
  useEffect(() => {
    thumbs.current?.querySelector<HTMLElement>("[aria-current='true']")?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [slide, index]);

  const p = index !== null ? items[index] : null;
  const fade = `transition-opacity duration-300 ${ui ? "opacity-100" : "pointer-events-none opacity-0"}`;
  const round = "grid size-11 place-items-center rounded-full border border-white/30 bg-black/35 text-xl backdrop-blur-md transition hover:bg-white/20";

  // the travelling picture: from the card to the full-screen spot (opening), or back again (closing)
  let ghost: React.ReactNode = null;
  if (mode !== "off" && origin && area) {
    const K = { left: origin.x - area.x, top: origin.y - area.y, width: origin.w, height: origin.h }, C = fit(origin.ratio, area);
    const opening = mode === "open";
    ghost = (
      <motion.div key={mode} aria-hidden initial={opening ? K : C} animate={opening ? C : K} transition={{ duration: GROW, ease: EASE }}
        onAnimationComplete={() => { if (opening) setArrived(true); else onChange(null); }}
        className="pointer-events-none absolute z-30 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <motion.img src={origin.src} alt="" draggable={false} initial={{ scale: opening ? 1.12 : 1 }} animate={{ scale: opening ? 1 : 1.12 }}
          transition={{ duration: GROW, ease: EASE }} className="size-full object-cover object-top" />
      </motion.div>
    );
  }

  return (
    <AnimatePresence>
      {p && index !== null && (
        <motion.div key="viewer" ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-label={p.name} data-lenis-prevent
          onPointerUp={(e) => { if (e.pointerType === "mouse" && (e.target as HTMLElement).closest("button")) requestAnimationFrame(() => dialog.current?.focus({ preventScroll: true })); }} // after a mouse click on a control, hand the keyboard back to the viewer
          initial={ghostOK ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, pointerEvents: "none" }} transition={{ duration: 0.4 }}
          onPointerMove={onMove}
          className={`fixed inset-0 z-[90] overflow-hidden text-cream outline-none ${mode === "close" ? "pointer-events-none" : ""} ${ui ? "" : "cursor-none"}`}>

          {/* Dark backdrop (fades in while the picture grows, out while it shrinks) */}
          <motion.div aria-hidden initial={{ opacity: ghostOK ? 0 : 1 }} animate={{ opacity: mode === "close" ? 0 : 1 }}
            transition={{ duration: mode === "close" ? GROW * 0.9 : 0.5 }} className="absolute inset-0 bg-[#0c0b0a]" />

          {/* The photo: the whole screen. object-contain shows the full picture at the largest size that fits. */}
          <div ref={areaRef} className="absolute inset-0" style={{ visibility: mode === "off" ? "visible" : "hidden" }}>
            <motion.div key={`${index}-${slide}`} drag="x" dragConstraints={{ left: 0, right: 0 }} dragElastic={0.25}
              onDragStart={() => { dragging.current = true; }}
              onDragEnd={(_, i) => {
                setTimeout(() => { dragging.current = false; }, 120); // motion still fires a "tap" when a finger lifts after a swipe; this lets onTap tell the two apart
                if (i.offset.x < -70 || i.velocity.x < -500) go(1); else if (i.offset.x > 70 || i.velocity.x > 500) go(-1);
              }}
              onTap={() => { // click (mouse) or tap (touch) toggles the controls, but never at the end of a swipe
                if (dragging.current) return;
                if (ui) { clearTimeout(timer.current); setUi(false); quietUntil.current = Date.now() + 800; } else wake();
              }}
              initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: EASE }}
              className={`absolute inset-0 ${ui ? "cursor-default active:cursor-grabbing" : "cursor-none"}`}>
              <Image src={pics[slide] ?? img(p.img)} alt={`${p.name} – image ${slide + 1} of ${pics.length}`} fill sizes="100vw" quality={85} priority draggable={false}
                onLoad={() => setLoaded(true)} className="pointer-events-none object-contain" />
            </motion.div>
          </div>

          {ghost}

          {/* Warm-up: neighbouring slides load invisibly while this one is being looked at. */}
          {pics.length > 1 && (
            <div aria-hidden className="pointer-events-none invisible absolute inset-0">
              {[...new Set([(slide + 1) % pics.length, (slide - 1 + pics.length) % pics.length])].map((k) => (
                <Image key={pics[k]} src={pics[k]} alt="" fill sizes="100vw" quality={85} loading="eager" fetchPriority="low" className="object-contain" />
              ))}
            </div>
          )}

          {/* Top bar (floats over the photo) */}
          <div {...hold} className={`pointer-events-none absolute inset-x-0 top-0 z-40 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent p-4 pt-[max(1rem,env(safe-area-inset-top))] sm:px-8 ${fade}`}>
            <span className="rounded-full bg-black/35 px-3.5 py-1.5 text-sm tabular-nums text-white/85 backdrop-blur-md">{pad(slide + 1)} / {pad(pics.length)}</span>
            <button aria-label="Close" onClick={requestClose} className={`pointer-events-auto ${round}`}>×</button>
          </div>

          {/* Side arrows */}
          {pics.length > 1 && <>
            <button {...hold} aria-label="Previous image" onClick={() => go(-1)} className={`absolute left-4 top-1/2 z-40 hidden size-12 -translate-y-1/2 sm:grid ${round} ${fade}`}><Arrow dir="left" className="size-6" /></button>
            <button {...hold} aria-label="Next image" onClick={() => go(1)} className={`absolute right-4 top-1/2 z-40 hidden size-12 -translate-y-1/2 sm:grid ${round} ${fade}`}><Arrow className="size-6" /></button>
          </>}

          {/* Bottom overlay: thumbnails + a slim caption row */}
          <div {...hold} className={`absolute inset-x-0 bottom-0 z-40 bg-gradient-to-t from-black/70 via-black/35 to-transparent pt-10 pb-[max(0.9rem,env(safe-area-inset-bottom))] ${fade}`}>
            {pics.length > 1 && (
              <div ref={thumbs} className="flex justify-start gap-2 overflow-x-auto px-4 pb-3 [scrollbar-width:none] sm:justify-center sm:px-8 [&::-webkit-scrollbar]:hidden">
                {pics.map((src, i) => (
                  <button key={src} aria-label={`Show image ${i + 1}`} aria-current={i === slide} onClick={() => setSlide(i)}
                    className={`relative h-11 w-16 shrink-0 overflow-hidden rounded-md border transition sm:h-12 sm:w-[4.5rem] ${i === slide ? "border-white opacity-100" : "border-transparent opacity-50 hover:opacity-90"}`}>
                    <Image src={src} alt="" fill sizes="72px" className="object-cover" />
                  </button>
                ))}
              </div>
            )}
            <div className="flex items-center justify-between gap-3 px-4 sm:px-8">
              <div className="min-w-0">
                <h3 className="truncate text-xl leading-tight sm:text-2xl">{p.name}</h3>
                <p className="mt-0.5 truncate text-xs text-white/65 sm:text-sm">
                  {p.cat}{p.loc ? `, ${p.loc}` : ""}
                  {page && <Link href={`/projects/${p.slug}`} className="sm:hidden"> · <span className="underline underline-offset-2">Project page</span></Link>}
                  {pics.length > 1 && <span className="hidden sm:inline"> · arrow keys · click photo to hide</span>}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {page && <Link href={`/projects/${p.slug}`} className="hidden rounded-full border border-white/30 bg-black/30 px-5 py-3 text-sm font-medium backdrop-blur-md transition hover:bg-white/20 sm:inline-flex sm:items-center sm:gap-2">Project page <Arrow dir="up-right" className="size-4" /></Link>}
                <button onClick={() => { onChange(null); setTimeout(enquire, 450); }} className="rounded-full border border-white/60 bg-black/30 px-4 py-2.5 text-xs font-medium backdrop-blur-md transition hover:bg-white/20 sm:px-6 sm:py-3 sm:text-sm">
                  <span className="sm:hidden">Discuss project</span><span className="hidden sm:inline">Discuss a similar project</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
