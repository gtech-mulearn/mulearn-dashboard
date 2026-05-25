import { z } from "zod";

export const OPPORTUNITY_TYPES = ["CHALLENGE", "INTERNSHIP"] as const;
export const OPPORTUNITY_STATUSES = [
  "DRAFT",
  "PUBLISHED",
  "CLOSED",
  "ARCHIVED",
] as const;

export const OpportunitySchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable().optional(),
  ig_id: z.string().nullable().optional(),
  ig_name: z.string().nullable().optional(),
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

export const OpportunityListResponseSchema = z.object({
  statusCode: z.number().optional(),
  response: z.object({
    data: z.array(OpportunitySchema),
    pagination: z
      .object({
        totalPages: z.coerce.number().default(1),
        currentPage: z.coerce.number().default(1),
      })
      .optional(),
  }),
});

export const SingleOpportunityResponseSchema = z.object({
  statusCode: z.number().optional(),
  response: z.object({ opportunity: OpportunitySchema }),
});

export const OpportunityFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  type: z.enum(OPPORTUNITY_TYPES),
  ig_id: z.string().min(1, "Select an Interest Group"),
  status: z.enum(OPPORTUNITY_STATUSES),
  eligibility: z.string().optional(),
  application_url: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
  starts_at: z.string().optional(),
  ends_at: z.string().optional(),
});
export type OpportunityFormValues = z.infer<typeof OpportunityFormSchema>;

export const GenericResponseSchema = z.object({
  statusCode: z.number().optional(),
  response: z.unknown(),
});
