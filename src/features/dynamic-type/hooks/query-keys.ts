/**
 * Dynamic Type Query Keys
 *
 * 📍 src/features/dynamic-type/hooks/query-keys.ts
 *
 * Centralized, type-safe query key factory for TanStack Query caching.
 */

export const dynamicTypeKeys = {
  all: ["dynamic-type"] as const,

  // Dynamic role-type list
  roles: () => [...dynamicTypeKeys.all, "roles"] as const,

  // Dynamic user-type list
  users: () => [...dynamicTypeKeys.all, "users"] as const,

  // Lookup: available roles for dropdown
  lookupRoles: () => [...dynamicTypeKeys.all, "lookup-roles"] as const,

  // Lookup: available types for dropdown
  lookupTypes: () => [...dynamicTypeKeys.all, "lookup-types"] as const,
} as const;
