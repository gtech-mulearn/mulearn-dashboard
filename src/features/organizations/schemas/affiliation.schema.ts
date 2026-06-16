import { z } from "zod";

// ─── Shared ───────────────────────────────────────────────────────────────────

const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    hasError: z.boolean(),
    statusCode: z.number(),
    message: z.record(z.string(), z.array(z.string())).optional(),
    response: dataSchema,
  });

const PaginationSchema = z.object({
  count: z.number().optional(),
  totalPages: z.number().optional(),
  isNext: z.boolean().optional(),
  isPrev: z.boolean().optional(),
  nextPage: z.number().nullable().optional(),
});

// ─── Affiliation item ─────────────────────────────────────────────────────────

export const AffiliationItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  organization_count: z.number().optional().default(0),
  created_by: z.string().nullable().optional().default(""),
  updated_by: z.string().nullable().optional().default(""),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
});

export const AffiliationListDataSchema = z.object({
  data: z.array(AffiliationItemSchema),
  pagination: PaginationSchema,
});

export const AffiliationListResponseSchema = ApiResponseSchema(
  AffiliationListDataSchema,
);

// ─── Form validation ──────────────────────────────────────────────────────────

export const AffiliationFormSchema = z.object({
  title: z.string().trim().min(1, "Affiliation name is required"),
});

// ─── Inferred types ───────────────────────────────────────────────────────────

export type AffiliationItem = z.infer<typeof AffiliationItemSchema>;
export type AffiliationListData = z.infer<typeof AffiliationListDataSchema>;
export type AffiliationFormValues = z.infer<typeof AffiliationFormSchema>;
