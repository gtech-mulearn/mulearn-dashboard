import { z } from "zod";

const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
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
// ─── Department item ──────────────────────────────────────────────────────────

export const DepartmentItemSchema = z
  .object({
    id: z.string(),
    title: z.string(),
  })
  .passthrough();

export type DepartmentItem = z.infer<typeof DepartmentItemSchema>;

// ─── List response ────────────────────────────────────────────────────────────

export const DepartmentsListResponseSchema = ApiResponseSchema(
  PaginatedDataSchema(DepartmentItemSchema),
);

// ─── Form / mutation ──────────────────────────────────────────────────────────

export const DepartmentFormSchema = z.object({
  title: z
    .string()
    .min(1, "Department title is required")
    .max(100, "Title must be at most 100 characters"),
});

export type DepartmentFormValues = z.infer<typeof DepartmentFormSchema>;

export const DepartmentMutationResponseSchema = z.any();
