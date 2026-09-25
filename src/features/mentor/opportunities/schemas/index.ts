import { z } from "zod";

// ─── Constants ────────────────────────────────────────────────────────────────

export const OPPORTUNITY_TYPES = ["CHALLENGE", "INTERNSHIP"] as const;

export const OPPORTUNITY_STATUSES = [
  "DRAFT",
  "PUBLISHED",
  "CLOSED",
  "ARCHIVED",
] as const;

// ─── Opportunity ─────────────────────────────────────────────────────────────

export const OpportunitySchema = z.object({
  id: z.string(),

  title: z.string(),

  description: z.string().nullable().optional(),

  // Interest Group
  ig: z.string().nullable().optional(),
  ig_name: z.string().nullable().optional(),

  // Organization
  org: z.string().nullable().optional(),
  org_name: z.string().nullable().optional(),

  type: z.enum(OPPORTUNITY_TYPES),

  status: z.enum(OPPORTUNITY_STATUSES),

  eligibility: z.string().nullable().optional(),

  application_url: z.string().nullable().optional(),

  starts_at: z.string().nullable().optional(),

  ends_at: z.string().nullable().optional(),

  created_by_name: z.string().nullable().optional(),

  created_at: z.string().optional(),

  updated_at: z.string().optional(),
});

export type Opportunity = z.infer<typeof OpportunitySchema>;

// ─── Pagination ──────────────────────────────────────────────────────────────

export const OpportunityPaginationSchema = z.object({
  page: z.coerce.number().default(1),
  per_page: z.coerce.number().default(10),
  total: z.coerce.number().default(0),
});

// ─── List Response ───────────────────────────────────────────────────────────

export const OpportunityListResponseSchema = z.object({
  statusCode: z.number().optional(),

  response: z.union([
    z.object({
      data: z.array(OpportunitySchema),

      pagination: OpportunityPaginationSchema.optional(),
    }),

    z.array(OpportunitySchema),
  ]),
});

// ─── Single Opportunity Response ─────────────────────────────────────────────

export const SingleOpportunityResponseSchema = z.object({
  statusCode: z.number().optional(),

  response: z.union([
    z.object({
      opportunity: OpportunitySchema,
    }),

    z.object({
      data: OpportunitySchema,
    }),

    OpportunitySchema,
  ]),
});

// ─── Create / Form ───────────────────────────────────────────────────────────

export const OpportunityFormSchema = z
  .object({
    title: z.string().min(1, "Title is required"),

    description: z.string().min(1, "Description is required"),

    type: z.enum(OPPORTUNITY_TYPES),

    // At least one of IG or organization is required by the backend.
    ig_id: z.string().optional(),

    org_id: z.string().optional(),

    // Backend always creates new opportunities as DRAFT.
    // Kept here only if the existing UI uses this field.
    status: z.enum(OPPORTUNITY_STATUSES).optional(),

    eligibility: z.string().optional(),

    application_url: z
      .string()
      .url("Must be a valid URL")
      .optional()
      .or(z.literal("")),

    starts_at: z.string().optional(),

    ends_at: z.string().optional(),
  })
  .refine((data) => Boolean(data.ig_id || data.org_id), {
    message: "Select an Interest Group or Organization",
    path: ["ig_id"],
  });

export type OpportunityFormValues = z.infer<typeof OpportunityFormSchema>;

// ─── Generic Response ─────────────────────────────────────────────────────────

export const GenericResponseSchema = z.object({
  statusCode: z.number().optional(),

  response: z.unknown(),
});
