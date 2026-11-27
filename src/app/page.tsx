import { About } from "@/components/About";
import { Hero } from "@/components/Hero";
import { Marquee } from "@/components/Marquee";
import { Preloader } from "@/components/Preloader";
import { Projects } from "@/components/Projects";
import { Cta } from "@/components/TeamAndCta";

export default function Home() {
  return (
    <>
      <Preloader />
      <Hero /><Marquee /><About /><Projects featured /><Cta />
    </>
  );
}
