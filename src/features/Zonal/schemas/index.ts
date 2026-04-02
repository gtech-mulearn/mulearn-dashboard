import { z } from "zod";

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z
    .object({
      hasError: z.boolean().optional(),
      statusCode: z.number().optional(),
      message: z.unknown().optional(),
      data: dataSchema.optional(),
      response: dataSchema.optional(),
      pagination: z.unknown().optional(),
    })
    .passthrough();

export const PaginatedDataSchema = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({
    data: z.array(schema).default([]),
    pagination: z
      .object({
        count: z.number().default(0),
        totalPages: z.number().default(1),
        isNext: z.boolean().default(false),
        isPrev: z.boolean().default(false),
        nextPage: z.number().nullable().optional(),
      })
      .default({
        count: 0,
        totalPages: 1,
        isNext: false,
        isPrev: false,
      }),
  });

export const StudentList = z.object({
  userid: z.string().uuid(),
  full_name: z.string(),
  muid: z.string(),
  karma: z.number().int(),
  rank: z.number().int(),
  level: z.string(),
});

export type StudentData = z.infer<typeof StudentList>;
export const StudentListSchema = ApiResponseSchema(
  PaginatedDataSchema(StudentList),
);

export const CollegeList = z.object({
  id: z.string().uuid(),
  title: z.string(),
  code: z.string(),
  level: z.number().int().nullable(),
  lead: z.string().nullable(),
  lead_number: z.string().nullable(),
});
export type CollegeData = z.infer<typeof CollegeList>;
export const ColegeListSchema = ApiResponseSchema(
  PaginatedDataSchema(CollegeList),
);

export const zonedetails = z.object({
  zone: z.string(),
  rank: z.number().int(),
  zonal_lead: z.string(),
  karma: z.number().int(),
  total_members: z.number().int(),
  active_members: z.number().int(),
});

export const TopDistrict = z.object({
  district: z.string(),
  rank: z.number().int(),
  karma: z.number().int(),
});

export const StudentLevel = z.object({
  level_order: z.number().int(),
  students_count: z.number().int(),
});
