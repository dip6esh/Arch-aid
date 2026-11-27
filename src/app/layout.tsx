import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Manrope } from "next/font/google";
import { Cursor } from "@/components/Cursor";
import { EnquiryProvider } from "@/components/EnquiryDialog";
import { MobileBar } from "@/components/MobileBar";
import { ScrollTop } from "@/components/ScrollTop";
import { FloatingActions } from "@/components/FloatingActions";
import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { ScrollProgress } from "@/components/ScrollProgress";
import { SmoothScroll } from "@/components/SmoothScroll";
import { TransitionProvider } from "@/components/Transition";
import "./globals.css";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope" });
const instrument = Instrument_Serif({ subsets: ["latin"], variable: "--font-instrument", weight: "400", style: ["normal", "italic"] });

export const metadata: Metadata = {
  // Set NEXT_PUBLIC_SITE_URL (e.g. https://your-domain.com) so shared links (WhatsApp, Facebook…) show the preview picture.
  ...(process.env.NEXT_PUBLIC_SITE_URL ? { metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL) } : {}),
  title: { default: "ARCH-AID | Architecture & Interior Design", template: "%s | ARCH-AID" },
  description: "ARCH-AID is an architecture and interior design practice creating thoughtfully designed, distinctive spaces.",
  openGraph: { title: "ARCH-AID", description: "Spaces that tell your story.", images: ["/images/banner.webp"] },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

/** Runs before first paint: apply the saved theme, else the visitor's system preference. */
const THEME_INIT = `try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark")t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${manrope.variable} ${instrument.variable}`}>
      <head><script dangerouslySetInnerHTML={{ __html: THEME_INIT }} /></head>
      <body className="font-sans"><SmoothScroll /><ScrollProgress /><Cursor />
        <EnquiryProvider><TransitionProvider><Nav /><main>{children}</main><Footer /><MobileBar /><FloatingActions /><ScrollTop /></TransitionProvider></EnquiryProvider></body>
    </html>
  );
}
