import { z } from "zod";
import { ApiResponseSchema } from "@/lib/schemas/api-response";

// ─── Shared pagination ────────────────────────────────────────────────────────
export const PaginationSchema = z.object({
  count: z.number().optional(),
  totalPages: z.coerce.number().default(1),
  isNext: z.boolean().optional(),
  isPrev: z.boolean().optional(),
  nextPage: z.number().nullable().optional(),
});

// ─── #1 tasks/ig-dropdown/ ───────────────────────────────────────────────────
// Response: array of { id, name }
export const TaskIgSchema = z.object({
  id: z.string(),
  name: z.string(),
});
export type TaskIg = z.infer<typeof TaskIgSchema>;

export const TaskIgDropdownResponseSchema = ApiResponseSchema(
  z.array(TaskIgSchema),
);

// ─── task/list-task-type/ — task type dropdown ────────────────────────────────
export const TaskTypeSchema = z.object({
  id: z.string(),
  title: z.string(),
});
export type TaskType = z.infer<typeof TaskTypeSchema>;

// ─── task/level/ — task level dropdown ────────────────────────────────────────
// Response: { response: [{ id, name }] } — array directly in response field
export const TaskLevelSchema = z.object({
  id: z.string(),
  name: z.string(),
});
export type TaskLevel = z.infer<typeof TaskLevelSchema>;

export const TaskLevelListResponseSchema = ApiResponseSchema(
  z.array(TaskLevelSchema),
);

export const TaskTypeListResponseSchema = ApiResponseSchema(
  z.object({
    data: z.array(TaskTypeSchema),
    pagination: z
      .object({
        count: z.number().optional(),
        totalPages: z.coerce.number().default(1),
        isNext: z.boolean().optional(),
        isPrev: z.boolean().optional(),
      })
      .optional(),
  }),
);

// ─── #2 / #3 tasks/ and tasks/<id>/ — Skill sub-object ───────────────────────
export const TaskSkillSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string().optional(),
});
export type TaskSkill = z.infer<typeof TaskSkillSchema>;

// ─── Approval statuses ────────────────────────────────────────────────────────
export const TASK_APPROVAL_STATUSES = [
  "pending",
  "approved",
  "rejected",
] as const;
export type TaskApprovalStatus = (typeof TASK_APPROVAL_STATUSES)[number];

// ─── MentorTask — matches doc response shape (GET tasks/ data[] item) ─────────
export const MentorTaskSchema = z.object({
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
  approval_status: z.enum(TASK_APPROVAL_STATUSES).default("pending"),
  rejection_reason: z.string().nullable().optional(),
  reviewed_at: z.string().nullable().optional(),
  requested_by_name: z.string().nullable().optional(),
  requested_at: z.string().nullable().optional(),
  skills: z.array(TaskSkillSchema).optional().default([]),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});
export type MentorTask = z.infer<typeof MentorTaskSchema>;

// ─── Response schemas for task list and single task ───────────────────────────
export const MentorTaskListResponseSchema = ApiResponseSchema(
  z.object({
    data: z.array(MentorTaskSchema),
    pagination: PaginationSchema,
  }),
);

// POST/GET single — response is {} on create, so we use z.unknown() for the detail
export const MentorTaskCreateResponseSchema = ApiResponseSchema(z.unknown());
export const MentorTaskDetailResponseSchema =
  ApiResponseSchema(MentorTaskSchema);
export const MentorTaskGenericResponseSchema = ApiResponseSchema(z.unknown());

// ─── Task create form schema — POST tasks/ ────────────────────────────────────
export const MentorTaskFormSchema = z.object({
  hashtag: z.string().min(1, "Hashtag is required"),
  title: z.string().min(1, "Title is required").max(75, "Max 75 characters"),
  karma: z.coerce
    .number()
    .int("Karma Points must be a whole number")
    .positive("Karma Points must be a positive number")
    .max(
      9999,
      "Karma Points cannot exceed the maximum allowed value of 9,999.",
    ),
  usage_count: z.coerce.number().int().positive().optional(),
  description: z.string().optional(),
  type: z.string().min(1, "Task type is required"),
  level: z.string().optional(),
  ig: z.string().min(1, "Interest Group is required"),
  skill_ids: z.array(z.string()).optional(),
});
export type MentorTaskFormValues = z.infer<typeof MentorTaskFormSchema>;

// ─── #4 activity/ — activity feed item ───────────────────────────────────────
export const ACTIVITY_TYPES = ["SESSION_CREATED", "TASK_APPRAISED"] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

export const ActivityItemSchema = z.object({
  id: z.string(),
  activity_type: z.enum(ACTIVITY_TYPES),
  title: z.string(),
  description: z.string().nullable().optional(),
  date: z.string(),
  status: z.string(),
});
export type ActivityItem = z.infer<typeof ActivityItemSchema>;

export const ActivityListResponseSchema = ApiResponseSchema(
  z.object({
    data: z.array(ActivityItemSchema),
    pagination: PaginationSchema,
  }),
);

// ─── Admin: pending task list (#5) — task item ────────────────────────────────
export const AdminPendingTaskSchema = z.object({
  id: z.string(),
  title: z.string(),
  hashtag: z.string(),
  description: z.string().nullable().optional(),
  karma: z.coerce.number().default(0),
  approval_status: z.enum(TASK_APPROVAL_STATUSES).default("pending"),
  ig: z.object({ id: z.string(), name: z.string() }).nullable().optional(),
  type: z.object({ id: z.string(), title: z.string() }).nullable().optional(),
  company_name: z.string().nullable().optional(),
  requested_by: z
    .object({ id: z.string(), full_name: z.string() })
    .nullable()
    .optional(),
  requested_at: z.string().nullable().optional(),
  created_at: z.string().optional(),
});
export type AdminPendingTask = z.infer<typeof AdminPendingTaskSchema>;

export const AdminPendingTaskListResponseSchema = ApiResponseSchema(
  z.object({
    tasks: z.array(AdminPendingTaskSchema),
    pagination: PaginationSchema,
  }),
);

// ─── Admin: review task (#6) — request payload ────────────────────────────────
export const AdminTaskReviewSchema = z.object({
  action: z.enum(["approve", "reject"]),
  reason: z.string().optional(),
});
export type AdminTaskReviewValues = z.infer<typeof AdminTaskReviewSchema>;

// ─── Admin: review task — success response ────────────────────────────────────
export const AdminTaskReviewResponseSchema = ApiResponseSchema(
  z.object({
    task_id: z.string(),
    approval_status: z.enum(TASK_APPROVAL_STATUSES),
    active: z.boolean(),
    rejection_reason: z.string().nullable().optional(),
    reviewed_by: z.string().nullable().optional(),
    reviewed_at: z.string().nullable().optional(),
  }),
);
