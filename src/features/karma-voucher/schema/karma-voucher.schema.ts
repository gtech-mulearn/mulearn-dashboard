import { z } from "zod";

/**
 * ----------------------------------------
 * Base API Response Wrapper
 * Matches the backend-standard response envelope
 * ----------------------------------------
 */
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    hasError: z.boolean(),
    statusCode: z.number(),
    message: z.record(z.string(), z.array(z.string())).optional(),
    response: dataSchema,
  });

/**
 * ----------------------------------------
 * Base Karma Voucher Schema
 * Shape of a row returned from GET list
 * ----------------------------------------
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

export type KarmaVoucher = z.infer<typeof KarmaVoucherSchema>;

/**
 * ----------------------------------------
 * Import Result Schema
 * Used for both success & failure rows
 * ----------------------------------------
 */
export const ImportResultSchema = z.object({
  code: z.string(),
  message: z.string(),
});

export type ImportResult = z.infer<typeof ImportResultSchema>;

/**
 * ----------------------------------------
 * Bulk Import Response
 * ----------------------------------------
 */
export const BulkImportResponseSchema = z.object({
  Success: z.array(ImportResultSchema),
  Failed: z.array(ImportResultSchema),
});

export type BulkImportResponse = z.infer<typeof BulkImportResponseSchema>;

/**
 * ----------------------------------------
 * Generic Paginated Data Structure
 * Matches the "response" field in paginated calls
 * ----------------------------------------
 */
export const PaginatedDataSchema = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    data: z.array(schema),
    pagination: z.object({
      count: z.number(),
      totalPages: z.number(),
      isNext: z.boolean(),
      isPrev: z.boolean(),
      nextPage: z.number().nullable().optional(),
    }),
  });

/**
 * ----------------------------------------
 * Voucher List Response
 * Full envelope with paginated response
 * ----------------------------------------
 */
export const KarmaVoucherListResponseSchema = ApiResponseSchema(
  PaginatedDataSchema(KarmaVoucherSchema),
);

export type KarmaVoucherListResponse = z.infer<
  typeof KarmaVoucherListResponseSchema
>;

export type KarmaVoucherListData = z.infer<
  ReturnType<typeof PaginatedDataSchema<typeof KarmaVoucherSchema>>
>;
