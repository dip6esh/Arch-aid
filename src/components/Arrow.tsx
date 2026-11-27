/**
 * One arrow for the whole site: a crisp stroked SVG (long shaft, open chevron head, round ends) instead of
 * text glyphs, so it looks identical on every device/font and inherits the surrounding text colour.
 * dir: "right" | "left" | "up" | "down" | "up-right". Size with the `className` (defaults to 1.25em so it scales with text).
 */
export type ArrowDir = "right" | "left" | "up" | "down" | "up-right";

export function Arrow({ dir = "right", className = "size-[1.25em]", strokeWidth = 1.75 }: { dir?: ArrowDir; className?: string; strokeWidth?: number }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${className}`}>
      {dir === "right" && <path d="M4 12h16M14 6l6 6-6 6" />}
      {dir === "left" && <path d="M20 12H4M10 6l-6 6 6 6" />}
      {dir === "up" && <path d="M12 20V4M6 10l6-6 6 6" />}
      {dir === "down" && <path d="M12 4v16M6 14l6 6 6-6" />}
      {dir === "up-right" && <path d="M6 18L18 6M8 6h10v10" />}
    </svg>
  );
}
