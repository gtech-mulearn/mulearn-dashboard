import type { ProfileCompletionChecklist } from "../../api/mentor.api";

type ChecklistKey = keyof ProfileCompletionChecklist;

/**
 * Checklist items that apply to this mentor. The backend sends `null` for a
 * check that doesn't apply (e.g. `preferred_igs` for a non-IG mentor); those
 * must not show as "missing" or count toward the total.
 */
export function applicableChecklistEntries(
  checklist: ProfileCompletionChecklist,
): Array<[ChecklistKey, boolean]> {
  return (
    Object.entries(checklist) as Array<[ChecklistKey, boolean | null]>
  ).filter(
    (entry): entry is [ChecklistKey, boolean] => typeof entry[1] === "boolean",
  );
}
