"use client";
import Image from "next/image";
import { SERVICES } from "@/lib/content";
import { ImageReveal, Reveal, Words } from "./Reveal";

/** Same body text style as the About page: one size, one colour, everywhere. */
const BODY = "text-[1.0625rem] leading-[1.75] text-ink sm:text-lg";
const pad = (n: number) => String(n + 1).padStart(2, "0");

export function ServicesPage() {
  return (
    <>
      {/* 1 · Full-bleed hero */}
      <section className="relative flex min-h-[calc(76px+62svh)] items-end overflow-hidden bg-char text-white sm:min-h-[calc(76px+70svh)]">
        <div className="absolute inset-0">
          <ImageReveal className="h-full">
            <Image src="/images/gallery/lodha-dham/01.webp" alt="" fill sizes="100vw" priority className="object-cover" />
          </ImageReveal>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" />
        <div className="wrap relative w-full pb-10 sm:pb-14 lg:pb-16">
          <Words as="h1" className="text-[clamp(3.5rem,13vw,10rem)] leading-[0.95]">Services</Words>
        </div>
      </section>

      {/* 2 · What we offer: intro left, numbered list right */}
      <section className="sec">
        <div className="wrap grid gap-10 lg:grid-cols-12 lg:gap-x-16">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-28">
              <Reveal><p className={`${BODY} border-l-2 border-acc pl-5 sm:pl-7`}>{SERVICES.intro}</p></Reveal>
            </div>
          </div>
          <Reveal className="lg:col-span-7">
            <ul className="border-b border-line">
              {SERVICES.list.map((it, i) => (
                <li key={it} className={`grid grid-cols-[3rem_1fr] items-baseline gap-3 border-t border-line py-4 sm:py-5 ${BODY}`}>
                  <span className="font-serif text-2xl leading-none text-acc">{pad(i)}</span>
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* 3 · The three disciplines: title + text, then a wide picture */}
      {SERVICES.sections.map((s, i) => (
        <section key={s.title} className={`sec ${i % 2 === 0 ? "bg-bg2" : ""}`}>
          <div className="wrap">
            <div className="grid gap-5 lg:grid-cols-12 lg:gap-x-16">
              <div className="lg:col-span-5">
                <Reveal><p className="mb-4 font-serif text-2xl leading-none text-acc">{pad(i)}</p></Reveal>
                <Words className="max-w-[12ch] text-[clamp(2.4rem,4.6vw,4.25rem)]">{s.title}</Words>
              </div>
              <Reveal className="lg:col-span-7 lg:pt-10"><p className={`${BODY} max-w-[42rem]`}>{s.text}</p></Reveal>
            </div>
            <div className="relative mt-10 aspect-[4/3] overflow-hidden rounded-[1.75rem] sm:aspect-[16/9] lg:mt-14 lg:aspect-[21/9]">
              <ImageReveal className="h-full">
                <Image src={s.img} alt={s.alt} fill sizes="(min-width:1280px) 1200px, 100vw" className="object-cover" />
              </ImageReveal>
            </div>
          </div>
        </section>
      ))}
    </>
  );
}
