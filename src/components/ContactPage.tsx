"use client";
import Image from "next/image";
import { SITE } from "@/lib/content";
import { useEnquiry } from "./EnquiryDialog";
import { Magnetic } from "./Magnetic";
import { ImageReveal, Reveal, Words } from "./Reveal";

/** Same body text style as the About and Services pages. */
const BODY = "text-[1.0625rem] leading-[1.75] text-ink sm:text-lg";

/** One contact row: small label, large serif value, and a round arrow that nudges on hover (same motion as the buttons). */
function Row({ label, children, href, external }: { label: string; children: React.ReactNode; href?: string; external?: boolean }) {
  const inner = (
    <>
      <span className="eyebrow">{label}</span>
      <span className="font-serif text-[clamp(1.6rem,2.6vw,2.4rem)] leading-[1.15] [overflow-wrap:anywhere]">{children}</span>
      <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-full border border-line text-lg transition-all duration-500 group-hover:rotate-[-45deg] group-hover:border-acc group-hover:bg-acc group-hover:text-white">→</span>
    </>
  );
  const cls = "group grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-2 border-t border-line py-6 transition-colors sm:py-7 [&>.eyebrow]:col-span-2 [&>span:nth-child(2)]:col-start-1";
  return href ? (
    <a href={href} className={`${cls} hover:text-acc`} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{inner}</a>
  ) : null;
}

export function ContactPage() {
  const c = SITE.contact, enquire = useEnquiry();
  const tel = c.phone.replace(/[^\d+]/g, "");

  return (
    <>
      {/* 1 · Full-bleed hero, same pattern as Services and About */}
      <section className="relative flex min-h-[calc(76px+52svh)] items-end overflow-hidden bg-char text-white sm:min-h-[calc(76px+60svh)]">
        <div className="absolute inset-0">
          <ImageReveal className="h-full">
            <Image src="/images/gallery/rr-boutique-hotel/01.webp" alt="" fill sizes="100vw" priority className="object-cover" />
          </ImageReveal>
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" />
        <div className="wrap relative w-full pb-10 sm:pb-14 lg:pb-16">
          <Words as="h1" className="text-[clamp(3.5rem,13vw,10rem)] leading-[0.95]">Contact</Words>
        </div>
      </section>

      {/* 2 · Details on the left, clickable Google map on the right */}
      <section id="contact" className="sec">
        <div className="wrap grid gap-12 lg:grid-cols-12 lg:gap-x-16">
          <div className="lg:col-span-5">
            <Reveal>
              <p className={`${BODY} border-l-2 border-acc pl-5 sm:pl-7`}>Visit the studio, call or write to us. Or share a few details about your space and we’ll come back to you.</p>
            </Reveal>
            <Reveal delay={0.5}>
              <div className="mt-10 border-b border-line">
                {c.phone && <Row label="Phone" href={`tel:${tel}`}>{c.phone}</Row>}
                {c.email && <Row label="Email" href={`mailto:${c.email}`}>{c.email}</Row>}
                {c.whatsapp && <Row label="WhatsApp" href={`https://wa.me/${c.whatsapp.replace(/\D/g, "")}`} external>Message us</Row>}
                {c.office && <Row label="Studio" href={c.map.url} external>{c.office}</Row>}
              </div>
            </Reveal>
            <Reveal delay={0.8}>
              <div className="mt-10">
                <Magnetic><button onClick={enquire} className="btn btn-solid">Discuss Your Project <span className="btn-dot">→</span></button></Magnetic>
              </div>
            </Reveal>
          </div>

          <Reveal className="lg:col-span-7">
            <div className="lg:sticky lg:top-28">
              <div className="group relative aspect-[4/5] overflow-hidden rounded-[1.75rem] border border-line bg-bg2 sm:aspect-[4/3] lg:aspect-[5/6] xl:aspect-[4/4.4]">
                {/* The map is display-only; the link layer above it makes the whole card open Google Maps in a new tab (and keeps page scrolling smooth on touch). */}
                <iframe
                  title="ARCH-AID studio on Google Maps"
                  src={c.map.embed}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  tabIndex={-1}
                  className="pointer-events-none absolute inset-0 size-full border-0 [filter:grayscale(.35)_sepia(.18)_contrast(1.02)] transition-[filter] duration-700 group-hover:[filter:none] dark:[filter:invert(.92)_hue-rotate(180deg)_grayscale(.4)] dark:group-hover:[filter:invert(.92)_hue-rotate(180deg)]"
                />
                <a
                  href={c.map.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open ARCH-AID on Google Maps (opens in a new tab)"
                  className="absolute inset-0 z-10 flex items-end p-3 sm:p-5"
                >
                  <span className="flex w-full items-center justify-between gap-4 rounded-[1.25rem] bg-bg/95 p-4 text-ink shadow-xl backdrop-blur-md sm:w-auto sm:min-w-[22rem] sm:p-5">
                    <span>
                      <span className="eyebrow mb-1">Find us</span>
                      <span className="block font-serif text-2xl leading-tight">ARCH-AID</span>
                      <span className="block text-sm text-mute">Ram Maruti Road, Dadar West, Mumbai 400028</span>
                    </span>
                    <span aria-hidden className="grid size-11 shrink-0 place-items-center rounded-full bg-acc text-lg text-white transition-transform duration-500 group-hover:rotate-[-45deg]">→</span>
                  </span>
                </a>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <a href={c.map.url} target="_blank" rel="noopener noreferrer" className="btn btn-solid">Open in Google Maps <span className="btn-dot">↗</span></a>
                <a href={c.map.directions} target="_blank" rel="noopener noreferrer" className="btn border border-line text-ink hover:border-acc hover:text-acc">Get directions <span className="btn-dot bg-bg2">↗</span></a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 3 · Closing prompt */}
      <section className="sec bg-bg2">
        <div className="wrap grid items-end gap-8 lg:grid-cols-12 lg:gap-x-16">
          <div className="lg:col-span-8">
            <Reveal><p className="eyebrow mb-4">Start a conversation</p></Reveal>
            <Words className="max-w-[18ch] text-[clamp(2.4rem,5vw,4.5rem)]">Let’s talk about your space.</Words>
          </div>
          <Reveal className="lg:col-span-4 lg:justify-self-end">
            <Magnetic><button onClick={enquire} className="btn btn-solid">Send an Enquiry <span className="btn-dot">→</span></button></Magnetic>
          </Reveal>
        </div>
      </section>
    </>
  );
}
