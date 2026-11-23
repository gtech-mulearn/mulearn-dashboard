/**
 * The profile's college id, or "" when there's no college.
 *
 * A college only when its code comes with it: older backends send a mentor's
 * company id as `college_id` (with no `college_code`), which isn't a college
 * and showed in the edit form as a raw id.
 */
export function profileCollegeId(profile: {
  college_id?: string | null;
  college_code?: string | null;
}): string {
  return profile.college_code ? (profile.college_id ?? "") : "";
}
