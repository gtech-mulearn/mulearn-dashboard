import { z } from "zod";

// NOTE: apiClient automatically unwraps rawData.response before returning.
// So schemas here describe what lives INSIDE `response`, not the full envelope.

// ── Pagination wrapper ─────────────────────────────────────────────────────
// Used by student-details and college-details which return { data: [], pagination: {} }
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
      .optional(),
  });

// ── Student List ───────────────────────────────────────────────────────────
// apiClient returns: { data: [...], pagination?: {...} }
export const StudentList = z.object({
  user_id: z.string().uuid(),
  full_name: z.string(),
  muid: z.string(),
  karma: z.number().int(),
  rank: z.number().int(),
  level: z.string(),
});
export type StudentData = z.infer<typeof StudentList>;
export const StudentListSchema = PaginatedDataSchema(StudentList);

// ── College List ───────────────────────────────────────────────────────────
// apiClient returns: { data: [...], pagination?: {...} }
export const CollegeList = z.object({
  id: z.string().uuid(),
  title: z.string(),
  code: z.string(),
  level: z.coerce.number().int().nullable(), // ← z.coerce converts "1" → 1
  lead: z.string().nullable(),
  lead_number: z.string().nullable(),
});
export type CollegeData = z.infer<typeof CollegeList>;
export const CollegeListSchema = PaginatedDataSchema(CollegeList);

// ── Zone Details ───────────────────────────────────────────────────────────
// apiClient returns: { zone, rank, zonal_lead, karma, total_members, active_members }
export const ZoneDetailsSchema = z.object({
  zone: z.string(),
  rank: z.number().int(),
  zonal_lead: z.string(),
  karma: z.number().int(),
  total_members: z.number().int(),
  active_members: z.number().int(),
});
export const ZoneSchema = ZoneDetailsSchema;

// ── Top Districts ──────────────────────────────────────────────────────────
// apiClient returns: [ { district, rank, karma }, ... ]
export const TopDistrict = z.object({
  district: z.string(),
  rank: z.number().int(),
  karma: z.number().int(),
});
export const TopDistrictSchema = z.array(TopDistrict);

// ── Student Levels ─────────────────────────────────────────────────────────
// apiClient returns: [ { level_order, students_count }, ... ]
export const StudentLevel = z.object({
  level_order: z.number().int(),
  students_count: z.number().int(),
});
export const StudentLevelSchema = z.array(StudentLevel);
