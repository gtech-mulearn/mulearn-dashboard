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
  "verified",
  "",
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
  email: z.string().nullable().optional(),
  company_size: z.string().nullable().optional(),
  website_link: z.string().nullable().optional(),
  industry_sector: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  district_name: z.string().nullable().optional(),
  state_name: z.string().nullable().optional(),
  country_name: z.string().nullable().optional(),
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

export const CompanyVerificationListResponseSchema = z.union([
  // Case A: Standard envelope { hasError, statusCode, response: { data, pagination } }
  ApiResponseSchema(CompanyVerificationListDataSchema),

  // Case B: Envelope but response is an array { hasError, statusCode, response: [...] }
  ApiResponseSchema(z.array(CompanyVerificationItemSchema)).transform(
    (val) => ({
      hasError: val.hasError,
      statusCode: val.statusCode,
      message: val.message,
      response: {
        data: val.response,
        pagination: { count: val.response.length, totalPages: 1 },
      },
    }),
  ),

  // Case C: Flat array [...]
  z.array(CompanyVerificationItemSchema).transform((arr) => ({
    hasError: false,
    statusCode: 200,
    response: {
      data: arr,
      pagination: { count: arr.length, totalPages: 1 },
    },
  })),

  // Case D: Envelope with { results, count } inside response
  ApiResponseSchema(
    z
      .object({
        results: z.array(CompanyVerificationItemSchema).optional(),
        count: z.number().optional(),
      })
      .passthrough(),
  ).transform((val) => ({
    hasError: val.hasError,
    statusCode: val.statusCode,
    message: val.message,
    response: {
      data: val.response.results ?? [],
      pagination: {
        count: val.response.count ?? val.response.results?.length ?? 0,
        totalPages: 1,
      },
    },
  })),
]);

export const CompanyDetailsSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    logo: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    short_pitch: z.string().nullable().optional(),
    industry_sector: z.string().nullable().optional(),
    website_link: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    location: z.string().nullable().optional(),
    legal_name: z.string().nullable().optional(),
    registration_number: z.string().nullable().optional(),
    tax_id: z.string().nullable().optional(),
    company_size: z.string().nullable().optional(),
    linkedin_url: z.string().nullable().optional(),
    founded_year: z.number().nullable().optional(),
    remote_policy: z.string().nullable().optional(),
    culture_text: z.string().nullable().optional(),
    tech_stack: z.array(z.string()).nullable().optional(),
    perks: z.array(z.string()).nullable().optional(),
    testimonials: z.array(z.any()).nullable().optional(),
    gallery: z.array(z.string()).nullable().optional(),
    status: z.string(),
    rejection_reason: z.string().nullable().optional(),
    company_user_id: z.string().nullable().optional(),
    company_user_name: z.string().nullable().optional(),
    company_user_email: z.string().nullable().optional(),
    district_name: z.string().nullable().optional(),
    verification_requested_at: z.string().nullable().optional(),
    verified_at: z.string().nullable().optional(),
    verified_by: z.string().nullable().optional(),
    created_at: z.string().nullable().optional(),
    updated_at: z.string().nullable().optional(),
  })
  .passthrough();

export const CompanyDetailsResponseSchema =
  ApiResponseSchema(CompanyDetailsSchema);

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
export type CompanyDetails = z.infer<typeof CompanyDetailsSchema>;
export type VerificationActionFormValues = z.infer<
  typeof VerificationActionFormSchema
>;
