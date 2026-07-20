import { z } from "zod";

export const TASK_REQUEST_STATUSES = [
  "PENDING",
  "APPROVED",
  "REJECTED",
] as const;

// Matches backend MentorTaskRequestSerializer
export const TaskRequestSchema = z.object({
  id: z.string(),
  mentor_name: z.string().optional().default(""),
  ig_id: z.string().nullable().optional(),
  ig_name: z.string().nullable().optional(),
  title: z.string(),
  hashtag: z.string().optional().default(""),
  karma: z.coerce.number().default(0),
  description: z.string().nullable().optional(),
  status: z.enum(TASK_REQUEST_STATUSES).default("PENDING"),
  admin_note: z.string().nullable().optional(),
  reviewed_by_name: z.string().nullable().optional(),
  reviewed_at: z.string().nullable().optional(),
  created_task_id: z.string().nullable().optional(),
  created_task_title: z.string().nullable().optional(),
  created_at: z.string(),
});
export type TaskRequest = z.infer<typeof TaskRequestSchema>;

export const TaskRequestListResponseSchema = z.object({
  statusCode: z.number().optional(),
  response: z.object({
    data: z.array(TaskRequestSchema),
    pagination: z
      .object({
        count: z.number().optional(),
        totalPages: z.coerce.number().default(1),
        isNext: z.boolean().optional(),
        isPrev: z.boolean().optional(),
        nextPage: z.number().nullable().optional(),
      })
      .optional(),
  }),
});

export const SingleTaskRequestResponseSchema = z.object({
  statusCode: z.number().optional(),
  response: z.object({ task_request: TaskRequestSchema }),
});

// Matches backend MentorTaskRequestCreateSerializer fields: ig, title, hashtag, karma, description
export const TaskRequestFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  hashtag: z.string().min(1, "Hashtag is required"),
  ig_id: z.string().min(1, "Select an Interest Group"),
  karma: z.coerce
    .number()
    .int("Karma Points must be a whole number")
    .positive("Karma Points must be a positive number")
    .max(
      9999,
      "Karma Points cannot exceed the maximum allowed value of 9,999.",
    ),
  description: z.string().optional(),
});
export type TaskRequestFormValues = z.infer<typeof TaskRequestFormSchema>;

// Admin review body: { status: "APPROVED" | "REJECTED", admin_note }
export const ReviewTaskRequestSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  admin_note: z.string().optional(),
});
export type ReviewTaskRequestValues = z.infer<typeof ReviewTaskRequestSchema>;

export const GenericResponseSchema = z.object({
  statusCode: z.number().optional(),
  response: z.unknown(),
});
