/**
 * Course Query Keys
 *
 * 📍 src/features/courses/hooks/query-keys.ts
 */

export const courseKeys = {
  all: ["courses"] as const,
  opengrad: {
    all: ["courses", "opengrad"] as const,
    token: () => ["courses", "opengrad", "token"] as const,
    list: (token?: string) =>
      ["courses", "opengrad", "list", { token }] as const,
  },
  wadhwani: {
    all: ["courses", "wadhwani"] as const,
    sheet: () => ["courses", "wadhwani", "sheet"] as const,
    token: () => ["courses", "wadhwani", "token"] as const,
    list: (accessToken?: string) =>
      ["courses", "wadhwani", "list", accessToken] as const,
  },
};
