/**
 * Eligibility reference-data API
 *
 * 📍 src/features/company-jobs/api/eligibility-refs.api.ts
 *
 * Fetches the level list used to populate the "Add Eligibility Rule" value
 * field for Min/Max Level rules (issue #23), so a company selects a real level
 * rather than free-typing. The stored value is the numeric `level_order` the
 * backend compares against. (Karma rules use a plain numeric input; Skill /
 * Interest Group / Achievement rule types were removed.)
 */

import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";

export interface EligibilityLevel {
  /** The numeric `level_order` the backend compares against (stored as the rule value). */
  id: string;
  name: string;
  level_order: number;
}

/** Pull an array out of the various envelope shapes the list endpoint may return. */
function toArray(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) return payload as Record<string, unknown>[];
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    for (const key of ["data", "results", "items"]) {
      if (Array.isArray(obj[key])) return obj[key] as Record<string, unknown>[];
    }
  }
  return [];
}

export async function fetchEligibilityLevels(): Promise<EligibilityLevel[]> {
  const data = await apiClient.get<unknown>(endpoints.adminTask.taskLevelList);
  return toArray(data)
    .filter(
      (it) => it.level_order != null && !Number.isNaN(Number(it.level_order)),
    )
    .map((it) => ({
      id: String(it.level_order),
      name: String(it.name ?? `Level ${it.level_order}`).trim(),
      level_order: Number(it.level_order),
    }))
    .sort((a, b) => a.level_order - b.level_order);
}
