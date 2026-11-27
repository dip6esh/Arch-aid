"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SITE, waLink } from "@/lib/content";
import { useEnquiry } from "./EnquiryDialog";
import { WhatsAppIcon } from "./WhatsAppIcon";

/** Phones/tablets: two compact round buttons in the bottom-right corner (book a consultation + WhatsApp) instead of a full-width bar; hidden on the contact section. */
export function MobileBar() {
  const enquire = useEnquiry();
  const [vis, setVis] = useState(false);
  const path = usePathname();
  useEffect(() => {
    let atEnd = false;
    const upd = () => setVis(scrollY > innerHeight * 0.6 && !atEnd);
    const io = new IntersectionObserver(([e]) => { atEnd = e.isIntersecting; upd(); }, { threshold: 0.3 });
    const c = document.getElementById("contact"); if (c) io.observe(c);
    addEventListener("scroll", upd, { passive: true }); upd();
    return () => { removeEventListener("scroll", upd); io.disconnect(); };
  }, [path]); // re-attach on every page: the contact section only exists on some
  return (
    <div className={`fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-40 flex flex-col items-center gap-3 transition-all duration-500 lg:hidden ${vis ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"}`}>
      <button onClick={enquire} aria-label="Send an enquiry" title="Book a consultation" tabIndex={vis ? 0 : -1}
        className="grid size-12 place-items-center rounded-full border border-white/15 bg-char/90 text-cream shadow-xl backdrop-blur-xl transition-colors active:bg-acc">
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="size-6">
          <rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="M3.5 7.5l8.5 6 8.5-6" />
        </svg>
      </button>
      {SITE.contact.whatsapp && (
        <a href={waLink()} target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp" tabIndex={vis ? 0 : -1}
          className="grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-xl">
          <WhatsAppIcon className="size-8" />
        </a>
      )}
    </div>
  );
}
