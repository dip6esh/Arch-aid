"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SITE, waLink } from "@/lib/content";
import { useEnquiry } from "./EnquiryDialog";
import { WhatsAppIcon } from "./WhatsAppIcon";
import { Arrow } from "./Arrow";

/** Thumb-reach actions for phones/tablets ("Book a consultation" + WhatsApp); hides on the contact section. */
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
    <div className={`fixed inset-x-0 bottom-0 z-40 p-3 pb-[max(.75rem,env(safe-area-inset-bottom))] transition-transform duration-500 lg:hidden ${vis ? "translate-y-0" : "translate-y-full"}`}>
      <div className="flex items-center gap-2">
        <button onClick={enquire} className="flex min-w-0 flex-1 items-center justify-between rounded-full border border-white/15 bg-char/90 py-2 pl-6 pr-2 text-sm font-medium text-cream shadow-2xl backdrop-blur-xl">
          Book a consultation <span className="grid size-9 place-items-center rounded-full bg-acc text-white"><Arrow className="size-5" /></span>
        </button>
        {SITE.contact.whatsapp && (
          <a href={waLink()} target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp" tabIndex={vis ? 0 : -1}
            className="grid size-[3.1rem] shrink-0 place-items-center rounded-full bg-[#25D366] text-white shadow-2xl">
            <WhatsAppIcon className="size-7" />
          </a>
        )}
      </div>
    </div>
  );
}
