"use client";
import Image from "next/image";
import { TLink } from "./Transition";
import { useRef } from "react";
import { reduced, useDrive } from "./Drive";
import { useEnquiry } from "./EnquiryDialog";
import { CountUp, Magnetic } from "./Magnetic";
import { ImageReveal, Reveal, Words } from "./Reveal";
import { STATS, img } from "@/lib/content";
import { Arrow } from "./Arrow";

export function About() {
  const enquire = useEnquiry();
  const badge = useRef<HTMLDivElement>(null);
  const ring = useRef<SVGSVGElement>(null);
  // drifts clockwise (one turn / 16s); dragging rotates it with the pointer, back and forth
  useDrive(ring, {
    grab: badge,
    base: () => (reduced() ? 0 : 22.5),
    delta: (e, p) => {
      const b = badge.current; if (!b) return 0;
      const r = b.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      let d = (Math.atan2(e.clientY - cy, e.clientX - cx) - Math.atan2(p.clientY - cy, p.clientX - cx)) * (180 / Math.PI);
      if (d > 180) d -= 360; if (d < -180) d += 360;
      return d;
    },
    apply: (pos) => { pos %= 360; if (ring.current) ring.current.style.transform = `rotate(${pos}deg)`; return pos; },
  });
  return (
    <section id="about" className="sec overflow-hidden">
      <div className="wrap grid items-center gap-14 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <Reveal><p className="eyebrow mb-5">The practice</p></Reveal>
          <Words className="mb-7 text-[clamp(2.6rem,6vw,5.5rem)]">Good design is felt, long before it’s noticed.</Words>
          <Reveal><p className="max-w-md text-lg text-mute">Every space has a purpose. Every person has a way of experiencing it. We bring these together through thoughtful planning, considered materials and a distinctive design perspective.</p></Reveal>
          <Reveal><div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4"><Magnetic><button onClick={enquire} className="btn btn-solid">Start a conversation <span className="btn-dot"><Arrow /></span></button></Magnetic><TLink href="/about" via={{ mode: "wipe", title: "About" }} className="text-sm font-semibold underline decoration-acc decoration-2 underline-offset-8 transition-colors hover:text-acc"><span className="inline-flex items-center gap-2">More about us <Arrow className="size-4" /></span></TLink></div></Reveal>
          <Reveal>
            <dl className="mt-12 grid grid-cols-3 gap-3">
              {STATS.map(([v, l]) => { const n = parseInt(v); const s = v.replace(String(n), ""); return (
                <div key={l} className="rounded-3xl border border-line bg-bg2 p-4 sm:p-5">
                  <dt className="font-serif text-5xl leading-none text-acc sm:text-6xl"><CountUp to={n} suffix={s} /></dt>
                  <dd className="mt-3 text-xs leading-snug text-mute sm:text-sm">{l}</dd>
                </div>); })}
            </dl>
          </Reveal>
        </div>
        <div className="relative mx-auto h-[26rem] w-full max-w-[34rem] sm:h-[39rem] lg:col-span-6">
          <div className="absolute right-0 top-0 h-[84%] w-[68%]"><ImageReveal className="h-full rounded-t-full">
            <Image src={img("birdsong")} alt="Bright living room with a vertical garden wall and floral armchairs" fill sizes="(min-width:1024px) 24vw, 60vw" className="object-cover" />
          </ImageReveal></div>
          <div className="absolute bottom-0 left-0 h-[46%] w-[46%] rounded-[2rem] border-[6px] border-bg bg-bg"><ImageReveal className="h-full rounded-[1.5rem]">
            <Image src={img("kanwar")} alt="Dining and living area with carved glass partition and reclining Buddha" fill sizes="(min-width:1024px) 16vw, 40vw" className="object-cover" />
          </ImageReveal></div>
          <div ref={badge} aria-hidden data-cursor="Drag" className="absolute bottom-[6%] right-[2%] grid size-24 cursor-grab select-none place-items-center rounded-full bg-acc text-white [touch-action:none] sm:size-36">
            <svg ref={ring} viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 will-change-transform"><defs><path id="ring" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" /></defs>
              <text fontSize="8" letterSpacing="1.5" fill="currentColor" fontWeight="600"><textPath href="#ring">ARCHITECTURE · INTERIORS · LANDSCAPE ·</textPath></text></svg>
            <span className="pointer-events-none font-serif text-3xl">AA</span>
          </div>
        </div>
      </div>
    </section>
  );
}
