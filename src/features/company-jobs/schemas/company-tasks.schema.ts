/**
 * Company Tasks — Zod Schemas
 *
 * 📍 src/features/company-jobs/schemas/company-tasks.schema.ts
 *
 * Schemas for the company task submission/management endpoints.
 * Base: /api/v1/dashboard/company/tasks/
 *
 * Company tasks are scoped to requested_by = current user.
 * Unlike mentor tasks, company tasks do NOT include ig/channel in the create form.
 */

import { z } from "zod";
import { ApiResponseSchema } from "@/lib/schemas/api-response";

// ─── Shared Pagination ────────────────────────────────────────────────────────

export const CompanyTaskPaginationSchema = z.object({
  count: z.number().optional(),
  totalPages: z.coerce.number().default(1),
  isNext: z.boolean().optional(),
  isPrev: z.boolean().optional(),
  nextPage: z.number().nullable().optional(),
});

// ─── Approval Status ──────────────────────────────────────────────────────────

export const COMPANY_TASK_APPROVAL_STATUSES = [
  "pending",
  "approved",
  "rejected",
] as const;
export type CompanyTaskApprovalStatus =
  (typeof COMPANY_TASK_APPROVAL_STATUSES)[number];

// ─── Skill sub-object ─────────────────────────────────────────────────────────

export const CompanyTaskSkillSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string().optional(),
});
export type CompanyTaskSkill = z.infer<typeof CompanyTaskSkillSchema>;

// ─── CompanyTask — matches GET /tasks/ data[] item ────────────────────────────

export const CompanyTaskSchema = z.object({
  id: z.string(),
  hashtag: z.string(),
  discord_link: z.string().nullable().optional(),
  title: z.string(),
  description: z.string().nullable().optional(),
  karma: z.coerce.number().default(0),
  channel: z.string().nullable().optional(),
  type: z.string().nullable().optional(),
  active: z.boolean().optional(),
  variable_karma: z.boolean().optional(),
  usage_count: z.coerce.number().default(1),
  level: z.string().nullable().optional(),
  org: z.string().nullable().optional(),
  ig: z.string().nullable().optional(),
  event: z.string().nullable().optional(),
  bonus_karma: z.number().nullable().optional(),
  bonus_time: z.string().nullable().optional(),
  approval_status: z.enum(COMPANY_TASK_APPROVAL_STATUSES).default("pending"),
  rejection_reason: z.string().nullable().optional(),
  reviewed_at: z.string().nullable().optional(),
  requested_by_name: z.string().nullable().optional(),
  requested_at: z.string().nullable().optional(),
  skills: z.array(CompanyTaskSkillSchema).optional().default([]),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export type CompanyTask = z.infer<typeof CompanyTaskSchema>;

// ─── Response schemas ─────────────────────────────────────────────────────────

export const CompanyTaskListResponseSchema = ApiResponseSchema(
  z.object({
    data: z.array(CompanyTaskSchema),
    pagination: CompanyTaskPaginationSchema,
  }),
);

export const CompanyTaskDetailResponseSchema =
  ApiResponseSchema(CompanyTaskSchema);

export const CompanyTaskCreateResponseSchema = ApiResponseSchema(z.any());
export const CompanyTaskGenericResponseSchema = ApiResponseSchema(z.any());

// ─── Form schema — POST /tasks/ ───────────────────────────────────────────────
// Note: ig and channel are NOT part of the company task create serializer.

export const CompanyTaskFormSchema = z.object({
  hashtag: z.string().min(1, "Hashtag is required"),
  title: z.string().min(1, "Title is required").max(75, "Max 75 characters"),
  karma: z.coerce.number().int().positive("Karma must be a positive integer"),
  type: z.string().min(1, "Task type is required"),
  description: z.string().optional(),
  usage_count: z.coerce.number().int().positive().optional(),
  level: z.string().optional(),
  skill_ids: z.array(z.string()).optional(),
});
export type CompanyTaskFormValues = z.infer<typeof CompanyTaskFormSchema>;
