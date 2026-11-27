import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PROJECTS, img } from "@/lib/content";
import { ProjectPage } from "@/components/ProjectPage";
import { Cta } from "@/components/TeamAndCta";

/** One page per project, built ahead of time from the list in content.ts (add a project there and its page appears). */
export const dynamicParams = false;
export const generateStaticParams = () => PROJECTS.map((p) => ({ slug: p.slug }));

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = PROJECTS.find((x) => x.slug === slug);
  if (!p) return {};
  const description = `${p.name}: a ${p.cat.toLowerCase()} project${p.loc ? ` in ${p.loc}` : ""} designed by ARCH-AID. See the full photo album.`;
  return { title: p.name, description, openGraph: { title: `${p.name} | ARCH-AID`, description, images: [p.gallery?.[0] ?? img(p.img)] } };
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  const i = PROJECTS.findIndex((x) => x.slug === slug);
  if (i < 0) notFound();
  // every other project, starting with the one after this (and wrapping round), for the scrollable "More projects" rail
  const more = [...PROJECTS.slice(i + 1), ...PROJECTS.slice(0, i)];
  return <><ProjectPage project={PROJECTS[i]} more={more} /><Cta /></>;
}
