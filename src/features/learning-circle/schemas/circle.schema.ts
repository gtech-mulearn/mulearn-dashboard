/**
 * Learning Circle Schemas
 *
 * 📍 src/features/learning-circle/schemas/circle.schema.ts
 *
 * Zod schemas for Learning Circles - matches backend serializers.
 */

import { z } from "zod";

// ============================================
// Shared Schemas
// ============================================

/**
 * User basic info returned in created_by field
 * Note: API doesn't return 'id' for created_by
 */
export const UserBasicSchema = z.object({
  id: z.string().optional(), // Not always present
  full_name: z.string(),
  profile_pic: z.string().nullable().optional(),
  muid: z.string().optional(),
});

export type UserBasic = z.infer<typeof UserBasicSchema>;

// ============================================
// Learning Circle Schemas
// ============================================

/**
 * Circle list item - matches actual API response from /learningcircle/
 * Fields: id, ig, title, org, attendees
 */
export const LearningCircleSchema = z.object({
  id: z.string(),
  ig: z.string(),
  title: z.string(),
  org: z.string().nullable(),
  attendees: z.array(z.unknown()).default([]),
});

export type LearningCircle = z.infer<typeof LearningCircleSchema>;

/**
 * Circle detail - matches actual API response from /learningcircle/<id>/
 * Actual response: id, ig, title, description, org, is_recurring, recurrence_type, recurrence, created_by
 */
export const LearningCircleDetailSchema = z.object({
  id: z.string(),
  ig: z.string(),
  title: z.string(),
  description: z.string().nullable().default(""),
  org: z.string().nullable(),
  is_recurring: z.boolean().optional().default(false),
  recurrence_type: z.string().nullable().optional(),
  recurrence: z.number().nullable().optional(),
  created_by: UserBasicSchema,
  // These may be added by to_representation but aren't in current response
  rank: z.number().nullable().optional(),
  total_karma: z.number().nullable().optional(),
  total_members: z.number().nullable().optional(),
});

export type LearningCircleDetail = z.infer<typeof LearningCircleDetailSchema>;

/**
 * Circle member - matches LearningCircleMemberDetailsView response
 */
export const CircleMemberSchema = z.object({
  id: z.string(),
  full_name: z.string(),
  profile_pic: z.string().nullable(),
  muid: z.string(),
  ig_karma: z.number(),
  is_leader: z.boolean(),
});

export type CircleMember = z.infer<typeof CircleMemberSchema>;

// ============================================
// Request Schemas
// ============================================

export const CreateCircleRequestSchema = z.object({
  ig: z.string().min(1, "Interest group is required"),
  org: z.string().min(1, "Organization is required"),
  title: z.string().min(1).max(100, "Title must be 100 characters or less"),
  description: z
    .string()
    .min(1)
    .max(500, "Description must be 500 characters or less"),
});

export type CreateCircleRequest = z.infer<typeof CreateCircleRequestSchema>;

export const EditCircleRequestSchema = CreateCircleRequestSchema.partial();
export type EditCircleRequest = z.infer<typeof EditCircleRequestSchema>;

// ============================================
// Response Schemas - matches Django CustomResponse
// ============================================

/**
 * Generic API response wrapper for Django CustomResponse
 */
export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    hasError: z.boolean().optional(),
    statusCode: z.number(),
    message: z
      .object({
        general: z.array(z.string()).optional(),
      })
      .optional(),
    response: dataSchema,
  });

export const CircleListResponseSchema = ApiResponseSchema(
  z.array(LearningCircleSchema),
);

export const CircleDetailResponseSchema = ApiResponseSchema(
  LearningCircleDetailSchema,
);

export const CircleMembersResponseSchema = ApiResponseSchema(
  z.array(CircleMemberSchema),
);

export const CreateCircleResponseSchema = ApiResponseSchema(
  z.object({ circle_id: z.string() }),
);

export const EmptyResponseSchema = z.object({
  hasError: z.boolean().optional(),
  statusCode: z.number(),
  message: z
    .object({
      general: z.array(z.string()).optional(),
    })
    .optional(),
  response: z.unknown().optional(),
});

// ============================================
// College List Schemas (for create form dropdown)
// ============================================

/**
 * College list item from /api/v1/dashboard/college/
 * Note: The backend returns college.id but LC create needs org.id
 * Fields like total_karma can return object or number on exception
 */
export const CollegeListItemSchema = z.object({
  id: z.string(), // College ID
  level: z.number().nullable().optional(),
  org: z.string(), // Organization name (title)
  number_of_members: z.unknown().optional(),
  total_karma: z.unknown().optional(),
  no_of_lc: z.unknown().optional(),
  no_of_alumni: z.number().nullable().optional(),
});

export type CollegeListItem = z.infer<typeof CollegeListItemSchema>;

export const CollegeListResponseSchema = z.object({
  hasError: z.boolean().optional(),
  statusCode: z.number(),
  message: z
    .object({
      general: z.array(z.string()).optional(),
    })
    .optional(),
  response: z.object({
    data: z.array(CollegeListItemSchema),
    pagination: z.object({
      count: z.number(),
      totalPages: z.number(),
      isNext: z.boolean(),
      isPrev: z.boolean(),
      nextPage: z.number().nullable(),
    }),
  }),
});
