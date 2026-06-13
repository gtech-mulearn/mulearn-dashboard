import { z } from "zod";

// ─── Shared ───────────────────────────────────────────────────────────────────

export const PaginationSchema = z.object({
  count: z.number().optional(),
  totalPages: z.number().optional(),
  isNext: z.boolean().optional(),
  isPrev: z.boolean().optional(),
  nextPage: z.union([z.string(), z.number()]).nullable().optional(),
});

// ─── Org Type ─────────────────────────────────────────────────────────────────

export const ORG_TYPES = ["College", "Company", "Community", "School"] as const;
export type OrgType = (typeof ORG_TYPES)[number];

// ─── Organization (Institute) ─────────────────────────────────────────────────

export const OrgInfoSchema = z
  .object({
    id: z.string().optional(),
    title: z.string(),
    code: z.string(),
    // API docs fields (plain string names)
    affiliation: z.string().nullable().optional(),
    district: z.string().nullable().optional(),
    zone: z.string().nullable().optional(),
    state: z.string().nullable().optional(),
    country: z.string().nullable().optional(),
    user_count: z.string().nullable().optional(),
    // Legacy / alternative field names
    karma: z.number().nullable().optional(),
    org_type: z.string().optional(),
    zone_name: z.string().nullable().optional(),
    zone_uuid: z.string().nullable().optional(),
    country_name: z.string().nullable().optional(),
    country_uuid: z.string().nullable().optional(),
    state_name: z.string().nullable().optional(),
    state_uuid: z.string().nullable().optional(),
    district_name: z.string().nullable().optional(),
    district_uuid: z.string().nullable().optional(),
    affiliation_name: z.string().nullable().optional(),
    affiliation_uuid: z.string().nullable().optional(),
  })
  .passthrough();

// ─── Affiliation (for form dropdown) ─────────────────────────────────────────

export const AffiliationItemSchema = z.object({
  id: z.string(),
  title: z.string(),
});

export const AffiliationListResponseSchema = z
  .object({
    hasError: z.boolean(),
    statusCode: z.number(),
    message: z.record(z.string(), z.array(z.string())).optional(),
    response: z.array(AffiliationItemSchema),
  })
  .transform((val) => val.response);

// ─── Location cascading ───────────────────────────────────────────────────────

export const LocationOptionSchema = z.object({
  id: z.string().optional(),
  value: z.string().optional(),
  name: z.string().optional(),
  title: z.string().optional(),
  label: z.string().optional(),
});

export const LocationListResponseSchema = z
  .object({
    hasError: z.boolean(),
    statusCode: z.number(),
    message: z.record(z.string(), z.array(z.string())).optional(),
    response: z.array(LocationOptionSchema),
  })
  .transform((val) => val.response);

// ─── Form schema ──────────────────────────────────────────────────────────────

export const OrgFormSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    code: z.string().min(1, "Code is required"),
    org_type: z.enum(ORG_TYPES),
    country: z.string().min(1, "Country is required"),
    state: z.string().min(1, "State is required"),
    district: z.string().min(1, "District is required"),
    affiliation: z.string().optional(),
  })
  .refine(
    (data) =>
      data.org_type !== "College" ||
      (data.affiliation && data.affiliation.trim().length > 0),
    {
      message: "Affiliation is required for College type",
      path: ["affiliation"],
    },
  );

// ─── Inferred types ───────────────────────────────────────────────────────────

export type OrgInfo = z.infer<typeof OrgInfoSchema>;
export type AffiliationItem = z.infer<typeof AffiliationItemSchema>;
export type LocationOption = z.infer<typeof LocationOptionSchema>;
export type OrgFormData = z.infer<typeof OrgFormSchema>;
