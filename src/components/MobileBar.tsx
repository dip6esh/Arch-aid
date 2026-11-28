"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { SITE, waLink } from "@/lib/content";
import { WhatsAppIcon } from "./WhatsAppIcon";

/** Phones/tablets: a compact round WhatsApp button in the bottom-right corner; hidden on the contact section. */
export function MobileBar() {
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
      {SITE.contact.whatsapp && (
        <a href={waLink()} target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp" tabIndex={vis ? 0 : -1}
          className="grid size-14 place-items-center rounded-full bg-[#25D366] text-white shadow-xl">
          <WhatsAppIcon className="size-8" />
        </a>
      )}
    </div>
  );
}
