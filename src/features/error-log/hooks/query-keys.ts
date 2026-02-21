/**
 * Error Log Query Key Factory
 *
 * 📍 src/features/error-log/hooks/query-keys.ts
 */

export const errorLogKeys = {
  all: ["error-log"] as const,
  list: () => [...errorLogKeys.all, "list"] as const,
};
