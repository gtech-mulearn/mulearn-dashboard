import { z } from "zod";

// ─── Shared ──────────────────────────────────────────────────────────────────

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    hasError: z.boolean(),
    statusCode: z.number(),
    message: z.record(z.string(), z.array(z.string())).optional(),
    response: dataSchema,
  });

export const GenericMutationResponseSchema = ApiResponseSchema(
  z.object({}).passthrough(),
);

export const PaginationSchema = z.object({
  count: z.number().optional(),
  totalPages: z.number().optional(),
  isNext: z.boolean().optional(),
  isPrev: z.boolean().optional(),
});

// ─── Role ────────────────────────────────────────────────────────────────────

export const RoleSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable().optional().default(""),
  updated_by: z.string().nullable().optional().default(""),
  created_by: z.string().nullable().optional().default(""),
  members: z.number().default(0),
  created_at: z.string().nullable().optional(),
  updated_at: z.string().nullable().optional(),
});

export const RoleListDataSchema = z.object({
  data: z.array(RoleSchema),
  pagination: PaginationSchema,
});

export const RoleListResponseSchema = ApiResponseSchema(RoleListDataSchema);

// ─── Role User ────────────────────────────────────────────────────────────────

export const RoleUserSchema = z.object({
  id: z.string(),
  muid: z.string().nullable().optional().default(""),
  full_name: z.string().nullable().optional().default(""),
});

export const RoleUserListResponseSchema = ApiResponseSchema(
  z.array(RoleUserSchema),
);

// Some endpoints return a paginated wrapper instead of a plain array
export const RoleUserPaginatedDataSchema = z.object({
  data: z.array(RoleUserSchema),
  pagination: PaginationSchema.optional(),
});

export const RoleUserFlexibleResponseSchema = ApiResponseSchema(
  z.union([z.array(RoleUserSchema), RoleUserPaginatedDataSchema]),
);

// ─── Form validation ─────────────────────────────────────────────────────────

export const RoleFormSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim(),
});

// ─── Inferred types ──────────────────────────────────────────────────────────

export type Role = z.infer<typeof RoleSchema>;
export type RoleListData = z.infer<typeof RoleListDataSchema>;
export type RoleUser = z.infer<typeof RoleUserSchema>;
export type RoleFormValues = z.infer<typeof RoleFormSchema>;
