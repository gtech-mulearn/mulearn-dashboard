/**
 * Pastel chip palette for multi-item lists (skills, tags, interests, tech stack …)
 *
 * When several chips are shown together and have no inherent semantic meaning,
 * each chip should get its own soft pastel colour so the list reads as a varied,
 * friendly group rather than a wall of identical black pills.
 *
 * Colours are stable per label: the same string always maps to the same pastel,
 * so a given skill keeps its colour across renders and pages.
 *
 * Every entry uses design-system tokens only (no hex / Tailwind palette colours).
 */

export const CHIP_PASTELS = [
  "bg-brand-blue/10 text-brand-blue",
  "bg-brand-purple/10 text-brand-purple",
  "bg-success/10 text-success",
  "bg-warning/10 text-warning",
  "bg-chart-2/15 text-chart-2",
  "bg-chart-1/15 text-chart-1",
  "bg-destructive/10 text-destructive",
  "bg-chart-3/15 text-chart-3",
] as const;

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0; // force 32-bit int
  }
  return Math.abs(hash);
}

/**
 * Returns a pastel `bg-* text-*` class pair for a chip.
 *
 * @param key A stable identifier for the chip — pass the label/skill string to
 *            get a deterministic colour, or a numeric index for positional
 *            rotation.
 */
export function chipColor(key: string | number): string {
  const index = typeof key === "number" ? Math.abs(key) : hashString(key);
  return CHIP_PASTELS[index % CHIP_PASTELS.length];
}
