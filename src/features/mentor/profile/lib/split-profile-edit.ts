import type { MentorHours } from "../../lib/hours";

/**
 * Body for PATCH mentor/profile/. The backend serializer accepts only these
 * keys (about, expertise, hours, linkedin); anything else — notably
 * `preferred_ig_ids` — is rejected with "Unknown field.". `hours: null`
 * clears the mentor's weekly availability.
 */
export interface MentorProfilePatch {
  about?: string;
  expertise?: string;
  hours?: MentorHours | null;
  linkedin?: string;
}

interface EditValues {
  about?: string;
  expertise?: string[];
  linkedin?: string;
  preferred_ig_ids?: string[];
  hours?: MentorHours;
}

interface CurrentValues {
  about?: string | null;
  expertise?: string | null;
  linkedin?: string | null;
  preferred_ig_ids?: string[] | null;
  hours?: string | null;
}

function sameSet(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  const set = new Set(b);
  return a.every((item) => set.has(item));
}

/**
 * Split a profile edit into what PATCH mentor/profile/ may carry and the
 * Interest Group change, which goes through mentor/<id>/preferred-igs/ as a
 * change request (release 1.91). Only fields present in `values` and actually
 * changed are included.
 */
export function splitProfileEdit(
  values: EditValues,
  current: CurrentValues,
): { profilePatch: MentorProfilePatch; igChange: string[] | null } {
  const profilePatch: MentorProfilePatch = {};

  if ("about" in values && (values.about ?? "") !== (current.about ?? "")) {
    profilePatch.about = values.about ?? "";
  }
  if ("expertise" in values) {
    const joined = (values.expertise ?? []).join(", ");
    if (joined !== (current.expertise ?? "")) profilePatch.expertise = joined;
  }
  if (
    "linkedin" in values &&
    (values.linkedin ?? "") !== (current.linkedin ?? "")
  ) {
    profilePatch.linkedin = values.linkedin ?? "";
  }
  if ("hours" in values && (values.hours ?? null) !== (current.hours ?? null)) {
    profilePatch.hours = values.hours ?? null;
  }

  let igChange: string[] | null = null;
  if ("preferred_ig_ids" in values) {
    const next = values.preferred_ig_ids ?? [];
    if (!sameSet(next, current.preferred_ig_ids ?? [])) igChange = next;
  }

  return { profilePatch, igChange };
}
