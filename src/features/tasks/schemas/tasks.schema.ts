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
  type: z.string().nullable().optional(),
  level: z.string().nullable().optional(),
  ig: z.string().nullable().optional(),
  org: z.string().nullable().optional(),
  discord_link: z.string().nullable().optional(),
  event: z.string().nullable().optional(),
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
export const TaskFormSchema = z.object({
  hashtag: z
    .string()
    .min(2, "Too Short!")
    .max(30, "Too Long!")
    .refine((val) => val.startsWith("#"), {
      message: "Hashtag must start with '#'",
    }),
  title: z.string().min(2, "Too Short!").max(50, "Too Long!"),
  karma: z.coerce
    .number()
    .positive("Karma should be a positive value")
    .min(10, "Needs to be at least 2 digits.")
    .max(9999, "Should not exceed 4 digits"),
  usage_count: z.coerce.number().min(1, "Mention the number of uses"),
  active: z.boolean().default(true),
  variable_karma: z.boolean().default(false),
  description: z
    .string()
    .max(100, "Too Long!")
    .min(1, "A description is required"),
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
  skills: ReferenceItem[];
}
