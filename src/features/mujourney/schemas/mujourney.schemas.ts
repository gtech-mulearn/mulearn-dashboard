/**
 * MuJourney Schemas
 *
 * 📍 src/features/mujourney/schemas/mujourney.schemas.ts
 *
 * Zod validation schemas for MuJourney API responses
 */

import { z } from "zod";

/**
 * Django message field: can be a plain string, an array of strings,
 * or a validation-error record like `{ field: ["err", …] }`.
 */
const DjangoMessageSchema = z.unknown().optional().nullable();

// ============================================
// Task Schema - Very permissive
// ============================================

export const TaskSchema = z
  .object({
    task_name: z.string().default("Untitled Task"),
    task_description: z.string().nullable().optional(),
    karma: z.number().default(0),
    hashtag: z.string().default(""),
    discord_link: z.string().nullable().optional(),
    active: z.boolean().default(true),
    completed: z.boolean().default(false),
    interest_group: z
      .object({
        id: z.string().nullable().optional(),
        name: z.string().nullable().optional(),
      })
      .nullable()
      .optional(),
    submission_channel: z
      .object({
        id: z.string().nullable().optional(),
        name: z.string().nullable().optional(),
        discord_id: z.string().nullable().optional(),
      })
      .nullable()
      .optional(),
  })
  .passthrough();

export type Task = z.infer<typeof TaskSchema>;

// ============================================
// Level Schema
// ============================================

export const LevelSchema = z
  .object({
    name: z.string().default(""),
    tasks: z.array(TaskSchema).default([]),
    karma: z.number().default(0),
  })
  .passthrough();

export type Level = z.infer<typeof LevelSchema>;

// ============================================
// User Level Data Schema (Logged-in)
// ============================================

export const UserLevelDataSchema = z
  .object({
    name: z.string().default(""),
    tasks: z.array(TaskSchema).default([]),
    karma: z.number().default(0),
  })
  .passthrough();

export type UserLevelData = z.infer<typeof UserLevelDataSchema>;

// ============================================
// API Response Schemas - Handle both array and object formats
// ============================================

// GET /api/v1/dashboard/profile/get-user-levels/
export const GetUserLevelsResponseSchema = z
  .object({
    hasError: z.boolean().default(false),
    statusCode: z.number().default(200),
    message: DjangoMessageSchema,
    response: z.array(UserLevelDataSchema).default([]),
  })
  .passthrough();

export type GetUserLevelsResponse = z.infer<typeof GetUserLevelsResponseSchema>;

// GET /api/v1/public/list/levels/
export const PublicListLevelsResponseSchema = z
  .object({
    hasError: z.boolean().default(false),
    statusCode: z.number().default(200),
    message: DjangoMessageSchema,
    response: z.array(LevelSchema).default([]),
  })
  .passthrough();

export type PublicListLevelsResponse = z.infer<
  typeof PublicListLevelsResponseSchema
>;

// GET /api/v1/register/area-of-interest/list/?ig_id=<id>
export const TaskListResponseSchema = z
  .object({
    hasError: z.boolean().optional().default(false),
    statusCode: z.number().optional().default(200),
    message: DjangoMessageSchema,
    response: z
      .union([
        // Format 1: response is an object with data array
        z
          .object({
            data: z.array(TaskSchema).default([]),
            pagination: z
              .object({
                currentPage: z.number(),
                perPage: z.number(),
                totalPages: z.number(),
                totalItems: z.number(),
              })
              .optional()
              .nullable(),
          })
          .passthrough(),
        // Format 2: response is directly an array
        z.array(TaskSchema),
      ])
      .transform((val) => {
        // If response is an array, wrap it in expected object structure
        if (Array.isArray(val)) {
          return { data: val, pagination: null };
        }
        return val;
      }),
  })
  .passthrough();

export type TaskListResponse = z.infer<typeof TaskListResponseSchema>;

// GET /api/v1/dashboard/profile/get-user-levels/{muid}/
export const PublicUserJourneyResponseSchema = z
  .object({
    hasError: z.boolean().optional().default(false),
    statusCode: z.number().optional().default(200),
    message: DjangoMessageSchema,
    response: z
      .object({
        muid: z.string(),
        full_name: z.string(),
        profile_pic: z.string().nullable().optional(),
        current_level: z.number().default(1),
        total_karma: z.number().default(0),
        levels: z.array(UserLevelDataSchema).default([]),
      })
      .passthrough(),
  })
  .passthrough();

export type PublicUserJourneyResponse = z.infer<
  typeof PublicUserJourneyResponseSchema
>;

// GET /api/v1/dashboard/profile/user-level-feed/
export const UserLevelFeedResponseSchema = z
  .object({
    hasError: z.boolean().optional().default(false),
    statusCode: z.number().optional().default(200),
    message: DjangoMessageSchema,
    response: z
      .union([
        // Format 1: response is an object with feed array
        z
          .object({
            feed: z
              .array(
                z
                  .object({
                    task_id: z
                      .union([z.string(), z.number()])
                      .transform((val) => String(val)),
                    task_title: z.string(),
                    karma_earned: z.number(),
                    completed_at: z.string(),
                    level: z.number(),
                  })
                  .passthrough(),
              )
              .default([]),
          })
          .passthrough(),
        // Format 2: response is directly an array
        z.array(
          z
            .object({
              task_id: z
                .union([z.string(), z.number()])
                .transform((val) => String(val)),
              task_title: z.string(),
              karma_earned: z.number(),
              completed_at: z.string(),
              level: z.number(),
            })
            .passthrough(),
        ),
      ])
      .transform((val) => {
        // If response is an array, wrap it in expected object structure
        if (Array.isArray(val)) {
          return { feed: val };
        }
        return val;
      }),
  })
  .passthrough();

export type UserLevelFeedResponse = z.infer<typeof UserLevelFeedResponseSchema>;

// ============================================
// Interest Group Schemas
// ============================================

// Nested schemas for interest group
const _BlogSchema = z
  .object({
    title: z.string(),
    url: z.string(),
  })
  .passthrough();

const _PersonToFollowSchema = z
  .object({
    name: z.string(),
    twitter: z.string().optional(),
    designation: z.string().optional(),
  })
  .passthrough();

const _LeadSchema = z
  .object({
    name: z.string(),
    email: z.string().optional(),
  })
  .passthrough();

const _MentorSchema = z
  .object({
    name: z.string(),
    expertise: z.string().optional(),
    linkedin: z.string().optional(),
  })
  .passthrough();

export const InterestGroupSchema = z
  .object({
    id: z.string(),
    name: z.string(),
  })
  .passthrough();

export type InterestGroup = z.infer<typeof InterestGroupSchema>;

// GET /api/v1/dashboard/ig/list/
export const InterestGroupsResponseSchema = z
  .object({
    hasError: z.boolean(),
    statusCode: z.number(),
    message: DjangoMessageSchema,
    response: z
      .object({
        aois: z.array(InterestGroupSchema).default([]),
      })
      .passthrough(),
  })
  .passthrough();

export type InterestGroupsResponse = z.infer<
  typeof InterestGroupsResponseSchema
>;
