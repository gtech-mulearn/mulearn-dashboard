/**
 * MuJourney Schemas
 *
 * 📍 src/features/mujourney/schemas/mujourney.schemas.ts
 *
 * Zod validation schemas for MuJourney API responses.
 * Uses the redesigned unified task list API: GET /api/v1/dashboard/task/list/
 */

import { z } from "zod";

/**
 * Django message field: can be a plain string, an array of strings,
 * or a validation-error record like `{ field: ["err", …] }`.
 */
const DjangoMessageSchema = z.unknown().optional().nullable();

// ============================================
// Redesigned Task Schema (TaskListPublicSerializer)
// ============================================

export const TaskListPublicSchema = z
  .object({
    id: z.string(),
    hashtag: z.string().nullable().optional(),
    title: z.string(),
    description: z.string().nullable().optional(),
    karma: z
      .number()
      .nullish()
      .transform((v) => v ?? 0),
    channel: z.string().nullable().optional(),
    discord_id: z.string().nullable().optional(),
    type: z
      .string()
      .nullish()
      .transform((v) => v ?? "regular"),
    variable_karma: z
      .boolean()
      .nullish()
      .transform((v) => v ?? false),
    level: z.string().nullable().optional(),
    ig: z.string().nullable().optional(),
    event: z.string().nullable().optional(),
    event_id: z.string().nullable().optional(),
    company_name: z.string().nullable().optional(),
    completed: z.boolean().nullish().default(false),
  })
  .passthrough();

export type TaskListPublic = z.infer<typeof TaskListPublicSchema>;

// ============================================
// Redesigned Task List Response Schema
// GET /api/v1/dashboard/task/list/
// ============================================

export const TaskListResponseSchema = z
  .object({
    hasError: z.boolean().default(false),
    statusCode: z.number().default(200),
    message: DjangoMessageSchema,
    response: z
      .object({
        start_journey: z.array(TaskListPublicSchema).default([]),
        become_expert: z.array(TaskListPublicSchema).default([]),
        events: z.array(TaskListPublicSchema).default([]),
      })
      .passthrough(),
  })
  .passthrough();

export type TaskListResponse = z.infer<typeof TaskListResponseSchema>;

// ============================================
// Interest Group Schemas (still needed for IG pills)
// ============================================

export const InterestGroupSchema = z
  .object({
    id: z.string(),
    name: z.string(),
  })
  .passthrough();

export type InterestGroup = z.infer<typeof InterestGroupSchema>;

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

// ============================================
// Public User Journey Response (kept for [muid] page)
// GET /api/v1/dashboard/profile/get-user-levels/{muid}/
// These levels still use the old backend format.
// ============================================

/** A single task in a journey level (old backend shape for [muid] page) */
export const JourneyTaskSchema = z
  .object({
    task_name: z.string().default("Untitled Task"),
    task_description: z.string().nullable().optional(),
    karma: z.number().default(0),
    hashtag: z.string().nullable().optional(),
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

export type JourneyTask = z.infer<typeof JourneyTaskSchema>;

/** A level in a public user journey (old backend shape for [muid] page) */
export const JourneyLevelSchema = z
  .object({
    name: z.string().default(""),
    tasks: z.array(JourneyTaskSchema).default([]),
    karma: z.number().default(0),
  })
  .passthrough();

export type JourneyLevel = z.infer<typeof JourneyLevelSchema>;

export const PublicUserJourneyResponseSchema = z
  .object({
    hasError: z.boolean().optional().default(false),
    statusCode: z.number().optional().default(200),
    message: DjangoMessageSchema,
    response: z.array(JourneyLevelSchema).default([]),
  })
  .passthrough();

export type PublicUserJourneyResponse = z.infer<
  typeof PublicUserJourneyResponseSchema
>;

// ============================================
// User Level Feed (kept for progress bar)
// GET /api/v1/dashboard/profile/user-level-feed/
// ============================================

export const UserLevelFeedSchema = z.object({
  level_order: z.number(),
  level_name: z.string(),
  level_karma: z.number(),
  user_karma: z.number(),
});
export type UserLevelFeed = z.infer<typeof UserLevelFeedSchema>;

export const UserLevelFeedResponseSchema = z
  .object({
    hasError: z.boolean().optional().default(false),
    statusCode: z.number().optional().default(200),
    message: DjangoMessageSchema,
    response: UserLevelFeedSchema,
  })
  .passthrough();

export type UserLevelFeedResponse = z.infer<typeof UserLevelFeedResponseSchema>;
