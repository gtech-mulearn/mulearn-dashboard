/**
 * Problem Statements Feature
 *
 * 📍 src/features/problem-statements/index.ts
 *
 * Public API surface for the problem-statements feature slice.
 * Import from this barrel wherever possible; avoid deep imports.
 *
 * Architecture:
 *  api/        — API functions (learner, management, admin)
 *  components/ — UI components (cards, grid, wizard, dashboard)
 *  constants/  — Static config (pills, sort options, badge configs)
 *  hooks/      — TanStack Query hooks + query-keys
 *  schemas/    — Zod schemas
 *  types/      — Inferred TypeScript types
 */

// API functions (for direct use in SSR/RSC if needed)
export * from "./api";
// Components
export * from "./components";
// Constants
export * from "./constants/problem-statement.constants";
// Hooks
export * from "./hooks";

// Schemas (for external form validation reuse)
export * from "./schemas";
// Types
export * from "./types";
