import { z } from "zod";

const DjangoResponse = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    hasError: z.boolean().optional(),
    statusCode: z.number().optional(),
    message: z.unknown().optional(),
    general_message: z.string().optional(),
    response: dataSchema,
  });

export const CompanyTaskSkillSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string().optional().nullable(),
});

export const CompanyTaskSchema = z.object({
  id: z.string(),
  hashtag: z.string(),
  discord_link: z.string().optional().nullable(),
  title: z.string(),
  description: z.string().optional().nullable().default(""),
  karma: z.coerce.number().default(0),
  channel: z.string().optional().nullable(),
  type: z.string().optional().nullable(),
  active: z.boolean().optional().default(false),
  variable_karma: z.boolean().optional().default(false),
  usage_count: z.coerce.number().default(1),
  level: z.string().optional().nullable(),
  org: z.string().optional().nullable(),
  ig: z.string().optional().nullable(),
  event: z.string().optional().nullable(),
  bonus_karma: z.coerce.number().nullable().optional().default(0),
  bonus_time: z.string().optional().nullable(),
  approval_status: z
    .enum(["pending", "approved", "rejected", "changes_requested"])
    .default("pending"),
  rejection_reason: z.string().optional().nullable(),
  reviewed_at: z.string().optional().nullable(),
  requested_by_name: z.string().optional().nullable(),
  requested_at: z.string().optional().nullable(),
  skills: z.array(CompanyTaskSkillSchema).optional().default([]),
  created_at: z.string().optional().nullable(),
  updated_at: z.string().optional().nullable(),
});

export const CompanyTasksPaginationSchema = z.object({
  page: z.coerce.number().optional().default(1),
  per_page: z.coerce.number().optional().default(10),
  total: z.coerce.number().optional().default(0),
  count: z.coerce.number().optional(),
  total_pages: z.coerce.number().optional(),
  current_page: z.coerce.number().optional(),
  next: z.string().nullable().optional(),
  previous: z.string().nullable().optional(),
});

export const CompanyTasksDataSchema = z.object({
  data: z.array(CompanyTaskSchema).optional().default([]),
  pagination: CompanyTasksPaginationSchema.default({
    page: 1,
    per_page: 10,
    total: 0,
  }),
});

export const CompanyTasksResponseSchema = z.union([
  DjangoResponse(CompanyTasksDataSchema),
  CompanyTasksDataSchema,
  z.object({
    response: CompanyTasksDataSchema,
  }),
]);

export const GenericResponseSchema = z
  .object({
    hasError: z.boolean().optional(),
    statusCode: z.number().optional(),
    message: z.unknown().optional(),
    general_message: z.string().optional(),
    response: z.unknown().optional(),
  })
  .passthrough();

export const CompanyTaskDetailResponseSchema = z.union([
  DjangoResponse(CompanyTaskSchema),
  z.object({
    response: CompanyTaskSchema,
  }),
  CompanyTaskSchema,
]);

export const TaskTemplateSchema = z
  .object({
    id: z.string(),
    title: z.string(),
    description: z.string().optional().nullable().default(""),
    hashtag_prefix: z.string().optional().nullable(),
    karma: z.coerce.number().default(0),
    type_id: z.string().optional().nullable(),
    type_title: z.string().optional().nullable(),
  })
  .passthrough();

export const TaskTemplatesListResponseSchema = z.union([
  DjangoResponse(
    z.object({
      data: z.array(TaskTemplateSchema),
    }),
  ),
  DjangoResponse(z.array(TaskTemplateSchema)),
  z.object({
    response: z.object({
      data: z.array(TaskTemplateSchema),
    }),
  }),
  z.object({
    data: z.array(TaskTemplateSchema),
  }),
  z.array(TaskTemplateSchema),
]);

export const TaskTemplateDetailResponseSchema = z.union([
  DjangoResponse(TaskTemplateSchema),
  DjangoResponse(z.object({ id: z.string() }).passthrough()),
  DjangoResponse(z.object({}).passthrough()),
]);
