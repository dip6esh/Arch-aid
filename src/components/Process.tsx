"use client";
import Image from "next/image";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { PILLARS, STAGES, img } from "@/lib/content";
import { Reveal } from "./Reveal";
import { SectionHead } from "./SectionHead";

export function Why() {
  return (
    <section className="sec bg-char text-cream">
      <div className="wrap">
        <SectionHead eyebrow="Why ARCH-AID" title="Experience brings perspective. Design brings it to life." ledeClass="text-[#b9b1a5]">
          Creating a meaningful space takes experience, careful planning, technical understanding and attention to the details that make a design work in reality.
        </SectionHead>
        <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map(([t, d, k], i) => (
            <Reveal key={t} delay={i * 0.08}>
              <div className="relative mb-5 aspect-[4/5] overflow-hidden rounded-t-full"><Image src={img(k)} alt="" fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover" /></div>
              <p className="mb-2 text-xs font-semibold tracking-[.2em] text-acc">0{i + 1}</p>
              <h3 className="mb-2 text-xl">{t}</h3>
              <p className="text-sm text-[#b9b1a5]">{d}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Vertical arch (circle segment, radius 530, in a 90x600 box): chord flush with the right edge at x=90, apex bulging left at x=10. */
const VR = 530, VW = 90, VCX = 540, VCY = 300, V0 = Math.atan2(20 - VCY, 90 - VCX) + 2 * Math.PI, V1 = Math.atan2(580 - VCY, 90 - VCX);

/** Fixed arch on the right edge (same style as the Selected work one): fills top to bottom as the steps scroll by. */
function SideArch({ target }: { target: React.RefObject<HTMLElement | null> }) {
  const { scrollYProgress: p } = useScroll({ target, offset: ["start 0.6", "end 0.6"] });
  // fade in as the section's top climbs from 60% to 30% of the viewport; fade out as its bottom rises from 85% to 55%
  const { scrollYProgress: inP } = useScroll({ target, offset: ["start 0.6", "start 0.3"] });
  const { scrollYProgress: outP } = useScroll({ target, offset: ["end 0.85", "end 0.55"] });
  const fill = useSpring(p, { stiffness: 120, damping: 30 });
  const opacity = useTransform([inP, outP], ([i, o]: number[]) => Math.min(i, 1 - o));
  const ang = (v: number) => V0 + Math.min(1, Math.max(0, v)) * (V1 - V0);
  const left = useTransform(fill, (v) => `${((VCX + VR * Math.cos(ang(v))) / VW) * 100}%`);
  const top = useTransform(fill, (v) => `${(VCY + VR * Math.sin(ang(v))) / 6}%`);
  const d = "M90 20A530 530 0 0 0 90 580";
  return (
    <motion.div aria-hidden style={{ opacity }} className="pointer-events-none fixed right-1 top-1/2 z-40 hidden -translate-y-1/2 md:block">
      <div className="relative aspect-[90/600] h-[min(52svh,440px)]">
        <svg viewBox="0 0 90 600" fill="none" strokeLinecap="round" className="absolute inset-0 size-full overflow-visible">
          <path d={d} className="stroke-mute/50" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
          <motion.path d={d} className="stroke-acc" strokeWidth="4" vectorEffect="non-scaling-stroke" style={{ pathLength: fill }} />
        </svg>
        <motion.span style={{ left, top }} className="absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-acc ring-4 ring-bg" />
      </div>
    </motion.div>
  );
}

export function Process() {
  const [on, setOn] = useState(0);
  const sec = useRef<HTMLElement>(null);
  const refs = useRef<(HTMLDivElement | null)[]>([]);
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setOn(refs.current.indexOf(e.target as HTMLDivElement))), { rootMargin: "-40% 0px -50% 0px" });
    refs.current.forEach((r) => r && io.observe(r));
    return () => io.disconnect();
  }, []);
  return (
    <section id="process" ref={sec} className="sec">
      <SideArch target={sec} />
      <div className="wrap">
        <SectionHead eyebrow="How we work" title="Every great space begins with a conversation." />
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-x-10">
          <div className="sticky top-24 hidden self-start lg:col-span-5 lg:block">
            <div className="relative aspect-[4/5] max-h-[68svh] w-full overflow-hidden rounded-t-full bg-char">
              {STAGES.map(([, , k], i) => <Image key={i} src={img(k)} alt="" fill sizes="40vw" className={`object-cover transition-all duration-1000 ${i === on ? "scale-100 opacity-100" : "scale-105 opacity-0"}`} />)}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-serif text-7xl text-white drop-shadow">0{on + 1}</div>
            </div>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            {STAGES.map(([t, d, k], i) => (
              <div key={t} ref={(el) => { refs.current[i] = el; }} className={`flex flex-col justify-center border-t border-line py-8 transition-opacity duration-500 lg:min-h-[36vh] ${i === on ? "opacity-100" : "lg:opacity-40"}`}>
                <p className="mb-3 text-xs font-semibold tracking-[.2em] text-acc">STEP 0{i + 1}</p>
                <h3 className="mb-3 text-[clamp(1.6rem,2.6vw,2.4rem)]">{t}</h3>
                <p className="max-w-md text-mute">{d}</p>
                <div className="relative mt-5 aspect-[16/10] overflow-hidden rounded-3xl lg:hidden"><Image src={img(k)} alt="" fill sizes="100vw" className="object-cover" /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
