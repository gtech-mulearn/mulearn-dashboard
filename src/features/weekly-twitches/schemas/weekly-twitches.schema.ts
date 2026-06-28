import { z } from "zod";
import { ApiResponseSchema } from "@/lib/schemas/api-response";

export const PaginationSchema = z.object({
  count: z.number().optional(),
  totalPages: z.number().optional(),
  isNext: z.boolean().optional(),
  isPrev: z.boolean().optional(),
  nextPage: z.number().nullable().optional(),
});

export const StatusSchema = z.enum(["upcoming", "ongoing", "completed"]);
export const ZoneSchema = z.enum(["north", "central", "south"]);

export const MutationResponseSchema = ApiResponseSchema(
  z.object({}).passthrough(),
);

// ─── Office Hours ─────────────────────────────────────────────

export const OfficeHoursItemSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  date: z.string(),
  performer: z.string().nullable().optional(),
  designation: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  link: z.string().nullable().optional(),
  interest_groups: z.array(z.string()).default([]),
  poster_thumbnail: z.string().nullable().optional(),
  status: StatusSchema,
  created_at: z.string(),
  updated_at: z.string(),
});

export const OfficeHoursListDataSchema = z.object({
  data: z.array(OfficeHoursItemSchema),
  pagination: PaginationSchema,
});

export const OfficeHoursListResponseSchema = ApiResponseSchema(
  OfficeHoursListDataSchema,
);
export const OfficeHoursDetailResponseSchema = ApiResponseSchema(
  OfficeHoursItemSchema,
);

export const OfficeHoursWriteSchema = z.object({
  title: z.string().min(1, "Title is required").max(300),
  date: z.string().min(1, "Date is required"),
  performer: z.string().max(200).optional().or(z.literal("")),
  designation: z.string().max(200).optional().or(z.literal("")),
  description: z.string().optional(),
  link: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  interest_groups: z.array(z.string()).optional(),
  poster_thumbnail: z
    .string()
    .url("Must be a valid URL")
    .optional()
    .or(z.literal("")),
});

// ─── Campus Content (Salt Mango Tree + Inspiration Station) ───

export const CampusContentItemSchema = z.object({
  id: z.string().uuid(),
  topic: z.string(),
  campus: z.string(),
  date: z.string(),
  zone: ZoneSchema.nullable().optional(),
  description: z.string().nullable().optional(),
  link: z.string().nullable().optional(),
  status: StatusSchema,
  created_at: z.string(),
  updated_at: z.string(),
});

export const CampusContentListDataSchema = z.object({
  data: z.array(CampusContentItemSchema),
  pagination: PaginationSchema,
});

export const CampusContentListResponseSchema = ApiResponseSchema(
  CampusContentListDataSchema,
);
export const CampusContentDetailResponseSchema = ApiResponseSchema(
  CampusContentItemSchema,
);

export const CampusContentWriteSchema = z.object({
  topic: z.string().min(1, "Topic is required").max(300),
  campus: z.string().min(1, "Campus is required").max(200),
  date: z.string().min(1, "Date is required"),
  zone: ZoneSchema.optional(),
  description: z.string().optional(),
  link: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

// ─── Exported types ───────────────────────────────────────────

export type OfficeHoursItem = z.infer<typeof OfficeHoursItemSchema>;
export type OfficeHoursListData = z.infer<typeof OfficeHoursListDataSchema>;
export type OfficeHoursWrite = z.infer<typeof OfficeHoursWriteSchema>;
export type CampusContentItem = z.infer<typeof CampusContentItemSchema>;
export type CampusContentListData = z.infer<typeof CampusContentListDataSchema>;
export type CampusContentWrite = z.infer<typeof CampusContentWriteSchema>;
export type ContentStatus = z.infer<typeof StatusSchema>;
export type ContentZone = z.infer<typeof ZoneSchema>;
