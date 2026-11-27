"use client";
import { useEffect, useState } from "react";
import { SITE, waLink } from "@/lib/content";
import { useEnquiry } from "./EnquiryDialog";
import { WhatsAppIcon } from "./WhatsAppIcon";

/**
 * Desktop: "Book a consultation" + WhatsApp, floating at the bottom-right of every page.
 * (Phones and tablets get the same two actions in MobileBar instead.) Appears a moment after the page loads.
 */
export function FloatingActions() {
  const enquire = useEnquiry();
  const [on, setOn] = useState(false);
  useEffect(() => { const t = setTimeout(() => setOn(true), 2200); return () => clearTimeout(t); }, []);
  return (
    <div className={`fixed bottom-8 right-6 z-40 hidden items-center gap-3 transition-all duration-700 lg:flex ${on ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"}`}>
      <button onClick={enquire} tabIndex={on ? 0 : -1}
        className="rounded-full border border-white/15 bg-char/90 py-3.5 pl-6 pr-6 text-sm font-medium text-cream shadow-2xl backdrop-blur-xl transition-colors hover:bg-acc">
        Book a consultation
      </button>
      {SITE.contact.whatsapp && (
        <a href={waLink()} target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp" title="Chat on WhatsApp" tabIndex={on ? 0 : -1}
          className="relative grid size-[3.25rem] place-items-center rounded-full bg-[#25D366] text-white shadow-2xl transition-transform duration-300 hover:scale-110">
          <span aria-hidden className="absolute inset-0 rounded-full bg-[#25D366] opacity-40 motion-safe:animate-ping [animation-iteration-count:3]" />
          <WhatsAppIcon className="relative size-7" />
        </a>
      )}
    </div>
  );
}
