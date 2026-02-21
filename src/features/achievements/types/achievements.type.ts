// All types are inferred from Zod schemas in achievements.schema.ts
// Import from here to get full type safety without separate interface definitions.

export * from "../schemas/achievements.schema";

// Utility types for pagination
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    perPage: number;
    totalPages: number;
  };
}
