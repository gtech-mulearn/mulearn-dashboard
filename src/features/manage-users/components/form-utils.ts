/**
 * Manage Users Form Utilities
 *
 * 📍 src/features/manage-users/components/form-utils.ts
 *
 * Pure utility functions extracted from the UserForm component.
 */

import type { ManageUserFormValues } from "../schemas";

export type DirtyFields = Partial<Record<keyof ManageUserFormValues, boolean>>;

/**
 * Resolves a raw string value (from the API) to the matching option `value`
 * by checking both value and label fields case-insensitively.
 */
export function resolveOptionValue(
  raw: string | null | undefined,
  options: { value: string; label: string }[],
): string {
  if (!raw) return "";
  const normalizedRaw = raw.trim().toLowerCase();
  const byValue = options.find(
    (option) => option.value.trim().toLowerCase() === normalizedRaw,
  );
  if (byValue) return byValue.value;
  const byLabel = options.find(
    (option) => option.label.trim().toLowerCase() === normalizedRaw,
  );
  return byLabel?.value ?? "";
}

/**
 * Builds a minimal PATCH payload from form values,
 * including only fields that were actually changed (dirty).
 */
export function normalizePayload(
  values: ManageUserFormValues,
  dirty: DirtyFields,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  if (dirty.full_name) payload.full_name = values.full_name;
  if (dirty.email) payload.email = values.email;
  if (dirty.mobile) payload.mobile = values.mobile;
  if (dirty.discord_id) payload.discord_id = values.discord_id;
  if (dirty.roles) payload.roles = values.roles;
  if (dirty.interest_groups) payload.interest_groups = values.interest_groups;

  if (dirty.location_id || dirty.district_id) {
    payload.district = values.location_id || values.district_id || null;
  }

  // College organization details (org, department, graduation year) are linked on the backend.
  // We must send them together if any of them are modified.
  if (
    dirty.college_id ||
    dirty.community ||
    dirty.department_id ||
    dirty.graduation_year
  ) {
    payload.organizations = values.college_id
      ? [values.college_id, ...values.community]
      : values.community;
    payload.department = values.department_id || null;
    payload.graduation_year = values.graduation_year
      ? Number(values.graduation_year)
      : null;
  }

  for (const key of Object.keys(payload)) {
    const value = payload[key];
    const isEmptyString = typeof value === "string" && value.trim() === "";
    const isEmptyArray = Array.isArray(value) && value.length === 0;

    // Do NOT delete null values (e.g. for graduation_year or department) as they are used to clear fields.
    if (value === undefined || isEmptyString || isEmptyArray) {
      delete payload[key];
    }
  }

  return payload;
}
