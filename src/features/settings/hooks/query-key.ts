/**
 * Query Keys for Settings
 *
 * 📍 src/features/settings/hooks/query-keys.ts
 */

export const settingsKeys = {
  all: ["settings"] as const,
  colleges: () => [...settingsKeys.all, "colleges"] as const,
  collegeSearch: (search: string) =>
    [...settingsKeys.all, "colleges", "search", search] as const,
  departments: () => [...settingsKeys.all, "departments"] as const,
  departmentSearch: (search: string) =>
    [...settingsKeys.all, "departments", "search", search] as const,
};
