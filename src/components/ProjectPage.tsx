"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
import { img, type Project } from "@/lib/content";
import { originOf, type Origin } from "@/lib/origin";
import { useEnquiry } from "./EnquiryDialog";
import { ImageReveal, Reveal, Words } from "./Reveal";
import { MoreProjects } from "./MoreProjects";
import { TLink } from "./Transition";
import { Viewer } from "./Viewer";
import { Arrow } from "./Arrow";

/** "View all projects" pill, pinned to the bottom centre once you have scrolled into the album, so you can leave at any point. */
function StickyAll() {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const f = () => setOn(window.scrollY > 480);
    f(); addEventListener("scroll", f, { passive: true });
    return () => removeEventListener("scroll", f);
  }, []);
  return (
    <div className={`pointer-events-none fixed inset-x-0 bottom-[5.25rem] z-40 flex justify-center transition-all duration-500 lg:bottom-8 ${on ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}>
      <TLink href="/projects" tabIndex={on ? 0 : -1} via={{ mode: "curtain", eyebrow: "Index", title: "All projects" }}
        className={`btn btn-solid shadow-2xl shadow-black/30 ${on ? "pointer-events-auto" : ""}`}>View All Projects <span className="btn-dot"><Arrow /></span></TLink>
    </div>
  );
}

/** One project, on its own page (shareable link). Photos reveal as you scroll; click one to view it full screen. */
export function ProjectPage({ project: p, more }: { project: Project; more: Project[] }) {
  const enquire = useEnquiry();
  const pics = p.gallery?.length ? p.gallery : [img(p.img)];
  const [open, setOpen] = useState<number | null>(null);
  const [slide, setSlide] = useState(0);
  const [from, setFrom] = useState<Origin | null>(null);
  const show = (i: number, el: HTMLElement) => { setFrom(originOf(el)); setSlide(i); setOpen(0); };

  const share = async () => {
    const url = location.href, text = `${p.name} · ARCH-AID`;
    if (navigator.share) {
      try { await navigator.share({ title: text, url }); } catch (e) { if ((e as Error).name !== "AbortError") window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, "_blank", "noopener"); }
      return;
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, "_blank", "noopener");
  };

  const open_ = "block w-full text-left";
  return (
    <>
      <section className="pt-[calc(76px+2rem)] sm:pt-[calc(76px+3rem)]">
        <div className="wrap">
          <Reveal>
            <TLink href="/projects" via={{ mode: "curtain", eyebrow: "Index", title: "All projects" }}
              className="group inline-flex items-center gap-2.5 rounded-full border border-line py-2 pl-3 pr-5 text-sm font-medium text-mute transition-colors hover:border-acc hover:text-acc">
              <Arrow dir="left" className="size-4 transition-transform duration-300 group-hover:-translate-x-1" /> All projects
            </TLink>
          </Reveal>

          <Reveal><p className="eyebrow mb-5 mt-10 sm:mt-14">{p.cat}</p></Reveal>
          <Words as="h1" className="max-w-[16ch] text-[clamp(2.8rem,7.5vw,6.5rem)] leading-[.98]">{p.name}</Words>

          {/* meta on the left, actions on the right; one hairline above, same baseline */}
          <Reveal>
            <div className="mt-8 flex flex-col gap-6 border-t border-line pt-6 sm:mt-12 sm:pt-8 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
              <dl className="flex flex-wrap gap-x-10 gap-y-4 sm:gap-x-14">
                {[
                  ["Type", p.cat],
                  ...(p.loc ? [["Location", p.loc]] : []),
                  ["Album", `${pics.length} ${pics.length === 1 ? "photo" : "photos"}`],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-[0.7rem] font-bold uppercase tracking-[.2em] text-mute">{k}</dt>
                    <dd className="mt-1 font-serif text-xl leading-tight sm:text-2xl">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="flex items-center gap-3">
                <button onClick={enquire} className="btn btn-solid max-sm:flex-1 max-sm:justify-between">Discuss a similar project <span className="btn-dot"><Arrow /></span></button>
                <button onClick={share} aria-label="Share this project" title="Share"
                  className="grid size-14 shrink-0 place-items-center rounded-full border border-line transition-colors hover:border-acc hover:bg-acc hover:text-white">
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="size-6">
                    <circle cx="18" cy="5" r="2.5" /><circle cx="6" cy="12" r="2.5" /><circle cx="18" cy="19" r="2.5" />
                    <path d="M8.2 10.8l7.6-4.4M8.2 13.2l7.6 4.4" />
                  </svg>
                </button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="pb-[clamp(3rem,6vw,5rem)] pt-8 sm:pt-12">
        <div className="wrap">
          <button type="button" data-cursor="View" aria-label={`View ${p.name} photo 1 full screen`} onClick={(e) => show(0, e.currentTarget)} className={open_}>
            <ImageReveal className="aspect-[3/2] rounded-[1.25rem] sm:aspect-[16/9] sm:rounded-[2rem]" drift={4}>
              <Image src={pics[0]} alt={`${p.name} – photo 1`} fill sizes="(min-width:1280px) 1200px, 100vw" priority className="object-cover" />
            </ImageReveal>
          </button>

          {pics.length > 1 && (
            <div className="mt-3 grid gap-3 sm:mt-5 sm:grid-cols-12 sm:gap-5">
              {pics.slice(1).map((src, k) => {
                const full = k % 3 === 0; // every third photo runs full width, the others pair up
                return (
                  <div key={src} className={full ? "sm:col-span-12" : "sm:col-span-6"}>
                    <button type="button" data-cursor="View" aria-label={`View ${p.name} photo ${k + 2} full screen`} onClick={(e) => show(k + 1, e.currentTarget)} className={open_}>
                      <ImageReveal className={`rounded-[1.25rem] sm:rounded-[2rem] ${full ? "aspect-[3/2] sm:aspect-[16/10]" : "aspect-[3/2]"}`} drift={3}>
                        <Image src={src} alt={`${p.name} – photo ${k + 2}`} fill sizes={full ? "(min-width:1280px) 1200px, 100vw" : "(min-width:1024px) 50vw, 100vw"} className="object-cover" />
                      </ImageReveal>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <MoreProjects projects={more} />
      <StickyAll />

      <Viewer items={[p]} index={open} onChange={setOpen} origin={from} start={slide} page={false} />
    </>
  );
}
