/**
 * Problem Statement TypeScript Types
 *
 * 📍 src/features/problem-statements/types/problem-statement.types.ts
 *
 * All types are inferred from Zod schemas — never write duplicate interfaces.
 * Aligned with PROBLEM_STATEMENT_API.md.
 */

import type { z } from "zod";
import type {
  AdminCreateStatementSchema,
  CompanyCreateStatementSchema,
  EmbeddedCompanySchema,
  InteractionStatusSchema,
  InteractionsResponseSchema,
  InteractionUserSchema,
  LearnerInteractionSchema,
  PaginationSchema,
  ProblemStatementSchema,
  ProblemStatementStatusSchema,
  SetInteractionSchema,
  SubmitSolutionSchema,
  UpdateStatementSchema,
} from "../schemas/problem-statement.schema";

// ─── Enum Types ───────────────────────────────────────────────────────────────

export type ProblemStatementStatus = z.infer<
  typeof ProblemStatementStatusSchema
>;

/** Interaction statuses: "Trying" or "Submitted" */
export type InteractionStatus = z.infer<typeof InteractionStatusSchema>;

// ─── Core Entity Types ────────────────────────────────────────────────────────

export type EmbeddedCompany = z.infer<typeof EmbeddedCompanySchema>;
export type ProblemStatement = z.infer<typeof ProblemStatementSchema>;

/** Alias used in learner-facing view (same shape, my_interaction populated) */
export type ProblemStatementCard = ProblemStatement;

/** Alias used in manage/admin views (same shape, audit fields populated) */
export type ProblemStatementDetail = ProblemStatement;

export type LearnerInteraction = z.infer<typeof LearnerInteractionSchema>;
export type InteractionUser = z.infer<typeof InteractionUserSchema>;
export type InteractionsResponse = z.infer<typeof InteractionsResponseSchema>;
export type Pagination = z.infer<typeof PaginationSchema>;

// ─── Payload Types (for API calls) ───────────────────────────────────────────

export type CompanyCreateStatementPayload = z.infer<
  typeof CompanyCreateStatementSchema
>;
export type AdminCreateStatementPayload = z.infer<
  typeof AdminCreateStatementSchema
>;
export type UpdateStatementPayload = z.infer<typeof UpdateStatementSchema>;
export type SetInteractionPayload = z.infer<typeof SetInteractionSchema>;
export type SubmitSolutionPayload = z.infer<typeof SubmitSolutionSchema>;

// ─── Query Parameter Types ────────────────────────────────────────────────────

/** Query params for the learner feed GET / */
export interface FeedQueryParams {
  pageIndex?: number;
  perPage?: number;
  search?: string;
  /** exact category (case-insensitive) */
  category?: string;
  /** exact skill name */
  skill?: string;
  /** filter by a specific company */
  company_id?: string;
  /** "company" or "mulearn" (admin-authored) */
  source?: "company" | "mulearn";
  /** hide statements whose deadline has passed */
  open_only?: boolean;
  /** published_at (default, newest first), deadline, title */
  sortBy?: string;
}

/** Query params for GET company/ */
export interface CompanyQueryParams {
  pageIndex?: number;
  perPage?: number;
  search?: string;
  status?: ProblemStatementStatus | "all";
  category?: string;
  /** "company" or "mulearn" */
  source?: "company" | "mulearn";
  /** title, created_at, updated_at, published_at, deadline */
  sortBy?: string;
}

/** Query params for GET admin/ (superset of CompanyQueryParams) */
export interface AdminQueryParams extends CompanyQueryParams {
  company_id?: string;
}

/** Query params for GET <id>/interactions/ (company and admin) */
export interface InteractionsQueryParams {
  pageIndex?: number;
  perPage?: number;
  /** search by user name or muid */
  search?: string;
  /** filter by interaction status: Trying / Submitted */
  status?: InteractionStatus;
  /** created_at, status, name, submitted_at */
  sortBy?: string;
}

// ─── Response Types ───────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[];
  pagination: Pagination;
}

/** Status filter options for the public learner feed */
export type FeedStatusFilter = "all" | "open" | "trying" | "submitted";
