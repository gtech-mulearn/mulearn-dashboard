import { z } from "zod";

// ─── Shared ──────────────────────────────────────────────────────────────────

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    hasError: z.boolean(),
    statusCode: z.number(),
    message: z.record(z.string(), z.array(z.string())).optional(),
    response: dataSchema,
  });

export const GenericMutationResponseSchema = ApiResponseSchema(
  z.object({}).passthrough(),
);

export const PaginationSchema = z.object({
  count: z.number().optional(),
  totalPages: z.number().optional(),
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

// ─── Org types ───────────────────────────────────────────────────────────────

export const ORG_TYPES = ["College", "Company", "Community", "School"] as const;
export type OrgType = (typeof ORG_TYPES)[number];

// ─── Organization (OrgInfo) ──────────────────────────────────────────────────

export const OrgInfoSchema = z.object({
  id: z.string(),
  title: z.string(),
  code: z.string(),
  karma: z.number().optional().nullable(),
  org_type: z.string().optional().nullable(),

  zone: z.string().nullable().optional(),
  district: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  affiliation: z.string().nullable().optional(),

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
});

export const OrgListDataSchema = z.object({
  data: z.array(OrgInfoSchema),
  pagination: PaginationSchema,
});

export const OrgListResponseSchema = ApiResponseSchema(OrgListDataSchema);

// ─── Affiliation dropdown item (used in org create/edit form) ─────────────────

export const AffiliationDropdownItemSchema = z.object({
  id: z.string(),
  title: z.string(),
});

export const AffiliationDropdownListResponseSchema = ApiResponseSchema(
  z.array(AffiliationDropdownItemSchema),
);

// ─── Location cascading ───────────────────────────────────────────────────────

export const LocationOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
});

// ─── Form values ──────────────────────────────────────────────────────────────

export const OrgFormSchema = z
  .object({
    title: z.string().trim().min(1, "Organization name is required"),
    code: z.string().trim().min(1, "Organization code is required"),
    org_type: z.enum(ORG_TYPES, { error: "Organization type is required" }),
    country: z.string().min(1, "Country is required"),
    state: z.string().min(1, "State is required"),
    district: z.string().min(1, "District is required"),
    affiliation: z.string().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.org_type === "College" && !data.affiliation) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Affiliation is required for colleges",
        path: ["affiliation"],
      });
    }
  });

// ─── Inferred types ──────────────────────────────────────────────────────────

export type OrgInfo = z.infer<typeof OrgInfoSchema>;
export type OrgListData = z.infer<typeof OrgListDataSchema>;
export type AffiliationDropdownItem = z.infer<
  typeof AffiliationDropdownItemSchema
>;
export type LocationOption = z.infer<typeof LocationOptionSchema>;
export type OrgFormValues = z.infer<typeof OrgFormSchema>;

// ─── Sub-schema barrels ───────────────────────────────────────────────────────

export * from "./affiliation.schema";
export * from "./departments.schema";
export * from "./transfer.schema";
export * from "./verification.schema";
