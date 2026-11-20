import Link from "next/link";
import { SITE, NAV } from "@/lib/content";


export function Footer() {
  const c = SITE.contact;
  return (
    <footer id="footer" className="bg-char pb-28 pt-14 lg:pb-8 text-cream">
      <div className="wrap">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1.3fr]">
          <div><span className="logo mb-6 w-36" role="img" aria-label="ARCH-AID" /><p className="max-w-xs text-sm text-[#b9b1a5]">An architecture and interior design practice creating thoughtful, distinctive spaces shaped around the people who use them.</p></div>
          <div><h4 className="mb-5 text-xs tracking-wider text-[#b9b1a5]">Navigate</h4><ul className="grid gap-2 text-sm">{NAV.map(([n, h]) => <li key={h}><Link className="hover:text-acc" href={h}>{n}</Link></li>)}</ul></div>
          <div><h4 className="mb-5 text-xs tracking-wider text-[#b9b1a5]">Contact</h4>
            <ul className="grid gap-2 text-sm">
              {c.office && <li className="max-w-xs text-[#b9b1a5]">{c.office}</li>}
              {c.phone && <li><a className="hover:text-acc" href={`tel:${c.phone.replace(/[^\d+]/g, "")}`}>{c.phone}</a></li>}
              {c.email && <li><a className="hover:text-acc" href={`mailto:${c.email}`}>{c.email}</a></li>}
              {c.whatsapp && <li><a className="hover:text-acc" href={`https://wa.me/${c.whatsapp.replace(/\D/g, "")}`}>WhatsApp</a></li>}
              {c.social.map((s) => <li key={s.name}><a href={s.url} rel="noopener">{s.name}</a></li>)}
            </ul></div>
        </div>
        <div className="mt-20 flex flex-wrap justify-between gap-4 border-t border-white/15 pt-6 text-sm text-[#b9b1a5]">
          <b className="text-lg font-semibold tracking-tight text-cream">Thoughtfully designed. Meaningfully experienced.</b>
          <span>© {new Date().getFullYear()} ARCH-AID. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
