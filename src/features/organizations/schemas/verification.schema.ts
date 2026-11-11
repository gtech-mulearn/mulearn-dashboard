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
  created_by_muid: z.string().nullable().optional(),
  created_by_email: z.string().nullable().optional(),
  created_at: z.string(),
});

export type UnverifiedOrgItem = z.infer<typeof UnverifiedOrgItemSchema>;

// ─── Pagination shape returned by Django ───────────────────────────────────────

export const PaginationSchema = z.object({
  count: z.number(),
  totalPages: z.number(),
  isNext: z.boolean(),
  isPrev: z.boolean(),
  nextPage: z.number().nullable(),
});

export type Pagination = z.infer<typeof PaginationSchema>;

// ─── List response (paginated envelope) ────────────────────────────────────────

export const UnverifiedOrgListResponseSchema = z.object({
  hasError: z.boolean().optional(),
  statusCode: z.number().optional(),
  message: z.unknown().optional(),
  response: z.object({
    data: z.array(UnverifiedOrgItemSchema),
    pagination: PaginationSchema,
  }),
});

export type UnverifiedOrgListData = {
  data: UnverifiedOrgItem[];
  pagination: Pagination;
};

// ─── Verify form ──────────────────────────────────────────────────────────────

// Only an approval maps the request onto an Organization; a rejection has
// nothing to map to (OrganizationVerifySerializer.validate).
export const VerifyOrgFormSchema = z
  .object({
    verified: z.boolean(),
    org_id: z.string().min(1).optional(),
  })
  .refine((v) => !v.verified || Boolean(v.org_id), {
    message: "Organization ID is required",
    path: ["org_id"],
  });

export type VerifyOrgFormValues = z.infer<typeof VerifyOrgFormSchema>;

/** Body for POST organisation/verify/<id>/. A rejection never carries an org. */
export function toVerifyOrgPayload(
  action: "approve" | "reject",
  orgId: string,
): VerifyOrgFormValues {
  return action === "approve"
    ? { verified: true, org_id: orgId.trim() }
    : { verified: false };
}

export const VerificationMutationResponseSchema = z.unknown();
