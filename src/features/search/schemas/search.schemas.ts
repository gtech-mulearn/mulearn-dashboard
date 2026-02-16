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
// User (Student/Mentor) Schemas
// ============================================

export const userSearchResultSchema = z.object({
  id: z
    .union([z.string(), z.number(), z.null(), z.undefined()])
    .transform((val) => (val ? String(val) : "unknown"))
    .nullable(),
  muid: z.string(),
  full_name: z.string(),
  profile_pic: z.string().nullable(),
  karma: z
    .union([z.number(), z.string(), z.null(), z.undefined()])
    .transform((val) => {
      if (val === null || val === undefined) return 0;
      return typeof val === "string" ? parseFloat(val) || 0 : val;
    }),
  organization: z.string().nullable().optional(),
  interest_groups: z
    .array(
      z.union([
        z.string(), // If it's already a string
        z
          .object({ name: z.string() })
          .transform((obj) => obj.name), // If it's an object with name
        z
          .any()
          .transform((val) => String(val)), // Fallback
      ]),
    )
    .default([]),
});

export const userSearchDataSchema = z.object({
  data: z.array(userSearchResultSchema),
  pagination: z.object({
    page: z.number().optional(),
    perPage: z.number().optional(),
    total: z.number().optional(),
    totalPages: z.number().optional(),
  }),
});

export const userSearchResponseSchema = ApiResponseSchema(userSearchDataSchema);

// ============================================
// Campus Schemas
// ============================================

export const campusSearchResultSchema = z.object({
  id: z.union([z.string(), z.number()]).transform((val) => String(val)),
  code: z.string(),
  title: z.string(),
  zone: z.string().nullable().optional(),
  district: z.string().nullable().optional(),
  member_count: z
    .union([z.number(), z.string(), z.null(), z.undefined()])
    .transform((val) => {
      if (val === null || val === undefined) return 0;
      return typeof val === "string" ? parseInt(val, 10) || 0 : val;
    }),
  rank: z
    .union([z.number(), z.string(), z.null(), z.undefined()])
    .transform((val) => {
      if (val === null || val === undefined) return null;
      return typeof val === "string" ? parseInt(val, 10) || null : val;
    })
    .nullable(),
});

export const campusSearchDataSchema = z.object({
  data: z.array(campusSearchResultSchema),
  pagination: z.object({
    page: z.number().optional(),
    perPage: z.number().optional(),
    total: z.number().optional(),
    totalPages: z.number().optional(),
  }),
});

export const campusSearchResponseSchema = ApiResponseSchema(
  campusSearchDataSchema,
);

// ============================================
// TypeScript Types
// ============================================

export type UserSearchResult = z.infer<typeof userSearchResultSchema>;
export type UserSearchData = z.infer<typeof userSearchDataSchema>;
export type UserSearchResponse = z.infer<typeof userSearchResponseSchema>;

export type CampusSearchResult = z.infer<typeof campusSearchResultSchema>;
export type CampusSearchData = z.infer<typeof campusSearchDataSchema>;
export type CampusSearchResponse = z.infer<typeof campusSearchResponseSchema>;

export type SearchType = "name" | "code" | "zone" | "school" | "college";
