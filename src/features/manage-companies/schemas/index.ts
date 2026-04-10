import { z } from "zod";

// ─── Shared ───────────────────────────────────────────────────────────────────

const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    hasError: z.boolean(),
    statusCode: z.number(),
    message: z.record(z.string(), z.array(z.string())).optional(),
    response: dataSchema,
  });

export const GenericMutationResponseSchema = ApiResponseSchema(
  z.object({}).passthrough(),
);

export const PaginationSchema = z.object({
  count: z.number().optional(),
  totalPages: z.number().optional(),
  isNext: z.boolean().optional(),
  isPrev: z.boolean().optional(),
  nextPage: z.string().nullable().optional(),
});

// ─── Company Status ───────────────────────────────────────────────────────────

export const CompanyStatusSchema = z.enum([
  "pending_verification",
  "active",
  "rejected",
  "inactive",
]);

// ─── Company Verification Item ────────────────────────────────────────────────

export const CompanyVerificationItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  status: CompanyStatusSchema,
  poc_name: z.string().nullable().optional(),
  poc_email: z.string().nullable().optional(),
  poc_phone: z.string().nullable().optional(),
  website_link: z.string().nullable().optional(),
  industry_sector: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  verification_requested_at: z.string().nullable().optional(),
  verified_at: z.string().nullable().optional(),
  rejection_reason: z.string().nullable().optional(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
});

export const CompanyVerificationListDataSchema = z.object({
  data: z.array(CompanyVerificationItemSchema),
  pagination: PaginationSchema,
});

export const CompanyVerificationListResponseSchema = ApiResponseSchema(
  CompanyVerificationListDataSchema,
);

export const VerificationActionResponseSchema = ApiResponseSchema(
  z.object({
    company_id: z.string(),
    status: z.string(),
    verified_at: z.string().nullable().optional(),
    rejection_reason: z.string().nullable().optional(),
  }),
);

// ─── Form Schemas ─────────────────────────────────────────────────────────────

export const VerificationActionFormSchema = z
  .object({
    action: z.enum(["approve", "reject"]),
    reason: z.string(),
  })
  .refine((data) => data.action !== "reject" || data.reason.trim().length > 0, {
    message: "A reason is required when rejecting a company.",
    path: ["reason"],
  });

// ─── Inferred Types ───────────────────────────────────────────────────────────

export type CompanyStatus = z.infer<typeof CompanyStatusSchema>;
export type CompanyVerificationItem = z.infer<
  typeof CompanyVerificationItemSchema
>;
export type CompanyVerificationListData = z.infer<
  typeof CompanyVerificationListDataSchema
>;
export type VerificationActionFormValues = z.infer<
  typeof VerificationActionFormSchema
>;
