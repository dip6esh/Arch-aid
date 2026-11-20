"use client";
import { Fragment, useEffect, useRef } from "react";
import { useEnquiry } from "./EnquiryDialog";

const N = 240;
// Every stage uses the SAME template: eyebrow, 2-line headline (last word accented), one line of copy, action slot.
const STAGES = [
  { e: "Architecture · Interiors · Landscape", a: "Spaces that tell your", b: "story.", d: "Thoughtfully designed interiors, shaped around you." },
  { e: "01 / 03 — The brief", a: "The empty", b: "canvas.", d: "Every project begins as a blank room and a conversation." },
  { e: "02 / 03 — The design", a: "The vision takes", b: "shape.", d: "Planning, materials and light begin to come together." },
  { e: "03 / 03 — The result", a: "Lived in. Loved.", b: "Yours.", d: "A space that tells your story." },
];
const LABELS = ["Welcome", "The canvas", "The vision", "Home"];
// Scroll progress (0–1 across the hero) where each stage begins. Stage 0 is the intro that sits on the solid curtain.
// Stage 1 starts as soon as the curtain begins to part, so "The empty canvas" lands while the room really is empty.
const B = [0, 0.05, 0.27, 0.56];
const JUMP = [0, 0.14, 0.3, 0.6]; // where tapping a chapter lands (curtain fully open, stage visible)
const CURTAIN = 0.1; // the curtain finishes opening by here: a short, quick scroll
// [scroll progress, frame]: the footage is NOT mapped linearly. Frames 0–20 are the empty room, so it holds there
// until "The empty canvas" has had its moment, then the room furnishes itself under "The vision takes shape".
const KEYS: [number, number][] = [[0, 0], [CURTAIN, 0], [0.27, 21], [0.56, 108], [0.94, N - 1], [1, N - 1]];
// Fabric folds: soft vertical pleats. They squash together as the panel gathers, which is what sells the curtain.
const PLEAT: React.CSSProperties = {
  backgroundImage: "linear-gradient(90deg, rgba(0,0,0,.34) 0%, rgba(255,255,255,.08) 26%, rgba(0,0,0,.16) 50%, rgba(255,255,255,.06) 74%, rgba(0,0,0,.34) 100%)",
  backgroundSize: "7.5rem 100%",
};
const frameAt = (p: number) => {
  for (let i = 1; i < KEYS.length; i++) {
    const [p1, f1] = KEYS[i], [p0, f0] = KEYS[i - 1];
    if (p <= p1) return p1 === p0 ? f1 : f0 + ((f1 - f0) * (p - p0)) / (p1 - p0);
  }
  return N - 1;
};

/** Headline split into words so each one can slide up out of its own mask. */
function Line({ a, b }: { a: string; b: string }) {
  const parts: [string, string][] = [...a.split(" ").map((t): [string, string] => [t, ""]), ...b.split(" ").map((t): [string, string] => [t, "italic text-acc"])];
  return <>{parts.map(([t, c], i) => <Fragment key={i}><span className="w"><span className={c} style={{ "--i": i } as React.CSSProperties}>{t}</span></span>{" "}</Fragment>)}</>;
}
const src = (i: number) => `/frames/hero-${1000 + i}.webp`;

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const stick = useRef<HTMLDivElement>(null);
  const cv = useRef<HTMLCanvasElement>(null);
  const cue = useRef<HTMLDivElement>(null);
  const stages = useRef<(HTMLDivElement | null)[]>([]);
  const segs = useRef<(HTMLSpanElement | null)[]>([]);
  const labs = useRef<(HTMLSpanElement | null)[]>([]);
  const rail = useRef<HTMLDivElement>(null);
  const curtain = useRef<HTMLDivElement>(null);
  const curL = useRef<HTMLDivElement>(null);
  const curR = useRef<HTMLDivElement>(null);
  const enquire = useEnquiry();

  useEffect(() => {
    const canvas = cv.current!, ctx = canvas.getContext("2d")!, hero = root.current!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const cache = new Map<number, HTMLImageElement>();
    let cur = 0, prog = 0, started = false, drawn = -1, shown = -1, W = 0, H = 0, dpr = 1, raf = 0;

    const load = (i: number) => {
      if (i < 0 || i >= N || cache.has(i)) return;
      const im = new Image(); im.onload = () => kick(); im.onerror = () => setTimeout(() => { if (cache.get(i) === im) cache.delete(i); }, 2000); im.src = src(i); cache.set(i, im);
    };
    const ready = (k: number) => { const im = cache.get(k); return im?.complete && im.naturalWidth ? im : null; };
    const nearest = (i: number): [HTMLImageElement, number] | null => {
      for (let d = 0; d < N; d++) for (const k of [i - d, i + d]) { const im = ready(k); if (im) return [im, k]; }
      return null;
    };
    const size = () => {
      const nd = Math.min(devicePixelRatio || 1, 2), nw = canvas.clientWidth, nh = canvas.clientHeight;
      if (nd === dpr && nw === W && nh === H) return; // ignore no-op resizes (mobile toolbar show/hide)
      dpr = nd; W = nw; H = nh; canvas.width = W * dpr; canvas.height = H * dpr; drawn = -1;
    };
    const draw = (i: number) => {
      const hit = nearest(i); if (!hit) return;
      const [im, k] = hit; shown = k;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // cover the FULL canvas on every screen size (on portrait phones, bias the crop slightly right)
      const wide = W / H >= 1.3, s = Math.max(W / im.naturalWidth, H / im.naturalHeight) * (1 + prog * 0.08);
      const dw = im.naturalWidth * s, dh = im.naturalHeight * s, dx = (W - dw) * (wide ? 0.5 : 0.55), dy = (H - dh) / 2;
      ctx.fillStyle = "#25221f"; ctx.fillRect(0, 0, W, H);
      ctx.drawImage(im, dx, dy, dw, dh);
    };
    const tick = () => {
      raf = 0;
      const r = hero.getBoundingClientRect();
      const p = reduce ? 1 : Math.min(1, Math.max(0, -r.top / Math.max(1, hero.offsetHeight - (stick.current?.offsetHeight ?? innerHeight))));
      const tgt = frameAt(p); cur += (tgt - cur) * 0.2; if (Math.abs(tgt - cur) < 0.02) cur = tgt;
      const i = Math.round(cur); prog = p;
      for (let k = i - 8; k <= i + 28; k++) load(k);
      if (cache.size > 90) for (const k of [...cache.keys()]) if (Math.abs(k - i) > 40) cache.delete(k);
      if (i !== drawn || (shown !== i && ready(i))) { draw(i); drawn = i; }
      // curtain: each half GATHERS toward its side (folds squash together, like fabric being drawn), then clears the frame
      const c = reduce ? 1 : Math.min(1, p / CURTAIN), e = c < 0.5 ? 2 * c * c : 1 - Math.pow(-2 * c + 2, 2) / 2;
      const g = Math.min(1, e / 0.8), sx = 1 - 0.86 * g, out = Math.max(0, (e - 0.8) / 0.2) * 100;
      if (curL.current) curL.current.style.transform = `translate3d(${-out}%,0,0) scaleX(${sx})`;
      if (curR.current) curR.current.style.transform = `translate3d(${out}%,0,0) scaleX(${sx})`;
      if (curtain.current) { curtain.current.style.visibility = e >= 1 ? "hidden" : "visible"; curtain.current.style.setProperty("--o", String(Math.min(1, c * 5) * (1 - e))); curtain.current.style.setProperty("--f", String(0.3 + 0.7 * Math.min(1, e * 3))); }
      let act = reduce ? 0 : B.reduce((a, b, k) => (p >= b ? k : a), 0);
      if (!started) act = -1; // hold the text until the preloader has finished
      stages.current.forEach((el, k) => { if (el) el.dataset.on = k === act ? "1" : "0"; });
      segs.current.forEach((el, k) => { if (el) el.style.transform = `scaleX(${Math.min(1, Math.max(0, (p - B[k]) / ((k < 3 ? B[k + 1] : 1) - B[k])))})`; });
      labs.current.forEach((el, k) => { if (el) el.dataset.active = k === act ? "1" : "0"; });
      if (cue.current) cue.current.style.opacity = scrollY > 10 ? "0" : "1";
      if (rail.current) rail.current.style.transform = `scaleY(${p})`;
      if (Math.abs(tgt - cur) > 0.02 || shown !== i) raf = requestAnimationFrame(tick);
    };
    function kick() { if (!raf) raf = requestAnimationFrame(tick); }
    for (let i = 0; i < 30; i++) setTimeout(() => load(i), i * 40);
    if (reduce) load(N - 1);
    size(); kick();
    const onResize = () => { size(); kick(); };
    started = reduce; const t0 = setTimeout(() => { started = true; kick(); }, 1200);
    const onMove = (e: PointerEvent) => { // desktop only: text drifts gently against the cursor
      const el = stick.current; if (!el || reduce || e.pointerType !== "mouse") return;
      el.style.setProperty("--mx", String(e.clientX / innerWidth - 0.5)); el.style.setProperty("--my", String(e.clientY / innerHeight - 0.5));
    };
    addEventListener("pointermove", onMove, { passive: true });
    addEventListener("scroll", kick, { passive: true }); addEventListener("resize", onResize);
    return () => { clearTimeout(t0); removeEventListener("pointermove", onMove); removeEventListener("scroll", kick); removeEventListener("resize", onResize); cancelAnimationFrame(raf); };
  }, []);

  const go = (k: number) => { // tap a chapter to jump to it
    const h = root.current!, max = h.offsetHeight - (stick.current?.offsetHeight ?? innerHeight);
    scrollTo({ top: h.getBoundingClientRect().top + scrollY + max * JUMP[k], behavior: "smooth" });
  };

  return (
    <section ref={root} id="home" aria-label="ARCH-AID, spaces that tell your story" className="relative h-[260vh] bg-char motion-reduce:h-screen md:h-[300vh]">
      <div ref={stick} className="sticky top-0 h-lvh overflow-hidden bg-char text-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src(0)} alt="" className="absolute inset-0 size-full object-cover" />
        <canvas ref={cv} role="img" aria-label="Scroll-driven sequence of an empty room becoming a finished interior" className="absolute inset-0 size-full" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent max-md:hidden" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/50 to-transparent md:hidden" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-black/85 via-black/45 to-transparent md:hidden" />
        {/* intro curtain: the hook line sits on this solid fabric, then each half gathers into folds toward its side to reveal the room.
            Folds are faint at rest (reads as solid colour) and deepen as it moves. Panels overlap by 1px so no hairline shows. */}
        <div ref={curtain} aria-hidden className="pointer-events-none absolute inset-0 z-[5]" style={{ "--o": 0, "--f": 0.3 } as React.CSSProperties}>
          <div ref={curL} className="absolute inset-y-0 left-0 w-[calc(50%+1px)] origin-left bg-char will-change-transform">
            <div className="absolute inset-0 opacity-[var(--f)]" style={PLEAT} />
            <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/25" />
            <div className="absolute inset-y-0 left-full w-20 bg-gradient-to-r from-black/40 to-transparent opacity-[var(--o)]" />
          </div>
          <div ref={curR} className="absolute inset-y-0 right-0 w-[calc(50%+1px)] origin-right bg-char will-change-transform">
            <div className="absolute inset-0 opacity-[var(--f)]" style={PLEAT} />
            <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/25" />
            <div className="absolute inset-y-0 right-full w-20 bg-gradient-to-l from-black/40 to-transparent opacity-[var(--o)]" />
          </div>
        </div>
        {/* text layer follows the visible viewport (dvh); the image/canvas behind it always fills the full lvh */}
        <div className="absolute inset-x-0 top-0 h-dvh">
        <div ref={cue} className="absolute bottom-[clamp(2rem,8vh,5rem)] right-[clamp(1.25rem,5vw,5rem)] z-10 hidden text-[.7rem] tracking-[.3em] transition-opacity [writing-mode:vertical-rl] md:block">SCROLL TO EXPLORE</div>
        <div className="pointer-events-none absolute inset-x-0 bottom-[clamp(4.5rem,12vh,7rem)] z-10 h-[min(58svh,30rem)]">
          {STAGES.map((st, k) => {
            const Tag = k === 0 ? "h1" : "h2";
            return (
              <div key={k} ref={(el) => { stages.current[k] = el; }} data-on="0" className="stage absolute inset-x-0 top-0">
                <div className="wrap"><div className="stage-in">
                  <p className="fade eyebrow mb-5 !text-white/80">{st.e}</p>
                  <Tag className="mb-5 min-h-[2em] text-balance text-[clamp(2.6rem,9vw,7rem)] md:max-w-[16ch] md:text-[clamp(3.5rem,7vw,7rem)]"><Line a={st.a} b={st.b} /></Tag>
                  <p className="fade mb-7 max-w-sm text-white/85" style={{ "--d": 500 } as React.CSSProperties}>{st.d}</p>
                  <div className="fade flex flex-col gap-3 sm:flex-row" style={{ "--d": 650 } as React.CSSProperties}>
                    {k === 0 && <>
                      <a href="#projects" className="btn btn-light max-sm:w-full max-sm:justify-between">Explore Our Work <span className="btn-dot">↓</span></a>
                      <button onClick={enquire} className="btn btn-line max-sm:w-full max-sm:justify-center">Discuss Your Project</button>
                    </>}
                    {k === 3 && <button onClick={enquire} className="btn btn-light max-sm:w-full max-sm:justify-between">Start your project <span className="btn-dot">→</span></button>}
                  </div>
                </div></div>
              </div>
            );
          })}
        </div>
        <div className="absolute inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-20"><div className="wrap">
          <div className="flex max-w-lg gap-2">
            {LABELS.map((l, k) => (
              <button key={l} onClick={() => go(k)} aria-label={`Go to ${l}`} className="group flex-1 pt-3 text-left">
                <span className="block h-[3px] overflow-hidden rounded-full bg-white/25"><span ref={(el) => { segs.current[k] = el; }} className="block h-full origin-left scale-x-0 bg-acc" /></span>
                <span ref={(el) => { labs.current[k] = el; }} data-active="0" className="mt-2 block text-[.55rem] uppercase tracking-[.12em] text-white/45 transition-colors duration-500 group-hover:text-white data-[active=1]:text-white sm:text-[.65rem] sm:tracking-[.2em]">{l}</span>
              </button>
            ))}
          </div>
        </div></div>
        <div aria-hidden className="absolute left-[clamp(.75rem,2vw,2rem)] top-1/2 z-10 hidden h-40 w-px -translate-y-1/2 bg-white/25 md:block"><div ref={rail} className="h-full origin-top scale-y-0 bg-acc" /></div>
        </div>
      </div>
    </section>
  );
}
