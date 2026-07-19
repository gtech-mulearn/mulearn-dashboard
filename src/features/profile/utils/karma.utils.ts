/**
 * Karma Distribution Utilities
 *
 * 📍 src/features/profile/utils/karma.utils.ts
 *
 * Turns the API's karma data into chart-ready slices, broken down by
 * interest group.
 */

import type { InterestGroup } from "../schemas";

export interface KarmaSlice {
  name: string;
  value: number;
}

export interface KarmaBreakdown {
  slices: KarmaSlice[];
  total: number;
}

/** IG rows shown before the rest are folded into the remainder bucket. */
export const MAX_IG_SLICES = 5;

/**
 * Everything not attributed to a listed interest group.
 *
 * Deliberately not called "General Tasks": besides non-IG work it also absorbs
 * karma from IGs the user has no level link for, which the profile payload
 * never lists. Naming it "Other" keeps the label true to what it contains.
 */
export const OTHER_LABEL = "Other Tasks";

/**
 * Build a per-interest-group karma breakdown.
 *
 * Uses wallet karma as the base and derives the remainder, rather than summing
 * `karma_distribution`. That matters because the two API fields describe the
 * same karma on different axes — `karma_distribution` buckets by task type
 * (IG / Mentor / Intern / Events / Other) while `interest_groups[].karma`
 * buckets by IG — so adding them together double-counts.
 *
 * Deriving the remainder as `walletKarma - attributedToIgs` keeps the slices a
 * true partition: they always sum to the total, whatever the IG data omits.
 */
export function buildKarmaBreakdown(
  totalKarma: number,
  interestGroups: InterestGroup[],
  maxIgSlices: number = MAX_IG_SLICES,
): KarmaBreakdown {
  const igSlices = interestGroups
    .filter((ig): ig is InterestGroup & { karma: number } =>
      Boolean(ig.karma && ig.karma > 0),
    )
    .map((ig) => ({ name: ig.name, value: ig.karma }))
    .sort((a, b) => b.value - a.value);

  const attributed = igSlices.reduce((sum, slice) => sum + slice.value, 0);

  // Never let the base fall below what the IGs already claim, so the
  // remainder can't go negative if wallet karma lags behind the logs.
  const total = Math.max(totalKarma, attributed);

  const shown = igSlices.slice(0, maxIgSlices);
  const shownSum = shown.reduce((sum, slice) => sum + slice.value, 0);
  const other = total - shownSum;

  return {
    slices: other > 0 ? [...shown, { name: OTHER_LABEL, value: other }] : shown,
    total,
  };
}
