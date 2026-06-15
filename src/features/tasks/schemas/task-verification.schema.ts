import { z } from "zod";
import { ApiResponseSchema } from "@/lib/schemas/api-response";

export const TASK_APPROVAL_STATUSES = [
  "pending",
  "approved",
  "rejected",
] as const;
export type TaskApprovalStatus = (typeof TASK_APPROVAL_STATUSES)[number];

export const TaskVerificationItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  hashtag: z.string(),
  description: z.string().nullable().optional(),
  karma: z.coerce.number().default(0),
  approval_status: z.enum(TASK_APPROVAL_STATUSES).default("pending"),
  ig: z
    .object({
      id: z.string(),
      name: z.string(),
    })
    .nullable()
    .optional(),
  type: z
    .object({
      id: z.string(),
      title: z.string(),
    })
    .nullable()
    .optional(),
  company_name: z.string().nullable().optional(),
  requested_by: z
    .object({
      id: z.string(),
      full_name: z.string(),
    })
    .nullable()
    .optional(),
  requested_at: z.string().nullable().optional(),
  created_at: z.string().nullable().optional(),
});

export type TaskVerificationItem = z.infer<typeof TaskVerificationItemSchema>;

export const TaskVerificationListResponseSchema = ApiResponseSchema(
  z.object({
    tasks: z.array(TaskVerificationItemSchema),
    pagination: z.object({
      count: z.number().optional(),
      totalPages: z.coerce.number().default(1),
      isNext: z.boolean().optional(),
      isPrev: z.boolean().optional(),
      nextPage: z.number().nullable().optional(),
    }),
  }),
);

export const ReviewActionSchema = z.object({
  action: z.enum(["approve", "reject"]),
  reason: z.string().optional(),
});

export type ReviewActionValues = z.infer<typeof ReviewActionSchema>;
