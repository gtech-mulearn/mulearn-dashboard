import { z } from "zod";
import { ApiResponseSchema } from "@/lib/schemas/api-response";

export const GenericMutationResponseSchema = ApiResponseSchema(
  z.object({}).passthrough(),
);

export const PaginationSchema = z.object({
  total_items: z.number().optional(),
  next_page: z.number().nullable().optional(),
  prev_page: z.number().nullable().optional(),
  current_page: z.number().optional(),
});

// ─── Hiring ──────────────────────────────────────────────────────────────────

export const HiringSchema = z.object({
  id: z.string(),
  posted_date: z.string().nullable().optional(),
  role: z.string(),
  organization: z.string(),
  title: z.string(),
  location: z.string().nullable().optional().default(""),
  lastdate: z.string(),
  applylink: z.string().nullable().optional().default(""),
  jdlink: z.string().nullable().optional().default(""),
  duration: z.string().nullable().optional().default(""),
  remuneration: z.string().nullable().optional().default(""),
  vacancies: z.number().nullable().optional().default(0),
  extracontent: z.string().nullable().optional().default(""),
  created_by: z.string().nullable().optional().default(""),
  created_at: z.string().nullable().optional(),
  updated_by: z.string().nullable().optional().default(""),
  updated_at: z.string().nullable().optional(),
});

export const HiringListDataSchema = z.object({
  data: z.array(HiringSchema),
  pagination: PaginationSchema,
});

export const HiringListResponseSchema = ApiResponseSchema(HiringListDataSchema);

// ─── Form validation ─────────────────────────────────────────────────────────

export const HiringFormSchema = z.object({
  posted_date: z.string().trim().min(1, "Posted date is required"),
  role: z.string().trim().min(1, "Role is required"),
  organization: z.string().trim().min(1, "Organization is required"),
  title: z.string().trim().min(1, "Title is required"),
  location: z.string().trim().optional(),
  lastdate: z.string().trim().min(1, "Last date is required"),
  applylink: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .optional()
    .or(z.literal("")),
  jdlink: z
    .string()
    .trim()
    .url("Enter a valid URL")
    .optional()
    .or(z.literal("")),
  duration: z.string().trim().optional(),
  remuneration: z.string().trim().optional(),
  vacancies: z.number().int().min(0).optional(),
  extracontent: z.string().trim().optional(),
});

// ─── CSV bulk import result ───────────────────────────────────────────────────

export const HiringImportResultSchema = z.object({
  created: z.number().optional().default(0),
  errors: z
    .array(
      z.object({
        row: z.number().optional(),
        errors: z.record(z.string(), z.array(z.string())).optional(),
      }),
    )
    .optional()
    .default([]),
});

export const HiringImportResponseSchema = ApiResponseSchema(
  HiringImportResultSchema,
);

// ─── Inferred types ──────────────────────────────────────────────────────────

export type Hiring = z.infer<typeof HiringSchema>;
export type HiringListData = z.infer<typeof HiringListDataSchema>;
export type HiringFormValues = z.infer<typeof HiringFormSchema>;
export type HiringImportResult = z.infer<typeof HiringImportResultSchema>;

export type HiringStatusFilter = "ongoing" | "previous" | "all";
