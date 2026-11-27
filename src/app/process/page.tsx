import type { Metadata } from "next";
import { Process } from "@/components/Process";
import { Cta } from "@/components/TeamAndCta";

export const metadata: Metadata = { title: "Process", description: "How ARCH-AID takes a project from first idea to finished space." };

export default function Page() {
  return <div className="pt-[76px]"><Process /><Cta /></div>;
}
