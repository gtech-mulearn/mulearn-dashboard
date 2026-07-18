/**
 * Leaderboard Feature Schemas
 *
 * 📍 src/features/leaderboard/schemas/leaderboard.schema.ts
 *
 * Zod schemas for all leaderboard-related API responses.
 */

import { z } from "zod";

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    hasError: z.boolean(),
    statusCode: z.number(),
    message: z.record(z.string(), z.array(z.string())).optional(),
    response: dataSchema,
  });

export const StudentLeaderboardEntrySchema = z.object({
  muid: z
    .string()
    .nullish()
    .transform((value) => value ?? undefined),
  full_name: z
    .string()
    .nullish()
    .transform((value) => value ?? ""),
  institution: z
    .string()
    .nullish()
    .transform((value) => value ?? undefined),
  total_karma: z.coerce.number(),
  profile_pic: z
    .string()
    .nullish()
    .transform((value) => value ?? undefined),
});

export const CollegeLeaderboardEntrySchema = z.object({
  id: z.string().optional(),
  code: z.string(),
  title: z.string().optional(),
  total_karma: z.number(),
  students: z.number().optional(),
  total_students: z.number().optional(),
});

export const StudentLeaderboardResponseSchema = ApiResponseSchema(
  z.array(StudentLeaderboardEntrySchema),
);

export const CollegeLeaderboardResponseSchema = ApiResponseSchema(
  z.array(CollegeLeaderboardEntrySchema),
);

export type StudentLeaderboardEntry = z.infer<
  typeof StudentLeaderboardEntrySchema
>;
export type CollegeLeaderboardEntry = z.infer<
  typeof CollegeLeaderboardEntrySchema
>;

export type StudentLeaderboardResponse = z.infer<
  typeof StudentLeaderboardResponseSchema
>;
export type CollegeLeaderboardResponse = z.infer<
  typeof CollegeLeaderboardResponseSchema
>;
