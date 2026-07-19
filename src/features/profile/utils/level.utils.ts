/**
 * Level Utilities
 *
 * 📍 src/features/profile/utils/level.utils.ts
 *
 * Parses the API's level string and maps it to display copy.
 */

/** The ladder tops out at lvl7 (confirmed against get-user-levels/). */
export const MAX_LEVEL = 7;

/** Short caption shown under the level on the profile stat card. */
const LEVEL_MESSAGES: Record<number, string> = {
  1: "Just getting started",
  2: "Finding your footing",
  3: "Building momentum",
  4: "Hitting your stride",
  5: "Going strong",
  6: "One step from the top",
  7: "Max level reached",
};

/**
 * Pull the level number out of the API's `"lvl7"` format.
 *
 * Matches on digits rather than slicing a fixed offset, so a future "lvl10"
 * reads as 10 instead of 1. Defaults to 1 when the field is missing.
 */
export function parseLevelNumber(level: string | null | undefined): number {
  const digits = level?.match(/\d+/);
  if (!digits) return 1;

  const parsed = Number.parseInt(digits[0], 10);
  return Number.isNaN(parsed) || parsed < 1 ? 1 : parsed;
}

/**
 * Caption for a level, or undefined if there isn't one — callers pass this
 * straight to StatCard, which omits the line when it's absent.
 */
export function getLevelMessage(
  level: string | null | undefined,
): string | undefined {
  return LEVEL_MESSAGES[parseLevelNumber(level)];
}
