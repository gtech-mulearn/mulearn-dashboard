/**
 * College Levels Schemas
 *
 * 📍 src/features/college-levels/schemas/college.schema.ts
 */

import { z } from "zod";

/* =====================================================
   Reusable Django API Wrapper
===================================================== */

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    hasError: z.boolean(),
    statusCode: z.number(),
    message: z.record(z.string(), z.array(z.string())).optional(),
    response: dataSchema,
  });

/* =====================================================
   Nested Schemas
===================================================== */

const NumberOfMembersSchema = z.object({
  member_count: z.number(),
  no_of_members_increased: z.number(),
});

const TotalKarmaObjectSchema = z.object({
  total_karma_gained: z.number(),
  total_karma_increased: z.number(),
  increased_percentage: z.number(),
});

const NoOfLCSchema = z.object({
  lc_count: z.number(),
  no_of_lc_increased: z.number(),
});

/* =====================================================
   Organization Schema
===================================================== */

const OrganizationSchema = z.object({
  id: z.string().uuid(),
  level: z.number(),
  org: z.string(),
  number_of_members: NumberOfMembersSchema,
  total_karma: z
    .union([z.number(), TotalKarmaObjectSchema])
    .nullable()
    .optional(),
  no_of_lc: NoOfLCSchema,
  no_of_alumni: z.number(),
});

const PaginationSchema = z.object({
  count: z.number(),
  totalPages: z.number(),
  isNext: z.boolean(),
  isPrev: z.boolean(),
  nextPage: z.number().nullable(),
});

export const GetOrganizationsResponseSchema = ApiResponseSchema(
  z.object({
    data: z.array(OrganizationSchema),
    pagination: PaginationSchema,
  }),
);
