export interface PlateInfo {
  n: string;
  title: string;
  place: string;
  date: string;
  medium: string;
  note: string;
  /** Draws the plate and returns a standalone SVG document string (1400×760). */
  fn: (p: PlateInfo) => string;
}

export const plates: PlateInfo[];
export function esc(s: string): string;
/** Botanical decorations, 440×780 SVG documents. */
export function fernSVG(seed: number): string;
/** 460×780 SVG document. */
export function orchidSVG(seed: number): string;
