import { Reveal, Words } from "./Reveal";

/** One header pattern for every section: eyebrow + headline on the left, short lede on the right. */
export function SectionHead({ eyebrow, title, children, ledeClass = "text-mute" }: { eyebrow: string; title: string; children?: React.ReactNode; ledeClass?: string }) {
  return (
    <div className="mb-8 grid items-end gap-4 lg:mb-12 lg:grid-cols-12 lg:gap-x-8">
      <div className="lg:col-span-7">
        <Reveal><p className="eyebrow mb-4">{eyebrow}</p></Reveal>
        <Words className="max-w-[16ch] text-[clamp(2.6rem,6vw,5.25rem)]">{title}</Words>
      </div>
      {children && <Reveal className={`lg:col-span-4 lg:col-start-9 ${ledeClass}`}><p className="max-w-md">{children}</p></Reveal>}
    </div>
  );
}
