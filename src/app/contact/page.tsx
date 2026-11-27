import type { Metadata } from "next";
import { ContactPage } from "@/components/ContactPage";

export const metadata: Metadata = { title: "Contact", description: "Get in touch with ARCH-AID: studio address on Google Maps, phone and email." };

export default function Page() {
  return <ContactPage />;
}
