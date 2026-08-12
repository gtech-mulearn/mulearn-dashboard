/**
 * Search Query Keys
 *
 * 📍 src/features/search/hooks/query-keys.ts
 */

export const searchKeys = {
  all: ["search"] as const,
  campuses: (query: string, type?: string, filters?: unknown) =>
    [...searchKeys.all, "campuses", { query, type, filters }] as const,
  users: (query: string) => [...searchKeys.all, "users", { query }] as const,
  mentors: (query: string) =>
    [...searchKeys.all, "mentors", { query }] as const,
};
