/**
 * Home Feature Schemas
 *
 * 📍 src/features/home/schemas/home.schema.ts
 */

import { z } from "zod";

// ============================================
// Django Response Wrapper (reusable)
// ============================================

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    hasError: z.boolean(),
    statusCode: z.number(),
    message: z.record(z.string(), z.array(z.string())).optional(),
    response: dataSchema,
  });

// ============================================
// Interest Groups (/api/v1/dashboard/ig/list/)
// ============================================

export const InterestGroupListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string().optional(),
});
export type InterestGroupListItem = z.infer<typeof InterestGroupListItemSchema>;

export const InterestGroupsListDataSchema = z.object({
  interestGroup: z.array(InterestGroupListItemSchema),
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
// Karma Feed (/api/v1/dashboard/profile/karma-feed/)
// ============================================

export const KarmaFeedResponseSchema = ApiResponseSchema(
  z.object({
    top_user: z.object({
      karma: z.number(),
      full_name: z.string(),
      muid: z.string(),
    }),
    top_college: z.object({
      karma: z.number(),
      name: z.string(),
    }),
  }),
);
export type KarmaFeedResponse = z.infer<typeof KarmaFeedResponseSchema>;
