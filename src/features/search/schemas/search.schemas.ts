import { z } from "zod";

// User (Student/Mentor) Schema
export const userSearchResultSchema = z.object({
  id: z.string(),
  muid: z.string(),
  full_name: z.string(),
  profile_pic: z.string().nullable(),
  karma: z.number(),
  organization: z.string().nullable(),
  interest_groups: z.array(z.string()).default([]),
});

export const userSearchResponseSchema = z.object({
  data: z.array(userSearchResultSchema),
  pagination: z.object({
    page: z.number(),
    perPage: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

// Campus Schema
export const campusSearchResultSchema = z.object({
  id: z.string(),
  code: z.string(),
  title: z.string(),
  zone: z.string().nullable(),
  district: z.string().nullable(),
  member_count: z.number(),
  rank: z.number().nullable(),
});

export const campusSearchResponseSchema = z.object({
  data: z.array(campusSearchResultSchema),
  pagination: z.object({
    page: z.number(),
    perPage: z.number(),
    total: z.number(),
    totalPages: z.number(),
  }),
});

// Types
export type UserSearchResult = z.infer<typeof userSearchResultSchema>;
export type UserSearchResponse = z.infer<typeof userSearchResponseSchema>;
export type CampusSearchResult = z.infer<typeof campusSearchResultSchema>;
export type CampusSearchResponse = z.infer<typeof campusSearchResponseSchema>;

export type SearchType = "name" | "code" | "zone" | "school" | "college";
