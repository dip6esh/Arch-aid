"use client";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform, useVelocity } from "motion/react";
import { TLink } from "./Transition";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { NAV } from "@/lib/content";
import { useEnquiry } from "./EnquiryDialog";
import { EASE } from "./Reveal";
import { lenisRef } from "./SmoothScroll";
import { useIntroReady } from "./Preloader";
import { ThemeToggle } from "./ThemeToggle";
import { Arrow } from "./Arrow";

/** On the home page the bar mounts when the preloader starts lifting; this is the small extra beat before it drops in. */
const HOME_INTRO = 0.35;
const MotionLink = motion.create(TLink);
/** Quick-out, soft-landing curve for the mobile menu (fast and smooth rather than slow and dramatic). */
const SNAP = [0.22, 1, 0.36, 1] as const;

/** Click ripple: a soft accent circle that spreads from the exact point of the press and fades. Render <Ripples/> inside a relative overflow-hidden parent. */
function useRipples() {
  const [list, set] = useState<{ id: number; x: number; y: number }[]>([]);
  const down = (e: React.PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect(), id = Math.random();
    set((a) => [...a, { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
    setTimeout(() => set((a) => a.filter((q) => q.id !== id)), 800);
  };
  return [list, down] as const;
}
function Ripples({ list }: { list: { id: number; x: number; y: number }[] }) {
  return <>{list.map((q) => (
    <motion.span key={q.id} aria-hidden initial={{ scale: 0, opacity: 0.5 }} animate={{ scale: 1.3, opacity: 0 }} transition={{ duration: 0.75, ease: EASE }}
      style={{ left: q.x - 120, top: q.y - 120 }} className="pointer-events-none absolute size-60 rounded-full bg-white/45" />
  ))}</>;
}

/** One link. The label is pulled towards the pointer (magnetic) and a click sends a ripple out from the press point. */
function NavItem({ i, href, active, hot, onHover, onPick, onMove, onLeave, setRef, children }: {
  i: number; href: string; active: boolean; hot: boolean; children: string;
  onHover: (i: number) => void; onPick: (i: number) => void; onMove: (i: number, dx: number) => void; onLeave: () => void; setRef: (i: number, el: HTMLAnchorElement | null) => void;
}) {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0), my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 260, damping: 18 }), y = useSpring(my, { stiffness: 260, damping: 18 });
  const [ripples, down] = useRipples();
  return (
    <TLink href={href} via={{ mode: "wipe", title: typeof children === "string" ? children : undefined }} ref={(el) => setRef(i, el)} onPointerDown={down}
      onClick={(e) => { if (e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) onPick(i); }}
      onPointerEnter={(e) => { if (e.pointerType === "mouse") onHover(i); }}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse") return;
        const r = e.currentTarget.getBoundingClientRect(), dx = e.clientX - r.left - r.width / 2, dy = e.clientY - r.top - r.height / 2;
        if (!reduce) { mx.set(dx * 0.3); my.set(dy * 0.4); }
        onMove(i, dx);
      }}
      onPointerLeave={() => { mx.set(0); my.set(0); }}
      onFocus={() => onHover(i)} onBlur={onLeave}
      className={`relative z-10 block overflow-hidden rounded-full px-3.5 py-2.5 transition-colors duration-300 xl:px-[1.15rem] ${hot ? "text-white opacity-100" : active ? "text-acc" : "opacity-80"}`}>
      <motion.span style={{ x, y }} className="block">{children}</motion.span>
      <Ripples list={ripples} />
    </TLink>
  );
}

/**
 * Desktop links with a liquid highlight. Two blobs (a quick one and a lazier one that trails it) ride behind the links and are
 * merged by an SVG "goo" filter, so the highlight stretches, necks and snaps like a drop of liquid as it slides to the hovered
 * link. It stretches with speed, squashes while pressed, follows the pointer a little inside each link, and when nothing is
 * hovered it settles back under the current page.
 */
function NavLinks({ links, active, introDelay }: { links: readonly (readonly [string, string])[]; active: string; introDelay: number }) {
  const box = useRef<HTMLUListElement>(null);
  const refs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [hover, setHover] = useState<number | null>(null);
  const [press, setPress] = useState(false);
  // The link that was just clicked. The highlight stays on it while the page transition runs, instead of sliding back to the old page's link.
  const [pending, setPending] = useState<number | null>(null);
  const shown = useRef(false);
  const reduce = useReducedMotion();
  const activeIdx = links.findIndex(([, h]) => h === active);
  useEffect(() => { setPending(null); }, [active]); // the new page has arrived: the highlight now belongs to it
  useEffect(() => { if (pending === null) return; const t = setTimeout(() => setPending(null), 4000); return () => clearTimeout(t); }, [pending]); // safety net if a navigation never completes
  const idx = pending ?? hover ?? activeIdx;

  const px = useMotionValue(0), pw = useMotionValue(0);
  const lx = useSpring(px, { stiffness: 380, damping: 30 }), lw = useSpring(pw, { stiffness: 380, damping: 30 });
  const tx = useSpring(px, { stiffness: 140, damping: 17 }), tw = useSpring(pw, { stiffness: 140, damping: 17 });
  // stretch the lead blob with its own speed
  const v = useVelocity(lx);
  const sx = useTransform(v, [-2500, 0, 2500], [1.28, 1, 1.28]), sy = useTransform(v, [-2500, 0, 2500], [0.82, 1, 0.82]);

  const place = (i: number) => {
    const a = refs.current[i], u = box.current; if (!a || !u) return;
    const ar = a.getBoundingClientRect(), ur = u.getBoundingClientRect();
    px.set(ar.left - ur.left); pw.set(ar.width);
    if (!shown.current) { shown.current = true; [lx, tx].forEach((m) => m.jump(px.get())); [lw, tw].forEach((m) => m.jump(ar.width)); }
  };
  useEffect(() => { if (idx >= 0) place(idx); }); // after every render, so a changed active page / hover lands in the right place
  useEffect(() => { const r = () => idx >= 0 && place(idx); addEventListener("resize", r); return () => removeEventListener("resize", r); }); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <ul ref={box} onPointerLeave={() => setHover(null)} onPointerDown={() => setPress(true)} onPointerUp={() => setPress(false)} onPointerCancel={() => setPress(false)}
      className="relative hidden text-sm tracking-wide lg:flex">
      <svg aria-hidden width="0" height="0" className="absolute">
        <defs>
          <filter id="nav-goo" x="-20%" y="-60%" width="140%" height="220%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="b" />
            <feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -10" />
          </filter>
        </defs>
      </svg>
      <motion.li aria-hidden initial={{ opacity: 0 }} animate={{ opacity: idx < 0 ? 0 : hover !== null || pending !== null ? 1 : 0.2 }} transition={{ duration: 0.3 }}
        className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0" style={{ filter: "url(#nav-goo)" }}>
          <motion.i style={{ x: tx, width: tw }} className="absolute inset-y-0 left-0 rounded-full bg-acc" />
          <motion.i style={{ x: lx, width: lw, scaleX: reduce ? 1 : sx, scaleY: reduce ? 1 : sy }} animate={{ scale: press ? 0.92 : 1 }} transition={{ type: "spring", stiffness: 500, damping: 18 }}
            className="absolute inset-y-0 left-0 rounded-full bg-acc" />
        </div>
      </motion.li>
      {links.map(([n, h], i) => (
        <motion.li key={h} initial={{ opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: EASE, delay: introDelay + 0.25 + i * 0.07 }}>
          <NavItem i={i} href={h} active={active === h && pending === null} hot={(pending ?? hover) === i} onHover={(k) => { if (pending === null) setHover(k); }} onPick={(k) => { setPending(k); setHover(null); }} onMove={() => {}} onLeave={() => setHover(null)} setRef={(k, el) => { refs.current[k] = el; }}>{n}</NavItem>
        </motion.li>
      ))}
    </ul>
  );
}

/** Call-to-action pill: pulled towards the pointer, a liquid fill that floods in from wherever the pointer entered (and drains out towards where it left), squashes when pressed and ripples on click. */
function CtaButton({ solid, onClick, delay }: { solid: boolean; onClick: () => void; delay: number }) {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0), my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 220, damping: 15 }), y = useSpring(my, { stiffness: 220, damping: 15 });
  const [ripples, down] = useRipples();
  const origin = (e: React.PointerEvent<HTMLElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    e.currentTarget.style.setProperty("--x", `${e.clientX - r.left}px`); e.currentTarget.style.setProperty("--y", `${e.clientY - r.top}px`);
  };
  return (
    <motion.div initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: EASE, delay }} className="hidden lg:block">
      <motion.button onClick={onClick} onPointerDown={down} whileTap={{ scale: 0.92 }} style={{ x, y }}
        onPointerEnter={origin}
        onPointerMove={(e) => { if (e.pointerType !== "mouse") return; const r = e.currentTarget.getBoundingClientRect(); if (!reduce) { mx.set((e.clientX - r.left - r.width / 2) * 0.3); my.set((e.clientY - r.top - r.height / 2) * 0.45); } }}
        onPointerLeave={(e) => { origin(e); mx.set(0); my.set(0); }}
        className={`group/cta relative overflow-hidden rounded-full border px-6 py-3 text-sm font-medium transition-colors duration-500 [--x:50%] [--y:100%] ${solid ? "border-ink bg-ink text-bg hover:border-acc hover:text-white" : "border-white/80 hover:border-acc hover:text-white"}`}>
        <span aria-hidden className="absolute inset-0 bg-acc transition-[clip-path] duration-[700ms] ease-[cubic-bezier(.2,.7,.2,1)] [clip-path:circle(0%_at_var(--x)_var(--y))] group-hover/cta:[clip-path:circle(150%_at_var(--x)_var(--y))]" />
        <span className="relative inline-flex items-center gap-2">Discuss Your Project
          <span aria-hidden className="-ml-5 w-3 -translate-x-1 opacity-0 transition-all duration-500 group-hover/cta:ml-0 group-hover/cta:translate-x-0 group-hover/cta:opacity-100"><Arrow className="size-full" /></span>
        </span>
        <Ripples list={ripples} />
      </motion.button>
    </motion.div>
  );
}

export function Nav() {
  const path = usePathname();
  const home = path === "/";
  const ready = useIntroReady(home); // home: wait for the preloader to lift; elsewhere ready at once
  const [solid, setSolid] = useState(!home);
  const [open, setOpen] = useState(false);
  const enquire = useEnquiry();
  const active = path.length > 1 ? "/" + path.split("/")[1] : "/"; // /projects/anything still highlights Projects
  const INTRO = home ? HOME_INTRO : 0.1; // on the home page wait for the preloader; elsewhere appear straight away

  // Home: transparent over the dark hero, solid once it has scrolled past. Every other page starts solid.
  useEffect(() => {
    if (!home) { setSolid(true); return; }
    const onScroll = () => setSolid(scrollY > window.innerHeight * 3.2 || (document.getElementById("home")?.getBoundingClientRect().bottom ?? 1) < 90);
    onScroll(); addEventListener("scroll", onScroll, { passive: true });
    return () => removeEventListener("scroll", onScroll);
  }, [home]);

  useEffect(() => { setOpen(false); }, [path]); // close the mobile menu after navigating

  // Freeze the page behind the mobile menu; close it if the viewport grows to desktop or Esc is pressed.
  useEffect(() => {
    if (!open) return;
    lenisRef.current?.stop();
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const mq = matchMedia("(min-width: 1024px)"), onMq = () => mq.matches && setOpen(false);
    addEventListener("keydown", esc); mq.addEventListener("change", onMq);
    return () => { lenisRef.current?.start(); removeEventListener("keydown", esc); mq.removeEventListener("change", onMq); };
  }, [open]);

  const tone = solid || open ? (open ? "bg-char text-white" : "border-line bg-bg/85 text-ink backdrop-blur-xl") : "border-transparent text-white";
  const links = NAV.filter(([n]) => n !== "Home");
  if (!ready) return null; // mounts as the preloader lifts, so its entrance animation is actually seen
  return (
    <motion.nav initial={{ y: "-100%", opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1, ease: EASE, delay: INTRO }}
      className={`fixed inset-x-0 top-0 z-50 border-b pt-[env(safe-area-inset-top)] transition-colors duration-500 ${tone}`}>
      {!solid && !open && <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-black/55 to-transparent" />}
      <div className="wrap flex h-[76px] items-center justify-between">
        <MotionLink href="/" via={{ mode: "wipe", title: "Home" }} aria-label="ARCH-AID home" onClick={() => setOpen(false)} whileTap={{ scale: 0.96 }}
          initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, ease: EASE, delay: INTRO + 0.15 }}
          className="transition-opacity duration-300 hover:opacity-70">
          <span className="logo w-28" role="img" aria-label="ARCH-AID" />
        </MotionLink>

        <NavLinks links={links} active={active} introDelay={INTRO} />

        <div className="flex items-center gap-1">
        <CtaButton solid={solid} onClick={enquire} delay={INTRO + 0.5} />
        <ThemeToggle />

        <motion.button aria-label="Menu" aria-expanded={open} onClick={() => setOpen(!open)} whileTap={{ scale: 0.88 }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, ease: EASE, delay: INTRO + 0.3 }}
          className="group/burger relative size-11 rounded-full transition-colors duration-300 hover:bg-white/10 lg:hidden">
          <i className={`absolute left-2.5 h-px bg-current transition-all duration-300 ${open ? "top-5 right-2.5 rotate-45" : "top-[18px] right-2.5 group-hover/burger:right-3.5"}`} />
          <i className={`absolute left-2.5 h-px bg-current transition-all duration-300 ${open ? "top-5 right-2.5 -rotate-45" : "top-[25px] right-2.5 group-hover/burger:left-3.5"}`} />
        </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.ul key="menu" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6, transition: { duration: 0.18, ease: "easeIn" } }}
            transition={{ duration: 0.26, ease: SNAP }}
            className="fixed inset-x-0 bottom-0 top-[calc(76px+env(safe-area-inset-top))] flex flex-col overflow-y-auto bg-char px-[clamp(1.25rem,5vw,5rem)] pb-[max(2rem,env(safe-area-inset-bottom))] pt-2">
            {NAV.map(([n, h], i) => (
              <motion.li key={h} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32, ease: SNAP, delay: 0.04 + i * 0.035 }}
                className="border-b border-white/10">
                <TLink href={h} via={{ mode: "wipe", title: n }} onClick={() => setOpen(false)} className="group/m flex items-center gap-4 py-[0.95rem] transition-colors duration-200 active:text-acc">
                  <span className={`min-w-0 font-serif text-[1.65rem] leading-tight transition-transform duration-200 group-active/m:translate-x-1.5 sm:text-3xl ${active === h ? "text-acc" : ""}`}>{n}</span>
                  <span aria-hidden className="ml-auto shrink-0 -translate-x-2 text-lg text-acc opacity-0 transition-all duration-200 group-active/m:translate-x-0 group-active/m:opacity-100"><Arrow className="size-[1em]" /></span>
                </TLink>
              </motion.li>
            ))}
            <motion.li initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.32, ease: SNAP, delay: 0.06 + NAV.length * 0.035 }} className="pt-7">
              <button onClick={() => { setOpen(false); enquire(); }} className="w-full rounded-full border border-white py-3.5 text-sm font-medium transition-colors duration-200 active:border-acc active:bg-acc">Discuss Your Project</button>
            </motion.li>
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
