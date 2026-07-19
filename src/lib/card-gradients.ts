/**
 * Deterministic pastel gradients shared by the card grids across the app
 * (search learners/mentors/campuses, interest groups) so the palette stays
 * consistent everywhere. Values are bare color stops — prefix with
 * `bg-linear-to-br` at the use site. Pick one with `pickCardGradient`.
 */
export const PASTEL_CARD_GRADIENTS = [
  "from-sky-200 via-sky-100 to-emerald-100",
  "from-rose-200 via-rose-100 to-orange-100",
  "from-violet-200 via-violet-100 to-sky-100",
  "from-amber-100 via-orange-100 to-rose-200",
  "from-teal-200 via-cyan-100 to-sky-100",
  "from-fuchsia-200 via-pink-100 to-violet-100",
] as const;

/** Stable gradient for a given seed (muid, campus code, group code, etc.). */
export function pickCardGradient(seed: string): string {
  const sum = Array.from(seed).reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return PASTEL_CARD_GRADIENTS[sum % PASTEL_CARD_GRADIENTS.length];
}
