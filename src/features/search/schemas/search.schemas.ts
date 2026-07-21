import { z } from "zod";
import { ApiResponseSchema } from "@/lib/schemas/api-response";

export { ApiResponseSchema };

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
        z.object({ name: z.string() }).transform((obj) => obj.name), // If it's an object with name
        z.unknown().transform((val) => String(val)), // Fallback
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
  id: z
    .union([z.string(), z.number(), z.null(), z.undefined()])
    .transform((val) => (val != null ? String(val) : "unknown")),
  code: z.preprocess(
    (val) => (val == null ? "" : String(val).trim()),
    z.string(),
  ),
  title: z.preprocess(
    (val) => (val == null ? "" : String(val).trim()),
    z.string(),
  ),
  zone: z.string().nullable().optional(),
  district: z.string().nullable().optional(),
  affiliation: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  user_count: z.preprocess((val) => {
    if (val === null || val === undefined) return 0;
    if (typeof val === "string") return parseInt(val, 10) || 0;
    if (typeof val === "number") return val;
    return 0;
  }, z.number()),
  rank: z.preprocess((val) => {
    if (val === null || val === undefined) return null;
    if (typeof val === "string") return parseInt(val, 10) || null;
    if (typeof val === "number") return val;
    return null;
  }, z.number().nullable()),
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
