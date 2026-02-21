/**
 * Common API Response Schema
 *
 * Shared Django response envelope wrapper used across all features.
 * The Django backend wraps all responses in:
 * `{ hasError, statusCode, message, response: <data> }`
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
    message: z.any().optional(),
    response: dataSchema,
  });
