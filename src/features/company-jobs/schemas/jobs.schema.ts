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
  // Advanced options
  karma_reward: z.number().optional().nullable(),
  duration_value: z.number().optional().nullable(),
  duration_unit: z.string().optional().nullable(),
  hourly_rate: z.string().optional().nullable(),
  deliverables: z
    .union([z.array(z.string()), z.string()])
    .optional()
    .nullable(),
  stipend: z.string().optional().nullable(),
  certificate_provided: z.boolean().optional().nullable(),
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

export const PublicJobSchema = z.object({
  id: z.string(),
  title: z.string(),
  job_type: z.string(),
  location: z.string(),
  experience: z.string().optional().nullable(),
  job_description: z.string().optional().nullable(),
  salary_range: z.string().optional().nullable(),
  min_karma: z.number(),
  min_level: z.number(),
  status: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  karma_reward: z.number().optional().nullable(),
  duration_value: z.number().optional().nullable(),
  duration_unit: z.string().optional().nullable(),
  hourly_rate: z.string().optional().nullable(),
  deliverables: z.array(z.string()).optional().nullable(),
  stipend: z.string().optional().nullable(),
  certificate_provided: z.boolean().optional().nullable(),
  rules: z.array(JobRuleSchema).default([]),
});

export const LearnerApplicationSchema = z.object({
  id: z.string(),
  status: z.enum(["applied", "shortlisted", "accepted", "rejected"]),
  cover_note: z.string().optional().nullable(),
  job_title: z.string(),
  job_type: z.string(),
  company_name: z.string(),
  company_id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const LevelSchema = z.object({
  id: z.string(),
  name: z.string(),
  level_order: z.number(),
});

export const JobApplicantSchema = z.object({
  id: z.string(),
  status: z.enum(["applied", "shortlisted", "accepted", "rejected"]),
  cover_note: z.string().optional().nullable(),
  applicant_id: z.string(),
  full_name: z.string(),
  muid: z.string(),
  district: z.string().optional().nullable(),
  karma: z.number(),
  level: LevelSchema,
  reviewed_by_id: z.string().optional().nullable(),
  reviewed_at: z.string().optional().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const LearnerProfileSchema = z.object({
  id: z.string(),
  muid: z.string(),
  full_name: z.string(),
  gender: z.string().optional().nullable(),
  district: z.string().optional().nullable(),
  karma: z.number(),
  level: LevelSchema,
  interest_groups: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
    }),
  ),
  interested_in_work: z.boolean(),
  interested_in_gig_work: z.boolean(),
});

export const PublicJobsResponseSchema = DjangoResponse(
  z.object({
    jobs: z.array(PublicJobSchema),
    pagination: PaginationSchema,
  }),
);

export const LearnerApplicationsResponseSchema = DjangoResponse(
  z.object({
    applications: z.array(LearnerApplicationSchema),
    pagination: PaginationSchema,
  }),
);

export const JobApplicantsResponseSchema = DjangoResponse(
  z.object({
    job_id: z.string(),
    job_title: z.string(),
    applicants: z.array(JobApplicantSchema),
    pagination: PaginationSchema,
  }),
);

export const LearnerDiscoveryResponseSchema = DjangoResponse(
  z.object({
    learners: z.array(LearnerProfileSchema),
    pagination: PaginationSchema,
  }),
);

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

export const ApplyJobResponseSchema = DjangoResponse(
  z.object({
    application_id: z.string(),
    job_id: z.string(),
    job_title: z.string(),
    status: z.string(),
    applied_at: z.string(),
  }),
);

export const UpdateApplicantStatusResponseSchema = DjangoResponse(
  z.object({
    application_id: z.string(),
    applicant_id: z.string(),
    new_status: z.string(),
    reviewed_by: z.string(),
    reviewed_at: z.string(),
  }),
);

export const GenericResponseSchema = DjangoResponse(z.unknown());

// ─── Company Profile Response ───────────────────────────────

export const CompanyTestimonialSchema = z.object({
  learner_name: z.string(),
  role: z.string(),
  quote: z.string(),
});

export const CompanyGalleryItemSchema = z.object({
  image_url: z.string(),
  caption: z.string().optional(),
  sort_order: z.number().optional(),
});

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
  // Extended fields (new in backend — optional for backwards compat)
  founded_year: z.number().nullable().optional(),
  remote_policy: z.string().nullable().optional(),
  culture_text: z.string().nullable().optional(),
  tech_stack: z
    .array(z.string())
    .nullish()
    .transform((v) => v ?? []),
  perks: z
    .array(z.string())
    .nullish()
    .transform((v) => v ?? []),
  testimonials: z
    .array(CompanyTestimonialSchema)
    .nullish()
    .transform((v) => v ?? []),
  gallery: z
    .array(CompanyGalleryItemSchema)
    .nullish()
    .transform((v) => v ?? []),
  hire_count: z.number().optional().default(0),
  alumni_count: z.number().optional().default(0),
  avg_karma_of_hires: z.number().optional().default(0),
  campus_events_count: z.number().optional().default(0),
});

export const CompanyProfileResponseSchema =
  DjangoResponse(CompanyProfileSchema);

// Public company profile response (no auth — same CompanyProfile shape, now with extended fields)
export const PublicCompanyProfileResponseSchema =
  DjangoResponse(CompanyProfileSchema);

// Public jobs by slug
export const PublicJobBySlugSchema = z.object({
  id: z.string(),
  title: z.string(),
  job_type: z.string().optional(),
  location: z.string().optional(),
  salary_range: z.string(),
  created_at: z.string(),
  is_active: z.boolean().optional(),
  min_karma: z.number().optional(),
  min_level: z.number().optional(),
  tags: z.array(z.string()).optional().default([]),
});
export type PublicJobBySlug = z.infer<typeof PublicJobBySlugSchema>;

export const PublicJobsPaginationSchema = z.object({
  count: z.number(),
  totalPages: z.number(),
  isFirst: z.boolean(),
  isLast: z.boolean(),
});

export const PublicJobsBySlugDataSchema = z.object({
  company: z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
  }),
  jobs: z.array(PublicJobBySlugSchema),
  pagination: PublicJobsPaginationSchema,
});
export type PublicJobsBySlugData = z.infer<typeof PublicJobsBySlugDataSchema>;

export const PublicJobsBySlugResponseSchema = DjangoResponse(
  PublicJobsBySlugDataSchema,
);

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
  // Advanced options — all optional
  karma_reward: z
    .number()
    .int("Must be a whole number")
    .min(0, "Must be 0 or more")
    .max(10000, "Must be 10000 or fewer")
    .optional(),
  duration_value: z
    .number()
    .int("Must be a whole number")
    .min(1, "Must be at least 1")
    .max(365, "Must be 365 or fewer")
    .optional(),
  duration_unit: z.string().optional(),
  hourly_rate: z.string().max(50, "Must be 50 characters or fewer").optional(),
  deliverables: z.array(z.string().min(1)).optional(),
  stipend: z.string().max(50, "Must be 50 characters or fewer").optional(),
  certificate_provided: z.boolean().optional(),
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

// ─── MuLearner Directory Schema ─────────────────────────────

export const MuLearnerSchema = z.object({
  id: z.string(),
  full_name: z.string(),
  muid: z.string(),
  email: z.string(),
  karma: z.coerce.number(),
  level: z.coerce.number(),
  college: z.string().nullable().optional(),
  department: z.string().nullable().optional(),
  graduation_year: z.coerce.number().nullable().optional(),
});

export const MuLearnersResponseSchema = DjangoResponse(
  z.object({
    data: z.array(MuLearnerSchema),
    pagination: PaginationSchema,
  }),
);

// ─── Gig Analytics Schema ────────────────────────────────────

export const GigAnalyticsFunnelSchema = z.object({
  Total: z.coerce.number().default(0),
  Pending: z.coerce.number().default(0),
  "In-Review": z.coerce.number().default(0),
  Shortlisted: z.coerce.number().default(0),
  Interview: z.coerce.number().default(0),
  Selected: z.coerce.number().default(0),
  Rejected: z.coerce.number().default(0),
});

export const GigAnalyticsSchema = z.object({
  total_gigs_posted: z.coerce.number().default(0),
  active_gigs: z.coerce.number().default(0),
  closed_gigs: z.coerce.number().default(0),
  average_hourly_rate: z.coerce.number().default(0),
  application_funnel: GigAnalyticsFunnelSchema,
  conversion_rate: z.string().default("0%"),
});

export const GigAnalyticsResponseSchema = DjangoResponse(GigAnalyticsSchema);
