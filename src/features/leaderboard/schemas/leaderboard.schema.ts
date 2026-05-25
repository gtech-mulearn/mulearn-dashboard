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

// Matches backend MentorLeaderboardSerializer
export const MentorLeaderboardEntrySchema = z.object({
  rank: z.coerce.number().default(0),
  mentor_id: z.string().optional().default(""),
  full_name: z
    .string()
    .nullish()
    .transform((v) => v ?? ""),
  muid: z.string().optional().default(""),
  profile_pic: z
    .string()
    .nullish()
    .transform((v) => v ?? undefined),
  mentor_tier: z.string().optional().default(""),
  sessions_completed: z.coerce.number().default(0),
  mentees_attended: z.coerce.number().default(0),
  hours: z.coerce.number().default(0),
  score: z.coerce.number().default(0),
});
export type MentorLeaderboardEntry = z.infer<
  typeof MentorLeaderboardEntrySchema
>;

export const MentorLeaderboardResponseSchema = z.object({
  statusCode: z.number().optional(),
  response: z.object({
    data: z.array(MentorLeaderboardEntrySchema),
    pagination: z
      .object({
        count: z.number().optional(),
        totalPages: z.coerce.number().default(1),
        isNext: z.boolean().optional(),
        isPrev: z.boolean().optional(),
        nextPage: z.number().nullable().optional(),
      })
      .optional(),
  }),
});
