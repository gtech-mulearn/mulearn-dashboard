/**
 * Karma Voucher Schemas
 *
 * 📍 src/features/Karma-voucher/schemas/karma-voucher.schema.ts
 */

import { z } from "zod";

/**
 * Robust API Response Wrapper
 * Matches dynamic-type standard: all fields optional + passthrough
 */
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

/**
 * Base Karma Voucher Schema
 */
export const KarmaVoucherSchema = z.object({
  id: z.string(),
  user: z.string(),
  code: z.string(),
  karma: z
    .union([z.number(), z.string(), z.null(), z.undefined()])
    .transform((value) => {
      if (value === null || value === undefined) return 0;
      return typeof value === "string" ? Number(value) || 0 : value;
    }),
  claimed: z.boolean(),
  task: z.string().nullable().optional(),
  hashtag: z.string().nullable().optional(),
  week: z.string().nullable().optional(),
  month: z.string().nullable().optional(),
  updated_by: z.string().nullable().optional(),
  updated_at: z.string(),
  created_by: z.string(),
  created_at: z.string(),
  muid: z.string().nullable().optional(),
});

/**
 * Import Success Row Schema
 */
export const ImportSuccessRowSchema = z.object({
  muid: z.string().nullable().optional(),
  code: z.string(),
  user: z.string().nullable().optional(),
  task: z.string().nullable().optional(),
  karma: z.union([z.number(), z.string(), z.null()]).optional(),
  month: z.string().nullable().optional(),
  week: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  event: z.string().nullable().optional(),
});

/**
 * Import Failure Row Schema
 */
export const ImportFailureRowSchema = z.object({
  muid: z.string().nullable().optional(),
  karma: z.union([z.number(), z.string(), z.null()]).optional(),
  hashtag: z.string().nullable().optional(),
  month: z.string().nullable().optional(),
  week: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  event: z.string().nullable().optional(),
  error: z.string(),
});

/**
 * Bulk Import Response Schema
 */
export const BulkImportResponseSchema = z.object({
  Success: z.array(ImportSuccessRowSchema).default([]),
  Failed: z.array(ImportFailureRowSchema).default([]),
});

/**
 * Generic Paginated Data Structure
 */
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

/**
 * Full List Response Schema
 */
export const KarmaVoucherListResponseSchema = ApiResponseSchema(
  PaginatedDataSchema(KarmaVoucherSchema),
);

/**
 * Create Voucher — form input
 */
export const CreateVoucherFormSchema = z.object({
  user: z.string().min(1, "Select a user"),
  task: z.string().min(1, "Task hashtag is required"),
  karma: z.coerce.number().int().positive("Enter a valid karma"),
  month: z.string().min(1, "Month is required"),
  week: z.string().min(1, "Week is required"),
});

/**
 * Create Voucher — API response payload
 */
export const CreateVoucherResponseSchema = z.object({
  user: z.string(),
  task: z.string(),
  karma: z.union([z.number(), z.string()]),
  month: z.string(),
  week: z.string(),
});

/**
 * Update Voucher — form input
 */
export const UpdateVoucherFormSchema = z.object({
  hashtag: z.string().min(1, "Task hashtag is required"),
  new_karma: z.coerce.number().int().positive("Enter a valid karma"),
});
