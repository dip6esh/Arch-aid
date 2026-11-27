"use client";
import Image from "next/image";
import { ABOUT, TEAM, img } from "@/lib/content";
import { ImageReveal, Reveal, Words } from "./Reveal";

/** The ONE body text style used for every paragraph, bio and list item on this page. */
const BODY = "text-[1.0625rem] leading-[1.75] text-ink sm:text-lg";
const pad = (n: number) => String(n + 1).padStart(2, "0");
const [lead, ...rest] = ABOUT.paragraphs;

export function AboutPage() {
  return (
    <>
      {/* 1 · Full-bleed hero with the title over the picture */}
      <section className="relative flex min-h-[calc(76px+62svh)] items-end overflow-hidden bg-char text-white sm:min-h-[calc(76px+70svh)]">
        <div className="absolute inset-0">
          <ImageReveal className="h-full">
            <Image src={img("neilesh")} alt="Interior designed by ARCH-AID" fill sizes="100vw" priority className="object-cover" />
          </ImageReveal>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" />
        <div className="wrap relative w-full pb-10 sm:pb-14 lg:pb-16">
          <Words as="h1" className="text-[clamp(3.5rem,13vw,10rem)] leading-[0.95]">About Us</Words>
        </div>
      </section>

      {/* 2 · The story: lead paragraph left, the three that follow on the right */}
      <section className="sec">
        <div className="wrap grid gap-10 lg:grid-cols-12 lg:gap-x-16 lg:gap-y-0">
          <Reveal className="lg:col-span-7">
            <p className={`${BODY} border-l-2 border-acc pl-5 sm:pl-7`}>{lead}</p>
          </Reveal>
          <div className="grid content-start gap-8 lg:col-span-5">
            {rest.map((p, i) => (
              <Reveal key={p.slice(0, 20)}>
                <div className="grid grid-cols-[2.25rem_1fr] gap-3 border-t border-line pt-6">
                  <span className="pt-1 text-xs font-bold tabular-nums text-acc">{pad(i + 1)}</span>
                  <p className={BODY}>{p}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 3 · Motto band */}
      <section className="bg-char py-16 text-cream sm:py-24">
        <div className="wrap">
          <Reveal><p className="eyebrow mb-6">{ABOUT.lead}</p></Reveal>
          <Words className="max-w-[20ch] text-[clamp(2.4rem,6.6vw,6rem)] leading-[1.02] text-acc">{ABOUT.motto}</Words>
        </div>
      </section>

      {/* 4 · Principals */}
      <section className="sec bg-bg2">
        <div className="wrap">
          <Words className="mb-10 max-w-[16ch] text-[clamp(2.4rem,5vw,4.5rem)] lg:mb-14">Principal Architects of Our Firm</Words>
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
            {TEAM.map((t, i) => (
              <Reveal key={t.n} delay={i * 0.1} className="h-full">
                <article className="flex h-full flex-col overflow-hidden rounded-[2rem] border border-line bg-bg">
                  <ImageReveal className="aspect-[4/3] w-full bg-char sm:aspect-[16/10] lg:aspect-[4/3]" drift={3}>
                    <Image src={t.photo} alt={t.n} fill sizes="(min-width:1024px) 45vw, 100vw" className="object-cover object-[50%_22%]" />
                  </ImageReveal>
                  <div className="flex-1 p-6 sm:p-9">
                    <h3 className="mb-5 font-serif text-4xl font-normal sm:text-5xl">{t.n}</h3>
                    <div className="grid gap-4">{t.bio.map((para) => <p key={para.slice(0, 24)} className={BODY}>{para}</p>)}</div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 5 · Achievements */}
      <section className="sec">
        <div className="wrap">
          <Words className="mb-10 text-[clamp(2.4rem,5vw,4.5rem)] lg:mb-14">Achievements</Words>
          <Reveal>
            <ul className="grid border-b border-line md:grid-cols-2 md:gap-x-14 lg:gap-x-20">
              {ABOUT.achievements.map((it, i) => (
                <li key={it} className={`grid grid-cols-[2.5rem_1fr] gap-3 border-t border-line py-5 ${BODY}`}>
                  <span className="pt-1 font-serif text-2xl leading-none text-acc">{pad(i)}</span>
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>
    </>
  );
}
