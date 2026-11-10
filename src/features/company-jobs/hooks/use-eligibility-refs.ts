/**
 * Eligibility reference-data hooks
 *
 * 📍 src/features/company-jobs/hooks/use-eligibility-refs.ts
 *
 * Cached level lookup for the "Add Eligibility Rule" Min/Max Level dropdown
 * (issue #23). `enabled` lets the dialog fetch only when a level rule type is
 * selected.
 */

import { useQuery } from "@tanstack/react-query";
import {
  type EligibilityLevel,
  type EligibilitySkill,
  fetchEligibilityLevels,
  fetchEligibilitySkills,
} from "../api/eligibility-refs.api";

export type { EligibilityLevel, EligibilitySkill };

const ELIGIBILITY_KEYS = {
  all: ["company-jobs", "eligibility-refs"] as const,
  levels: () => ["company-jobs", "eligibility-refs", "levels"] as const,
  skills: () => ["company-jobs", "eligibility-refs", "skills"] as const,
};

// Levels change rarely; cache aggressively.
const STALE_TIME = 10 * 60 * 1000;

/** Active skills for the "Required skill" rule (value = skill id). */
export function useEligibilitySkills(enabled = true) {
  return useQuery({
    queryKey: ELIGIBILITY_KEYS.skills(),
    queryFn: fetchEligibilitySkills,
    staleTime: STALE_TIME,
    enabled,
  });
}

export function useEligibilityLevels(enabled = true) {
  return useQuery({
    queryKey: ELIGIBILITY_KEYS.levels(),
    queryFn: fetchEligibilityLevels,
    staleTime: STALE_TIME,
    enabled,
  });
}
