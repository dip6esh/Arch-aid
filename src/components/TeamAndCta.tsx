"use client";
import Image from "next/image";
import Link from "next/link";
import { img } from "@/lib/content";
import { useEnquiry } from "./EnquiryDialog";
import { Magnetic } from "./Magnetic";
import { Parallax, Reveal, Words } from "./Reveal";
import { Arrow } from "./Arrow";

export function Cta() {
  const enquire = useEnquiry();
  return (
    <section className="relative flex min-h-[72svh] items-center overflow-hidden py-20 text-white">
      <Parallax><Image src={img("pramod")} alt="" fill sizes="100vw" className="object-cover brightness-[.45]" /></Parallax>
      <div className="wrap relative w-full">
        <Words className="mb-6 max-w-[14ch] text-[clamp(3rem,8vw,7rem)]">Have a space in mind? Let’s explore what’s possible.</Words>
        <Reveal><p className="mb-8 max-w-lg opacity-90">Whether you’re planning a new home, transforming an existing space or developing a commercial project, we’d love to hear what you’re envisioning.</p></Reveal>
        <Reveal><div className="flex flex-wrap gap-3">
          <Magnetic><button onClick={enquire} className="btn btn-light">Discuss Your Project <span className="btn-dot"><Arrow /></span></button></Magnetic>
          <Link href="/contact" className="btn btn-line">Get in Touch</Link>
        </div></Reveal>
      </div>
    </section>
  );
}
