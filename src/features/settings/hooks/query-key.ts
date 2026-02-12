/**
 * Query Keys for Settings
 *
 * 📍 src/features/settings/hooks/query-keys.ts
 */

export const settingsKeys = {
  all: ["settings"] as const,
  colleges: () => [...settingsKeys.all, "colleges"] as const,
  departments: () => [...settingsKeys.all, "departments"] as const,
};
