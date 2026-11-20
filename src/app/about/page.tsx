import type { Metadata } from "next";
import { AboutPage } from "@/components/AboutPage";
import { Cta } from "@/components/TeamAndCta";

export const metadata: Metadata = { title: "About", description: "ARCH-AID is a multi-service architecture, interior and landscape design firm in Mumbai, led by principal architects Neilesh and Bhavya Kenkare." };

export default function Page() {
  return <><AboutPage /><Cta /></>;
}
