/**
 * Common API Response Schema
 *
 * Shared Django response envelope wrapper used across all features.
 * The Django backend wraps all responses in:
 * `{ hasError, statusCode, message, response: <data> }`, plus `code` and `requestId` since
 * backend issue 0019.
 */

import { z } from "zod";

/**
 * Wraps a per-endpoint data schema into Django's standard response envelope.
 *
 * @example
 * ```ts
 * const UserListResponseSchema = ApiResponseSchema(
 *   z.object({ results: z.array(UserSchema) })
 * );
 * ```
 */
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    hasError: z.boolean(),
    statusCode: z.number(),
    // Arrays of messages by key, as legacy endpoints send, plus new modules' `fields` object of
    // field errors (backend issue 0019).
    message: z
      .record(
        z.string(),
        z.union([z.array(z.string()), z.record(z.string(), z.unknown())]),
      )
      .optional()
      .nullable(),
    response: dataSchema,
    // Added by backend issue 0019: "ok" or a stable error code, and the request id.
    code: z.string().optional(),
    requestId: z.string().nullable().optional(),
  });
