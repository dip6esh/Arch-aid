import type { Metadata } from "next";
import { Projects } from "@/components/Projects";
import { Cta } from "@/components/TeamAndCta";

export const metadata: Metadata = { title: "Projects", description: "Selected residence, corporate, hospitality, showroom and special interior projects by ARCH-AID." };

export default function Page() {
  return <><Projects /><Cta /></>;
}
