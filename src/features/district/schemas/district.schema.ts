import { z } from "zod";
import { ApiResponseSchema } from "@/lib/schemas/api-response";

const numberSchema = z
  .union([z.number(), z.string(), z.null(), z.undefined()])
  .transform((val) => {
    if (val === null || val === undefined || val === "") return 0;
    return typeof val === "string" ? Number(val) || 0 : val;
  });

const nullableNumberSchema = z
  .union([z.number(), z.string(), z.null(), z.undefined()])
  .transform((val) => {
    if (val === null || val === undefined || val === "") return null;
    const num = typeof val === "string" ? Number(val) : val;
    return Number.isFinite(num) ? num : null;
  });

// ============================================
// District Details
// ============================================

export const DistrictDetailsSchema = z.object({
  district: z.string(),
  zone: z.string(),
  rank: numberSchema,
  district_lead: z.string().nullable(),
  karma: numberSchema,
  total_members: numberSchema,
  active_members: numberSchema,
});

export const DistrictDetailsResponseSchema = ApiResponseSchema(
  DistrictDetailsSchema,
);

// ============================================
// Top Campus
// ============================================

export const DistrictTopCampusItemSchema = z.object({
  rank: numberSchema,
  campus_code: z.string(),
  karma: numberSchema,
});

export const DistrictTopCampusResponseSchema = ApiResponseSchema(
  z.array(DistrictTopCampusItemSchema),
);

// ============================================
// Student Level
// ============================================

export const DistrictStudentLevelItemSchema = z.object({
  level_order: numberSchema,
  students_count: numberSchema,
});

export const DistrictStudentLevelResponseSchema = ApiResponseSchema(
  z.array(DistrictStudentLevelItemSchema),
);

// ============================================
// Student Details (Paginated)
// ============================================

export const DistrictStudentItemSchema = z.object({
  user_id: z.string(),
  full_name: z.string(),
  muid: z.string(),
  karma: numberSchema,
  rank: numberSchema,
  level: z.string(),
});

export const DistrictPaginationSchema = z.object({
  count: numberSchema.optional(),
  totalPages: numberSchema.optional(),
  isFirst: z.boolean().optional(),
  isLast: z.boolean().optional(),
  isNext: z.boolean().optional(),
  isPrev: z.boolean().optional(),
  nextPage: z
    .union([z.string(), z.number(), z.null(), z.undefined()])
    .transform((val) => {
      if (val === null || val === undefined || val === "") return null;
      return typeof val === "string" ? Number(val) || null : val;
    })
    .nullable()
    .optional(),
});

export const DistrictStudentDetailsDataSchema = z.object({
  data: z.array(DistrictStudentItemSchema),
  pagination: DistrictPaginationSchema,
});

export const DistrictStudentDetailsResponseSchema = ApiResponseSchema(
  DistrictStudentDetailsDataSchema,
);

// ============================================
// College Details (Paginated)
// ============================================

export const DistrictCollegeItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  code: z.string(),
  level: nullableNumberSchema,
  lead: z.string().nullable(),
  lead_number: z.string().nullable(),
});

export const DistrictCollegeDetailsDataSchema = z.object({
  data: z.array(DistrictCollegeItemSchema),
  pagination: DistrictPaginationSchema,
});

export const DistrictCollegeDetailsResponseSchema = ApiResponseSchema(
  DistrictCollegeDetailsDataSchema,
);

// ============================================
// Types
// ============================================

export type DistrictDetails = z.infer<typeof DistrictDetailsSchema>;
export type DistrictTopCampusItem = z.infer<typeof DistrictTopCampusItemSchema>;
export type DistrictStudentLevelItem = z.infer<
  typeof DistrictStudentLevelItemSchema
>;
export type DistrictStudentItem = z.infer<typeof DistrictStudentItemSchema>;
export type DistrictStudentDetailsData = z.infer<
  typeof DistrictStudentDetailsDataSchema
>;
export type DistrictCollegeItem = z.infer<typeof DistrictCollegeItemSchema>;
export type DistrictCollegeDetailsData = z.infer<
  typeof DistrictCollegeDetailsDataSchema
>;
