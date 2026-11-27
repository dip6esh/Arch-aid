import type { Metadata } from "next";
import { ServicesPage } from "@/components/ServicesPage";
import { Cta } from "@/components/TeamAndCta";

export const metadata: Metadata = { title: "Services", description: "Architectural, interior design and landscape design services from ARCH-AID, from approvals and working details to turnkey execution." };

export default function Page() {
  return <><ServicesPage /><Cta /></>;
}
