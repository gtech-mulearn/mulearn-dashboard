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
  week: z.string().nullable().optional(),
  month: z.string().nullable().optional(),
  updated_by: z.string().nullable().optional(),
  updated_at: z.string(),
  created_by: z.string(),
  created_at: z.string(),
  muid: z.string().nullable().optional(),
});

/**
 * Import Result Schema
 */
export const ImportResultSchema = z.object({
  code: z.string(),
  message: z.string(),
});

/**
 * Bulk Import Response Schema
 */
export const BulkImportResponseSchema = z.object({
  Success: z.array(ImportResultSchema).default([]),
  Failed: z.array(ImportResultSchema).default([]),
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
