/**
 * Problem Statement Schemas
 *
 * 📍 src/features/problem-statements/schemas/problem-statement.schema.ts
 *
 * Zod v4 schemas aligned with PROBLEM_STATEMENT_API.md.
 * TypeScript types are inferred directly from these schemas — do not hand-write
 * duplicate interfaces.
 *
 * IMPORTANT: The backend rejects any unknown field with 400 "Unknown field."
 * Only send the fields listed here; never add extra ones.
 *
 * Statuses: Draft → Published → Unpublished (three-state, no Closed/Archived/Removed)
 * Interaction: "Trying" only (single-click toggle via PUT / DELETE)
 */

import { z } from "zod";

// ─── Enums ───────────────────────────────────────────────────────────────────

export const ProblemStatementStatusSchema = z.enum([
  "Draft",
  "Published",
  "Unpublished",
]);

/** Interaction statuses supported: Trying and Submitted */
export const InteractionStatusSchema = z.enum(["Trying", "Submitted"]);

// ─── Shared Sub-objects ──────────────────────────────────────────────────────

/**
 * Minimal company info embedded in every statement response.
 * For statements created by an admin (not attributed to any company),
 * this is always { id: null, name: "muLearn", logo: null }.
 */
export const EmbeddedCompanySchema = z.object({
  id: z.string().nullable().optional(),
  name: z.string(),
  logo: z.string().nullable().optional(),
});

/** Pagination object returned by all list responses */
export const PaginationSchema = z.object({
  count: z.number().int(),
  totalPages: z.number().int(),
  isNext: z.boolean(),
  isPrev: z.boolean(),
  nextPage: z.number().int().nullable().optional(),
});

// ─── Core Statement Object ───────────────────────────────────────────────────

/**
 * The problem statement object returned by company and admin endpoints.
 * Learner endpoints return the same shape WITHOUT created_by / updated_by /
 * published_by, but WITH my_interaction ("Trying" | "Submitted" | null).
 */
export const ProblemStatementSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  skills: z.array(z.string()),
  deadline: z.string().nullable(),
  status: ProblemStatementStatusSchema,
  company: EmbeddedCompanySchema,
  /** true when status === "Published" AND deadline has not passed */
  is_open: z.boolean(),
  /** Number of users per interaction status. Always has every status key: { Trying: number, Submitted: number }. */
  interaction_counts: z.record(z.string(), z.number()),
  // Audit timestamps (company/admin responses)
  created_by: z.string().nullable().optional(),
  created_at: z.string().optional(),
  updated_by: z.string().nullable().optional(),
  updated_at: z.string().optional(),
  published_by: z.string().nullable().optional(),
  published_at: z.string().nullable().optional(),
  // Learner-facing field (null = no interaction yet)
  my_interaction: InteractionStatusSchema.nullable().optional(),
});

// ─── Interaction Sub-objects ─────────────────────────────────────────────────

/**
 * The full learner interaction object returned by
 * GET <id>/interaction/  (null fields when no interaction exists)
 */
export const LearnerInteractionSchema = z.object({
  status: InteractionStatusSchema.nullable(),
  submission_url: z.string().nullable().optional(),
  submitted_at: z.string().nullable().optional(),
  created_at: z.string().nullable(),
  updated_at: z.string().nullable(),
});

/**
 * A single learner row returned by company / admin interactions endpoints:
 * GET company/<id>/interactions/ and GET admin/<id>/interactions/
 */
export const InteractionUserSchema = z.object({
  user_id: z.string(),
  muid: z.string(),
  full_name: z.string(),
  status: InteractionStatusSchema,
  submission_url: z.string().nullable().optional(),
  submitted_at: z.string().nullable().optional(),
  created_at: z.string(),
  updated_at: z.string(),
});

/** Response shape for GET company/<id>/interactions/ and admin equivalent */
export const InteractionsResponseSchema = z.object({
  counts: z.record(z.string(), z.number()).optional().default({}),
  data: z.array(InteractionUserSchema),
  pagination: PaginationSchema,
});

// ─── Response Envelopes ──────────────────────────────────────────────────────

export const DjangoResponse = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    hasError: z.boolean().optional(),
    statusCode: z.number().optional(),
    message: z.unknown().optional(),
    response: dataSchema,
  });

export const ProblemStatementListResponseSchema = DjangoResponse(
  z.object({
    data: z.array(ProblemStatementSchema),
    pagination: PaginationSchema,
  }),
);

export const ProblemStatementDetailResponseSchema = DjangoResponse(
  ProblemStatementSchema,
);

export const InteractionsListResponseSchema = DjangoResponse(
  InteractionsResponseSchema,
);

export const LearnerInteractionResponseSchema = DjangoResponse(
  LearnerInteractionSchema,
);

export const SetInteractionResponseSchema = DjangoResponse(
  z.object({
    status: z.string(),
    counts: z.record(z.string(), z.number()),
  }),
);

export const InteractionCountsResponseSchema = DjangoResponse(
  z.record(z.string(), z.number()),
);

/** Generic success response with no typed payload */
export const GenericResponseSchema = DjangoResponse(z.unknown().optional());

// ─── Form Payloads (strictly whitelisted — extra fields → 400) ───────────────

/**
 * Fields accepted by both POST company/ and PATCH company/<id>/.
 * The backend de-duplicates skills case-insensitively and trims them.
 */
export const StatementFormSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(150, "Title must be 150 characters or fewer"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(20000, "Description must be 20,000 characters or fewer"),
  category: z
    .string()
    .min(1, "Category is required")
    .max(100, "Category must be 100 characters or fewer"),
  skills: z
    .array(
      z.string().min(1).max(50, "Each skill must be 50 characters or fewer"),
    )
    .max(15, "At most 15 skills")
    .optional()
    .default([]),
  deadline: z.string().nullable().optional(),
});

/** Full create payload for company users */
export const CompanyCreateStatementSchema = StatementFormSchema;

/**
 * Full create payload for admin users.
 * Statements are created directly for muLearn and are not attributed to any
 * company — company_id is NOT an accepted field (causes 400 if sent).
 */
export const AdminCreateStatementSchema = StatementFormSchema;

/** PATCH payload — all fields optional */
export const UpdateStatementSchema = StatementFormSchema.partial();

/**
 * Payload for PUT <id>/interaction/
 * status is optional and defaults to "Trying" on the backend.
 */
export const SetInteractionSchema = z.object({
  status: z.literal("Trying").optional().default("Trying"),
});

/**
 * Payload for PUT <id>/submission/
 * Must start with https://, valid domain with TLD, no localhost, no IP, no spaces, no auth, max 500 chars.
 */
export const SubmitSolutionSchema = z.object({
  submission_url: z
    .string()
    .min(1, "Submission URL is required")
    .max(500, "URL must be 500 characters or fewer")
    .regex(/^https:\/\//, "URL must start with https://")
    .refine((url) => !/\s/.test(url), "URL cannot contain spaces")
    .refine((url) => !/\\/.test(url), "URL cannot contain backslashes")
    .refine((url) => !/@/.test(url), "URL cannot contain user credentials")
    .refine((url) => {
      try {
        const parsed = new URL(url);
        const host = parsed.hostname;
        if (
          !host ||
          host === "localhost" ||
          /^(\d{1,3}\.){3}\d{1,3}$/.test(host)
        ) {
          return false;
        }
        return host.includes(".");
      } catch {
        return false;
      }
    }, "Must be a valid URL with a public domain name (no localhost or IP addresses)"),
});
