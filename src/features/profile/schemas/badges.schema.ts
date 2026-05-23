/**
 * Badges Schemas
 *
 * 📍 src/features/profile/schemas/badges.schema.ts
 *
 * Zod schemas for user badges.
 */

import { z } from "zod";
import { ApiResponseSchema } from "@/lib/schemas/api-response";

export const BadgesDataSchema = z.object({
  full_name: z.string(),
  completed_tasks: z.array(z.string()).default([]),
});

export type BadgesData = z.infer<typeof BadgesDataSchema>;

export const BadgesResponseSchema = ApiResponseSchema(BadgesDataSchema);
