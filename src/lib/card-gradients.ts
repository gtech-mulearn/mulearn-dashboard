/**
 * Deterministic pastel gradients shared by the card grids across the app
 * (search learners/mentors/campuses, interest groups) so the palette stays
 * consistent everywhere.
 *
 * Each entry carries a `dark:` counterpart. That matters: these gradients are
 * the card's surface, and text on them uses semantic tokens (`text-foreground`,
 * `text-muted-foreground`). Those tokens invert with the theme, so the surface
 * MUST invert too — otherwise dark mode paints near-white text onto a light
 * pastel. Keep every entry light-in-light / dark-in-dark.
 *
 * Values are bare color stops — prefix with `bg-linear-to-br` at the use site.
 */
export const PASTEL_CARD_GRADIENTS = [
  "from-sky-200 via-sky-100 to-emerald-100 dark:from-sky-900 dark:via-sky-950 dark:to-emerald-950",
  "from-rose-200 via-rose-100 to-orange-100 dark:from-rose-900 dark:via-rose-950 dark:to-orange-950",
  "from-violet-200 via-violet-100 to-sky-100 dark:from-violet-900 dark:via-violet-950 dark:to-sky-950",
  "from-amber-100 via-orange-100 to-rose-200 dark:from-amber-950 dark:via-orange-950 dark:to-rose-900",
  "from-teal-200 via-cyan-100 to-sky-100 dark:from-teal-900 dark:via-cyan-950 dark:to-sky-950",
  "from-fuchsia-200 via-pink-100 to-violet-100 dark:from-fuchsia-900 dark:via-pink-950 dark:to-violet-950",
] as const;

/** Stable gradient for a given seed (muid, campus code, group id, etc.). */
export function pickCardGradient(seed: string): string {
  const sum = Array.from(seed).reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return PASTEL_CARD_GRADIENTS[sum % PASTEL_CARD_GRADIENTS.length];
}
