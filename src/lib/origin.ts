/** Where a picture sits on screen right now, so the full-screen viewer can grow out of it (and shrink back into it). */
export type Origin = { x: number; y: number; w: number; h: number; ratio: number; src: string };

/** Measure `el` (a picture, or any element that contains one). Returns null if the picture has not loaded yet. */
export function originOf(el: Element | null | undefined): Origin | null {
  if (!el) return null;
  const im = el instanceof HTMLImageElement ? el : el.querySelector("img");
  if (!im || !im.naturalWidth || !im.naturalHeight) return null;
  const r = el.getBoundingClientRect();
  if (r.width < 8 || r.height < 8) return null;
  return { x: r.left, y: r.top, w: r.width, h: r.height, ratio: im.naturalWidth / im.naturalHeight, src: im.currentSrc || im.src };
}
