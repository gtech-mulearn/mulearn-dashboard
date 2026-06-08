import { z } from "zod";
const DjangoResponse = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    hasError: z.boolean().optional(),
    statusCode: z.number().optional(),
    message: z.any().optional(),
    response: dataSchema,
  });

export const CompanyTaskSkillSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
});

export const CompanyTaskSchema = z.object({
  id: z.string(),
  hashtag: z.string(),
  discord_link: z.string().optional().nullable(),
  title: z.string(),
  description: z.string(),
  karma: z.number(),
  channel: z.string().optional().nullable(),
  type: z.string(),
  active: z.boolean(),
  variable_karma: z.boolean(),
  usage_count: z.number(),
  level: z.string().optional().nullable(),
  org: z.string().optional().nullable(),
  ig: z.string().optional().nullable(),
  event: z.string().optional().nullable(),
  bonus_karma: z.number().optional().default(0),
  bonus_time: z.string().optional().nullable(),
  approval_status: z.enum(["pending", "approved", "rejected"]),
  rejection_reason: z.string().optional().nullable(),
  reviewed_at: z.string().optional().nullable(),
  requested_by_name: z.string(),
  requested_at: z.string(),
  skills: z.array(CompanyTaskSkillSchema).optional().default([]),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CompanyTasksPaginationSchema = z.object({
  count: z.number(),
  total_pages: z.number(),
  current_page: z.number(),
  per_page: z.number(),
  next: z.string().nullable().optional(),
  previous: z.string().nullable().optional(),
});

export const CompanyTasksResponseSchema = DjangoResponse(
  z.object({
    data: z.array(CompanyTaskSchema).optional().default([]),
    pagination: CompanyTasksPaginationSchema,
  }),
);

export const GenericResponseSchema = DjangoResponse(z.unknown());

export const CompanyTaskDetailResponseSchema =
  DjangoResponse(CompanyTaskSchema);
