import type { Metadata } from "next";
import { ClientsPage } from "@/components/ClientsPage";
import { Cta } from "@/components/TeamAndCta";

export const metadata: Metadata = { title: "Celebrity Clients", description: "Film personalities, public figures and leaders who have trusted ARCH-AID with their spaces." };

export default function Page() {
  return <><ClientsPage /><Cta /></>;
}
