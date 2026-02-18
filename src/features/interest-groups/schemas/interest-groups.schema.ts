/**
 * Interest Groups Schemas
 *
 * 📍 src/features/interest-groups/schemas/interest-groups.schema.ts
 */

import { z } from "zod";

// ============================================
// Django Response Wrapper
// ============================================

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    hasError: z.boolean(),
    statusCode: z.number(),
    message: z.record(z.string(), z.array(z.string())).optional(),
    response: dataSchema,
  });

// ============================================
// Interest Group List Item
// ============================================

export const InterestGroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string().optional(),
  icon: z.string().optional(),
  category: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  member_count: z.number().optional(),
});

export type InterestGroup = z.infer<typeof InterestGroupSchema>;

// ============================================
// Interest Groups List Response
// ============================================

// Pagination metadata
export const PaginationSchema = z.object({
  count: z.number(),
  isNext: z.boolean(),
  isPrev: z.boolean(),
  nextPage: z.number().optional(),
  totalPages: z.number(),
});

export type Pagination = z.infer<typeof PaginationSchema>;

// The actual response structure from the API
export const InterestGroupsListDataSchema = z.object({
  data: z.array(InterestGroupSchema),
  pagination: PaginationSchema,
});

export type InterestGroupsListData = z.infer<
  typeof InterestGroupsListDataSchema
>;

export const InterestGroupsListResponseSchema = ApiResponseSchema(
  InterestGroupsListDataSchema,
);

export type InterestGroupsListResponse = z.infer<
  typeof InterestGroupsListResponseSchema
>;

// ============================================
// Interest Group Detail Response
// ============================================

export const InterestGroupDetailSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    code: z.string().optional(),
    icon: z.string().optional(),
    category: z.string().optional(),
    description: z.string().optional(),
    created_at: z.string().optional(),
    updated_at: z.string().optional(),
    member_count: z.number().optional(),
    members: z
      .array(
        z.object({
          id: z.string(),
          muid: z.string(),
          full_name: z.string(),
          profile_pic: z.string().optional(),
        }),
      )
      .optional(),
  })
  .passthrough(); // Allow unknown fields for debugging

export type InterestGroupDetail = z.infer<typeof InterestGroupDetailSchema>;

export const InterestGroupDetailResponseSchema = ApiResponseSchema(
  InterestGroupDetailSchema,
);

export type InterestGroupDetailResponse = z.infer<
  typeof InterestGroupDetailResponseSchema
>;
