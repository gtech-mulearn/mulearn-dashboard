/**
 * Company Jobs — Zod Schemas
 *
 * 📍 src/features/company-jobs/schemas/jobs.schema.ts
 *
 * Zod schemas for API response validation AND form validation.
 * Imports only from types layer.
 */

import { z } from "zod";

// ─── Entity Schemas (API response validation) ───────────────

export const JobRuleSchema = z.object({
  id: z.string(),
  rule_type: z.string(),
  rule_type_id: z.string(),
  rule_name: z.string(),
});

export const JobSchema = z.object({
  id: z.string(),
  title: z.string(),
  experience: z.string().optional().nullable(),
  job_description: z.string().optional().nullable(),
  job_type: z.string(),
  location: z.string(),
  salary_range: z.string(),
  min_karma: z.number(),
  min_level: z.number(),
  status: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  rules: z.array(JobRuleSchema).default([]),
});

export const PaginationSchema = z.object({
  count: z.number(),
  totalPages: z.number(),
  isNext: z.boolean(),
  isPrev: z.boolean(),
  nextPage: z.number().nullable(),
});

// ─── API Response Wrapper ───────────────────────────────────

const DjangoResponse = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    hasError: z.boolean().optional(),
    statusCode: z.number().optional(),
    message: z.any().optional(),
    response: dataSchema,
  });

// ─── Jobs List Response ─────────────────────────────────────

export const JobsListDataSchema = z.object({
  company_id: z.string(),
  company_name: z.string(),
  jobs: z.array(JobSchema),
  pagination: PaginationSchema,
});

export const JobsListResponseSchema = DjangoResponse(JobsListDataSchema);

// ─── Job Detail Response ────────────────────────────────────

export const JobDetailDataSchema = z.object({
  job: JobSchema,
});

export const JobDetailResponseSchema = DjangoResponse(JobDetailDataSchema);

// ─── Mutation Response Schemas ──────────────────────────────

export const CreateJobResponseSchema = DjangoResponse(
  z.object({
    job: z.object({
      id: z.string(),
      company_id: z.string(),
      title: z.string(),
      job_type: z.string(),
      created_at: z.string(),
    }),
  }),
);

export const UpdateJobResponseSchema = DjangoResponse(
  z.object({
    job_id: z.string(),
    updated_fields: z.array(z.string()),
  }),
);

export const DeleteJobResponseSchema = DjangoResponse(
  z.object({
    job_id: z.string(),
    deleted_at: z.string(),
  }),
);

export const CreateRuleResponseSchema = DjangoResponse(
  z.object({
    job_rule: z.object({
      id: z.string(),
      job_id: z.string(),
      rule_type: z.string(),
      rule_type_id: z.string(),
      created_at: z.string(),
    }),
  }),
);

export const UpdateRuleResponseSchema = DjangoResponse(
  z.object({
    rule_id: z.string(),
    updated_value: z.string(),
  }),
);

export const DeleteRuleResponseSchema = DjangoResponse(
  z.object({
    rule_id: z.string(),
    job_id: z.string(),
    deleted_at: z.string(),
  }),
);

export const GenericResponseSchema = DjangoResponse(z.unknown());

// ─── Company Profile Response ───────────────────────────────

export const CompanyProfileSchema = z.object({
  id: z.string(),
  company_user_id: z.string().optional(),
  name: z.string(),
  logo: z.string().nullable().optional(),
  description: z.string().optional().nullable(),
  industry_sector: z.string().optional().nullable(),
  website_link: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  slug: z.string(),
  status: z.string(),
  location: z.string().optional().nullable(),
  legal_name: z.string().optional().nullable(),
  registration_number: z.string().optional().nullable(),
  tax_id: z.string().optional().nullable(),
  company_size: z.string().optional().nullable(),
  linkedin_url: z.string().optional().nullable(),
  verification_document_url: z.string().optional().nullable(),
  verification_requested_at: z.string().optional().nullable(),
  verified_at: z.string().optional().nullable(),
  verified_by: z.string().optional().nullable(),
  rejection_reason: z.string().optional().nullable(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  deleted_at: z.string().optional().nullable(),
});

export const CompanyProfileResponseSchema =
  DjangoResponse(CompanyProfileSchema);

// ─── Form Schemas (per-step validation) ─────────────────────

export const BasicInfoStepSchema = z.object({
  title: z
    .string()
    .min(1, "Job title is required")
    .max(100, "Title must be 100 characters or fewer"),
  job_type: z.string().min(1, "Job type is required"),
  location: z
    .string()
    .min(1, "Location is required")
    .max(100, "Location must be 100 characters or fewer"),
  salary_range: z
    .string()
    .min(1, "Salary range is required")
    .max(50, "Salary range must be 50 characters or fewer"),
});

export const RequirementsStepSchema = z.object({
  experience: z
    .string()
    .min(1, "Experience is required")
    .max(50, "Experience must be 50 characters or fewer"),
  job_description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(5000, "Description must be 5000 characters or fewer"),
  min_karma: z
    .number({ message: "Karma must be a number" })
    .int("Karma must be a whole number")
    .min(0, "Karma must be 0 or more")
    .max(10000, "Karma must be 10000 or fewer"),
  min_level: z
    .number({ message: "Level must be a number" })
    .int("Level must be a whole number")
    .min(1, "Level must be between 1 and 7")
    .max(7, "Level must be between 1 and 7"),
});

/** Combined form schema for create / edit */
export const JobFormSchema = BasicInfoStepSchema.merge(RequirementsStepSchema);

export type JobFormValues = z.infer<typeof JobFormSchema>;
export type BasicInfoStepValues = z.infer<typeof BasicInfoStepSchema>;
export type RequirementsStepValues = z.infer<typeof RequirementsStepSchema>;

// ─── Rule Form Schema ───────────────────────────────────────

export const RuleFormSchema = z.object({
  rule_type: z.string().min(1, "Rule type is required"),
  rule_type_id: z.string().min(1, "Please select a value"),
});

export type RuleFormValues = z.infer<typeof RuleFormSchema>;
