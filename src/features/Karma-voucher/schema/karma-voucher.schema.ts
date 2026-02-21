import { z } from "zod";

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

  karma: z.number(),

  claimed: z.boolean(),

  task: z.string().nullable().optional(),

  week: z.number().nullable().optional(),

  month: z.number().nullable().optional(),

  updated_by: z.string().nullable().optional(),

  updated_at: z.string(),

  created_by: z.string(),

  created_at: z.string(),
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
 * Generic Paginated Response
 * ----------------------------------------
 */
export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    data: z.array(schema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
  });

/**
 * ----------------------------------------
 * Voucher List Response
 * ----------------------------------------
 */
export const KarmaVoucherListResponseSchema =
  PaginatedResponseSchema(KarmaVoucherSchema);

export type KarmaVoucherListResponse = z.infer<
  typeof KarmaVoucherListResponseSchema
>;
