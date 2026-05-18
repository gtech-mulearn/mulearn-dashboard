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
  full_name: z.string(),
  institution: z.string().optional(),
  total_karma: z.number(),
  profile_pic: z.string().optional().nullable(),
});

export const CollegeLeaderboardEntrySchema = z.object({
  code: z.string(),
  title: z.string().optional(),
  total_karma: z.number(),
  students: z.number().optional(),
  total_students: z.number().optional(),
});

export const WadhwaniLeaderboardEntrySchema = z.object({
  code: z.string(),
  title: z.string().optional(),
  zone_name: z.string().optional(),
  total_karma: z.number(),
  students: z.number().optional(),
  total_students: z.number().optional(),
});

export const WadhwaniLeaderboardResponseSchema = ApiResponseSchema(
  z.array(WadhwaniLeaderboardEntrySchema),
);

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

export type WadhwaniLeaderboardEntry = z.infer<
  typeof WadhwaniLeaderboardEntrySchema
>;

export type StudentLeaderboardResponse = z.infer<
  typeof StudentLeaderboardResponseSchema
>;
export type CollegeLeaderboardResponse = z.infer<
  typeof CollegeLeaderboardResponseSchema
>;

export type WadhwaniLeaderboardResponse = z.infer<
  typeof WadhwaniLeaderboardResponseSchema
>;
