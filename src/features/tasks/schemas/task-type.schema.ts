import { z } from "zod";

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z
    .object({
      hasError: z.boolean().optional(),
      statusCode: z.number().optional(),
      message: z.unknown().optional(),
      data: dataSchema.optional(),
      response: dataSchema.optional(),
      pagination: z.unknown().optional(),
    })
    .passthrough();

export const PaginatedDataSchema = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    data: z.array(schema).default([]),
    pagination: z
      .object({
        count: z.number().default(0),
        totalPages: z.number().default(1),
        isNext: z.boolean().default(false),
        isPrev: z.boolean().default(false),
        nextPage: z.number().nullable().optional(),
      })
      .default({
        count: 0,
        totalPages: 1,
        isNext: false,
        isPrev: false,
      }),
  });

export const TaskTypeItemSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  created_by: z.string(),
  created_at: z.string(),
  updated_by: z.string(),
  updated_at: z.string(),
});

export type TaskTypeData = z.infer<typeof TaskTypeItemSchema>;

export const MutationResponseSchema = z.any();

export const CreateTaskTypeSchema = z.object({
  title: z.string().min(1, "Title is required"),
});

export type CreateTaskTypeInput = z.infer<typeof CreateTaskTypeSchema>;

export const UpdateTaskTypeSchema = CreateTaskTypeSchema;

export type UpdateTaskTypeInput = z.infer<typeof UpdateTaskTypeSchema>;

export const TaskTypeListResponseSchema = ApiResponseSchema(
  PaginatedDataSchema(TaskTypeItemSchema),
);
