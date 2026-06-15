import { z } from "zod";

// ─── Org types ────────────────────────────────────────────────────────────────

export const OrgTypeSchema = z.enum([
  "College",
  "Company",
  "Community",
  "School",
]);

// ─── Unverified org item ──────────────────────────────────────────────────────

export const UnverifiedOrgItemSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  org_type: OrgTypeSchema,
  graduation_year: z.number().nullable().optional(),
  department: z.string().nullable().optional(),
  created_by: z.string(),
  created_at: z.string(),
});

export type UnverifiedOrgItem = z.infer<typeof UnverifiedOrgItemSchema>;

// ─── List response (flat array — no pagination) ───────────────────────────────

export const UnverifiedOrgListResponseSchema = z
  .object({
    hasError: z.boolean().optional(),
    statusCode: z.number().optional(),
    message: z.unknown().optional(),
    response: z.array(UnverifiedOrgItemSchema).optional(),
    data: z.array(UnverifiedOrgItemSchema).optional(),
  })
  .passthrough();

// ─── Verify form ──────────────────────────────────────────────────────────────

export const VerifyOrgFormSchema = z.object({
  verified: z.boolean(),
  org_id: z.string().min(1, "Organization ID is required"),
});

export type VerifyOrgFormValues = z.infer<typeof VerifyOrgFormSchema>;

export const VerificationMutationResponseSchema = z.any();
