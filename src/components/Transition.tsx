"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { flushSync } from "react-dom";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ComponentProps, type MouseEvent } from "react";
import { lenisRef } from "./SmoothScroll";

type Rect = { x: number; y: number; w: number; h: number };

export type GoOptions = {
  /** "card": the clicked picture grows to fill the screen, then lifts away off the new page. "curtain": columns sweep up over the page and lift off the next one. "wipe": one panel sweeps up over the page and carries on off the top as the next page is ready (menu links, always moving, shows the page name). "soft": the page eases out, a thin gold line draws across the top, and the next page rises in (for menu links). */
  mode?: "card" | "curtain" | "soft" | "wipe";
  /** Where the card is on screen right now (card mode). */
  rect?: Rect | null;
  /** Picture that grows out of the card (card mode). */
  src?: string;
  title?: string;
  eyebrow?: string;
  /** Corner radius of the clicked card, in px, so the growing picture starts with the same shape. */
  radius?: number;
};

type Ctx = { go: (href: string, o?: GoOptions) => void };
const TransitionCtx = createContext<Ctx>({ go: () => {} });
export const useGo = () => useContext(TransitionCtx).go;

const COLS = 5;
const SLOW = "cubic-bezier(.76, 0, .24, 1)";
const OUT = "cubic-bezier(.2, .7, .2, 1)";
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const frame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));
const reducedMotion = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/** Run a Web Animation and resolve when it ends (never rejects; "both" keeps the end state until cleanup). */
function play(el: Element | null | undefined, frames: Keyframe[], o: KeyframeAnimationOptions): Promise<unknown> {
  if (!el) return Promise.resolve();
  return el.animate(frames, { fill: "both", ...o }).finished.catch(() => {});
}

const warmed = new Set<string>();
/** Start downloading a picture early (on hover / touch) so it is ready by the time the transition needs it. */
export function warm(src?: string) {
  if (!src || warmed.has(src) || typeof Image === "undefined") return;
  warmed.add(src);
  const im = new Image(); im.decoding = "async"; im.src = src;
}

export const rectOf = (el: Element): Rect => { const r = el.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; };
/** A normal left click (not ctrl/cmd/shift/middle-click, which should keep opening new tabs). */
export const isPlainClick = (e: MouseEvent) => e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;

/**
 * Wraps the whole site. `go(href, options)` plays the opening half of a transition over the current page, navigates while the screen is
 * covered, waits for the new page, then plays the closing half. Without JS, with reduced motion, or for ctrl/cmd-clicks it is a plain link.
 */
export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const busy = useRef(false);
  const arrive = useRef<(() => void) | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const card = useRef<HTMLDivElement>(null);
  const pic = useRef<HTMLImageElement>(null);
  const cols = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLDivElement>(null);
  const veil = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<{ src?: string; title?: string; eyebrow?: string }>({});

  // While the overlay is up, swallow wheel / touch scrolling. (Pausing smooth-scroll instead would hide the page scrollbar and make the layout jump.)
  useEffect(() => {
    const r = root.current;
    if (!r) return;
    const stop = (e: Event) => { if (busy.current) { e.preventDefault(); e.stopPropagation(); } };
    r.addEventListener("wheel", stop, { passive: false }); r.addEventListener("touchmove", stop, { passive: false });
    return () => { r.removeEventListener("wheel", stop); r.removeEventListener("touchmove", stop); };
  }, []);

  // The route has changed: let a waiting transition carry on.
  useEffect(() => { arrive.current?.(); arrive.current = null; }, [pathname]);

  const go = useCallback((href: string, o: GoOptions = {}) => {
    const run = async () => {
      const r = root.current, c = card.current, l = label.current, k = cols.current;
      const here = location.pathname + location.search;
      if (o.mode === "soft") {
        const v = veil.current, ln = line.current;
        if (!v || !ln || reducedMotion() || href === here || href === location.pathname) { router.push(href); return; }
        if (busy.current) return;
        busy.current = true;
        try {
          router.prefetch(href);
          v.style.visibility = "visible"; v.style.pointerEvents = "auto"; ln.style.visibility = "visible";
          // start loading the next page straight away, while the old one is still fading (the fade hides the swap)
          const arrived = new Promise<void>((res) => { arrive.current = res; setTimeout(res, 5000); });
          const fadeIn = play(v, [{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: "ease-out" });
          void play(ln, [{ transform: "scaleX(0)", opacity: 1 }, { transform: "scaleX(.7)", opacity: 1 }], { duration: 500, easing: OUT }); // the line keeps drawing while the page loads
          await wait(90);
          router.push(href);
          await Promise.all([fadeIn, arrived]);
          arrive.current = null;
          lenisRef.current?.scrollTo(0, { immediate: true });
          window.scrollTo(0, 0);
          document.querySelector("main")?.animate([{ opacity: 0, transform: "translateY(14px)" }, { opacity: 1, transform: "none" }], { duration: 550, easing: OUT });
          await Promise.all([
            play(v, [{ opacity: 1 }, { opacity: 0 }], { duration: 380, easing: "ease-in-out" }),
            play(ln, [{ transform: "scaleX(.7)", opacity: 1 }, { transform: "scaleX(1)", opacity: 0 }], { duration: 380, easing: "ease-out" }),
          ]);
        } catch {
          router.push(href);
        } finally {
          [v, ln].forEach((n) => { n.getAnimations().forEach((a) => a.cancel()); n.style.visibility = "hidden"; n.style.pointerEvents = "none"; });
          busy.current = false;
        }
        return;
      }
      if (!r || !c || !l || !k || reducedMotion() || href === here || href === location.pathname) { router.push(href); return; }
      if (busy.current) return;
      busy.current = true;
      const mode = o.mode === "card" && o.rect && o.src ? "card" : "curtain";
      const fast = o.mode === "wipe"; // curtain, but one panel, quicker, and loading starts while it is still rising
      const layers = Array.from(k.querySelectorAll<HTMLElement>("[data-layer]"));
      const accent = layers.filter((n) => n.dataset.layer === "acc"), char = layers.filter((n) => n.dataset.layer === "char");

      const reset = () => {
        [r, c, l, pic.current, ...layers].forEach((n) => n?.getAnimations().forEach((a) => a.cancel()));
        r.style.visibility = "hidden"; r.style.pointerEvents = "none";
        c.style.display = "none"; k.style.display = "none";
        layers.forEach((n) => { n.style.transformOrigin = "50% 100%"; n.style.transform = "scaleY(0)"; });
        l.style.opacity = "0";
      };

      try {
        router.prefetch(href);
        flushSync(() => setView({ src: mode === "card" ? o.src : undefined, title: o.title, eyebrow: o.eyebrow })); // overlay content is in the DOM now: no waiting a frame
        const im = pic.current;
        if (mode === "card" && im && !im.complete) { try { await Promise.race([im.decode(), wait(180)]); } catch { /* shows as soon as it arrives */ } }

        // ── opening half: cover the page ──────────────────────────────────────────────
        reset();
        r.style.visibility = "visible"; r.style.pointerEvents = "auto";
        l.style.opacity = "0";
        let opening: Promise<unknown> = Promise.resolve();
        if (mode === "card") {
          const b = o.rect!, rad = o.radius ?? 0;
          k.style.display = "none"; c.style.display = "block";
          Object.assign(c.style, { left: `${b.x}px`, top: `${b.y}px`, width: `${b.w}px`, height: `${b.h}px`, borderRadius: `${rad}px` });
          opening = Promise.all([
            play(c, [
              { left: `${b.x}px`, top: `${b.y}px`, width: `${b.w}px`, height: `${b.h}px`, borderRadius: `${rad}px` },
              { left: "0px", top: "0px", width: "100%", height: "100%", borderRadius: "0px" },
            ], { duration: 750, easing: SLOW }),
            play(pic.current, [{ transform: "scale(1)" }, { transform: "scale(1.06)" }], { duration: 750, easing: SLOW }),
            play(l, [{ opacity: 0, transform: "translateY(26px)" }, { opacity: 1, transform: "none" }], { duration: 500, delay: 330, easing: OUT }),
          ]);
        } else {
          c.style.display = "none"; k.style.display = "block";
          layers.forEach((n) => { n.style.transformOrigin = "50% 100%"; });
          const step = fast ? 0 : 45, dur = fast ? 450 : 650, lead = fast ? 70 : 90;
          opening = Promise.all([
            ...accent.map((n, i) => play(n, [{ transform: "scaleY(0)" }, { transform: "scaleY(1)" }], { duration: dur, delay: i * step, easing: SLOW })),
            ...char.map((n, i) => play(n, [{ transform: "scaleY(0)" }, { transform: "scaleY(1)" }], { duration: dur, delay: i * step + lead, easing: SLOW })),
            play(l, [{ opacity: 0, transform: "translateY(26px)" }, { opacity: 1, transform: "none" }], { duration: fast ? 380 : 500, delay: fast ? 200 : 450, easing: OUT }),
          ]);
        }

        // ── navigate while covered, then wait for the new page ────────────────────────
        const arrived = new Promise<void>((res) => { arrive.current = res; setTimeout(res, 5000); }); // never trap the visitor if navigation stalls
        if (fast) await wait(170); else await opening; // wipe: start loading while the panel is still rising, so the motion never pauses
        router.push(href);
        await Promise.all([opening, arrived]);
        arrive.current = null;
        lenisRef.current?.scrollTo(0, { immediate: true });
        window.scrollTo(0, 0);
        if (!fast) await wait(120); // give the new page's first picture a moment to paint

        // ── closing half: lift away to reveal the new page ────────────────────────────
        if (mode === "card") {
          await Promise.all([
            play(c, [{ clipPath: "inset(0 0 0% 0)" }, { clipPath: "inset(0 0 100% 0)" }], { duration: 950, easing: SLOW }),
            play(pic.current, [{ transform: "translateY(0) scale(1.06)" }, { transform: "translateY(-9%) scale(1.14)" }], { duration: 950, easing: SLOW }),
            play(l, [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(-30px)" }], { duration: 380, easing: "ease-in" }),
          ]);
        } else {
          layers.forEach((n) => { n.style.transformOrigin = "50% 0%"; });
          const step = fast ? 0 : 45, dur = fast ? 560 : 700, lead = fast ? 70 : 90;
          await Promise.all([
            ...char.map((n, i) => play(n, [{ transform: "scaleY(1)" }, { transform: "scaleY(0)" }], { duration: dur, delay: i * step, easing: SLOW })),
            ...accent.map((n, i) => play(n, [{ transform: "scaleY(1)" }, { transform: "scaleY(0)" }], { duration: dur, delay: i * step + lead, easing: SLOW })),
            play(l, [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(-30px)" }], { duration: 360, easing: "ease-in" }),
          ]);
        }
      } catch {
        router.push(href);
      } finally {
        reset();
        busy.current = false;
      }
    };
    void run();
  }, [router]);

  const value = useMemo(() => ({ go }), [go]);

  return (
    <TransitionCtx.Provider value={value}>
      {children}
      {/* soft mode: a veil in the page colour (under the menu bar, so the menu stays put) and a thin line over everything */}
      <div ref={veil} aria-hidden className="pointer-events-none invisible fixed inset-0 z-[45] bg-bg opacity-0" />
      <div ref={line} aria-hidden className="pointer-events-none invisible fixed inset-x-0 top-0 z-[70] h-[3px] origin-left bg-acc opacity-0" style={{ transform: "scaleX(0)" }} />
      <div ref={root} aria-hidden className="pointer-events-none invisible fixed inset-0 z-[150] overflow-hidden">
        {/* card mode: the clicked picture, growing to full screen */}
        <div ref={card} className="absolute hidden overflow-hidden bg-char [clip-path:inset(0)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {view.src && <img ref={pic} src={view.src} alt="" decoding="async" className="absolute inset-0 size-full object-cover" />}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/35" />
        </div>
        {/* curtain mode: columns sweep up in the accent colour, then charcoal right behind it */}
        <div ref={cols} className="absolute inset-0 hidden">
          {Array.from({ length: COLS }, (_, i) => (
            <div key={i} className="absolute inset-y-0" style={{ left: `${(i * 100) / COLS}%`, width: `${100 / COLS + 0.35}%` }}>
              <div data-layer="acc" className="absolute inset-0 bg-acc" style={{ transformOrigin: "50% 100%", transform: "scaleY(0)" }} />
              <div data-layer="char" className="absolute inset-0 bg-char" style={{ transformOrigin: "50% 100%", transform: "scaleY(0)" }} />
            </div>
          ))}
        </div>
        <div ref={label} className="absolute inset-0 grid place-items-center px-6 text-center text-cream opacity-0">
          <div>
            {view.eyebrow && <p className="mb-4 text-[0.72rem] font-bold uppercase tracking-[.25em] text-acc">{view.eyebrow}</p>}
            <p className="mx-auto max-w-[16ch] font-serif text-[clamp(2.6rem,8vw,6.5rem)] leading-[1]">{view.title}</p>
          </div>
        </div>
      </div>
    </TransitionCtx.Provider>
  );
}

type TLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
  /** How to arrive. Omit for the curtain; use mode "card" on a card so its picture grows into the next page. */
  via?: GoOptions;
};

/** A Link that plays the page transition. Falls back to a normal link for new-tab clicks. */
export function TLink({ href, via, onClick, ...rest }: TLinkProps) {
  const go = useGo();
  return (
    <Link href={href} {...rest}
      onPointerEnter={(e) => { rest.onPointerEnter?.(e); warm(via?.src); }}
      onTouchStart={(e) => { rest.onTouchStart?.(e); warm(via?.src); }}
      onClick={(e) => {
      onClick?.(e);
      if (e.defaultPrevented || !isPlainClick(e)) return;
      e.preventDefault();
      go(href, { ...via, rect: via?.mode === "card" ? rectOf(e.currentTarget) : null });
    }} />
  );
}
