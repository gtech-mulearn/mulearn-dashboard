import { z } from "zod";
import { ApiResponseSchema, PaginatedDataSchema } from "./task-type.schema";

export const TaskItemSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  hashtag: z.string(),
  title: z.string(),
  karma: z.coerce.number().default(0),
  usage_count: z.coerce.number().default(0),
  active: z.boolean().default(true),
  variable_karma: z.boolean().default(false),
  description: z.string().nullable().optional(),
  channel: z.string().nullable().optional(),
  discord_id: z.string().nullable().optional(),
  type: z.string().nullable().optional(),
  level: z.string().nullable().optional(),
  ig: z.string().nullable().optional(),
  org: z.string().nullable().optional(),
  discord_link: z.string().nullable().optional(),
  event: z.string().nullable().optional(),
  event_id: z.string().nullable().optional(),
  bonus_time: z.string().nullable().optional(),
  bonus_karma: z.coerce.number().default(0),
  skill_ids: z.array(z.string()).nullable().optional().default([]),
  created_by: z.string().nullable().optional(),
  updated_by: z.string().nullable().optional(),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
});

export type Task = z.infer<typeof TaskItemSchema>;

export const TaskListResponseSchema = ApiResponseSchema(
  PaginatedDataSchema(TaskItemSchema),
);

// Form / Creation Input Schema
export const TaskFormSchema = z
  .object({
    hashtag: z
      .string()
      .max(75, "Max 75 characters")
      .refine((val) => val.startsWith("#"), {
        message: "Hashtag must start with '#'",
      })
      .refine((val) => val.replace(/^#/, "").trim().length > 0, {
        message: "Hashtag is required",
      }),
    // 75 is the task_list.title column width, not a UX choice
    title: z.string().min(1, "Title is required").max(75, "Max 75 characters"),
    karma: z.coerce
      .number()
      .int("Karma Points must be a whole number")
      .positive("Karma Points must be a positive number")
      .min(10, "Karma Points must be at least 10")
      .max(
        9999,
        "Karma Points cannot exceed the maximum allowed value of 9,999.",
      ),
    usage_count: z.coerce.number().min(1, "Mention the number of uses"),
    active: z.boolean().default(true),
    variable_karma: z.boolean().default(false),
    description: z.string().min(1, "A description is required"),
    channel_id: z.string().min(1, "Select a Channel"),
    type_id: z.string().min(1, "Select a Type"),
    level_id: z.string().nullable().optional(),
    ig_id: z.string().nullable().optional(),
    organization_id: z.string().nullable().optional(),
    discord_link: z
      .string()
      .url("Invalid URL")
      .or(z.string().length(0))
      .nullable()
      .optional(),
    event: z.string().nullable().optional(),
    bonus_time: z.string().nullable().optional(),
    bonus_karma: z.coerce.number().default(0),
    skill_ids: z.array(z.string()).default([]),
  })
  .superRefine((data, ctx) => {
    if (data.event && !data.hashtag.startsWith("#evn")) {
      ctx.addIssue({
        code: "custom",
        path: ["hashtag"],
        message: "Hashtag must start with '#evn' when an event is selected",
      });
    }
  });

export type TaskFormValues = z.infer<typeof TaskFormSchema>;

export const TaskCreateRequestSchema = z.object({
  hashtag: z.string(),
  title: z.string(),
  karma: z.number(),
  usage_count: z.number(),
  active: z.boolean(),
  variable_karma: z.boolean(),
  description: z.string().nullable(),
  channel: z.string(),
  type: z.string(),
  level: z.string().nullable(),
  ig: z.string().nullable(),
  org: z.string().nullable(),
  discord_link: z.string().nullable(),
  event: z.string().nullable(),
  bonus_time: z.string().nullable(),
  bonus_karma: z.number(),
  skill_ids: z.array(z.string()),
});

export type TaskCreateRequest = z.infer<typeof TaskCreateRequestSchema>;

export interface ReferenceItem {
  id: string;
  name?: string;
  title?: string;
}

export interface TaskReferenceData {
  levels: ReferenceItem[];
  igs: ReferenceItem[];
  organizations: ReferenceItem[];
  channels: ReferenceItem[];
  types: ReferenceItem[];
  events: ReferenceItem[];
  skills: ReferenceItem[];
}

export const TasksResponseSchema = ApiResponseSchema(
  PaginatedDataSchema(TaskItemSchema),
);

const TaskPayloadSchema = z.union([
  TaskItemSchema,
  z.object({ task: TaskItemSchema }).passthrough(),
  z.object({ data: TaskItemSchema }).passthrough(),
]);

const TaskResponseDataSchema = z.preprocess((value) => {
  const parsedPayload = TaskPayloadSchema.safeParse(value);
  if (!parsedPayload.success) return value;

  const parsedTask = TaskItemSchema.safeParse(parsedPayload.data);
  if (parsedTask.success) return parsedTask.data;

  const payload = parsedPayload.data as { task?: unknown; data?: unknown };
  const task = payload.task ?? payload.data;
  const parsedNestedTask = TaskItemSchema.safeParse(task);
  return parsedNestedTask.success ? parsedNestedTask.data : value;
}, TaskItemSchema);

export const SingleTaskResponseSchema = ApiResponseSchema(
  TaskResponseDataSchema,
);
export const TaskMutationResponseSchema = ApiResponseSchema(z.unknown());
export const DropdownResponseSchema = ApiResponseSchema(
  z.array(
    z.union([
      z.string(),
      z
        .object({
          id: z.string(),
          name: z.string().optional(),
          title: z.string().optional(),
        })
        .passthrough(),
    ]),
  ),
);
