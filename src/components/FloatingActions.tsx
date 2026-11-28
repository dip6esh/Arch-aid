"use client";
import { useEffect, useState } from "react";
import { SITE, waLink } from "@/lib/content";
import { WhatsAppIcon } from "./WhatsAppIcon";

/**
 * Desktop: the WhatsApp button, floating at the bottom-right of every page.
 * (Phones and tablets get it from MobileBar instead.) Appears a moment after the page loads.
 */
export function FloatingActions() {
  const [on, setOn] = useState(false);
  useEffect(() => { const t = setTimeout(() => setOn(true), 2200); return () => clearTimeout(t); }, []);
  return (
    <div className={`fixed bottom-8 right-6 z-40 hidden items-center gap-3 transition-all duration-700 lg:flex ${on ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-6 opacity-0"}`}>
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
