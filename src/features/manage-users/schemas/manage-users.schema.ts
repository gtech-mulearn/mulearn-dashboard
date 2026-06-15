import { z } from "zod";

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    hasError: z.boolean(),
    statusCode: z.number(),
    message: z.record(z.string(), z.array(z.string())).optional(),
    response: dataSchema,
  });

const stringOrNumberId = z
  .union([z.string(), z.number()])
  .transform((value) => String(value));

export const ManageUserListItemSchema = z.object({
  id: stringOrNumberId,
  full_name: z.string().nullable().optional().default(""),
  karma: z
    .union([z.number(), z.string(), z.null(), z.undefined()])
    .transform((value) => {
      if (value === null || value === undefined) return 0;
      return typeof value === "string" ? Number(value) || 0 : value;
    }),
  muid: z.string().nullable().optional().default("-"),
  email: z.string().nullable().optional().default("-"),
  mobile: z.string().nullable().optional().default("-"),
  discord_id: z.string().nullable().optional().default("-"),
  level: z
    .union([z.string(), z.number(), z.null(), z.undefined()])
    .transform((value) =>
      value === null || value === undefined ? "-" : String(value),
    ),
  created_at: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
  college: z.string().nullable().optional(),
});

export const PaginationSchema = z.object({
  page: z.number().optional(),
  perPage: z.number().optional(),
  total: z.number().optional(),
  totalPages: z.number().optional(),
});

export const ManageUsersListDataSchema = z.object({
  data: z.array(ManageUserListItemSchema),
  pagination: PaginationSchema,
});

export const ManageUsersListResponseSchema = ApiResponseSchema(
  ManageUsersListDataSchema,
);

const toStringSafe = (value: unknown, fallback = "") => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean")
    return String(value);
  if (typeof value === "object" && value && "id" in value) {
    const idValue = (value as { id?: unknown }).id;
    if (idValue !== undefined && idValue !== null) return String(idValue);
  }
  return fallback;
};

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => toStringSafe(item, ""))
    .filter((item) => item.trim().length > 0);
};

export const OrganizationSchema = z
  .object({
    org: z
      .unknown()
      .optional()
      .transform((value) => toStringSafe(value)),
    org_type: z
      .unknown()
      .optional()
      .transform((value) => toStringSafe(value)),
    department: z
      .unknown()
      .optional()
      .transform((value) => toStringSafe(value, undefined as unknown as string))
      .optional(),
    graduation_year: z
      .union([z.number(), z.string(), z.null(), z.undefined()])
      .transform((value) => {
        if (value === null || value === undefined || value === "") return null;
        const parsed =
          typeof value === "string" ? Number.parseInt(value, 10) : value;
        return Number.isNaN(parsed) ? null : parsed;
      })
      .optional(),
    country: z
      .unknown()
      .optional()
      .transform((value) => toStringSafe(value, undefined as unknown as string))
      .optional(),
    state: z
      .unknown()
      .optional()
      .transform((value) => toStringSafe(value, undefined as unknown as string))
      .optional(),
    district: z
      .unknown()
      .optional()
      .transform((value) => toStringSafe(value, undefined as unknown as string))
      .optional(),
  })
  .passthrough();

export const ManageUserDetailSchema = z.object({
  user_id: z
    .unknown()
    .optional()
    .transform((value) => toStringSafe(value)),
  id: stringOrNumberId.optional(),
  full_name: z
    .unknown()
    .optional()
    .transform((value) => toStringSafe(value)),
  email: z
    .unknown()
    .optional()
    .transform((value) => toStringSafe(value)),
  mobile: z
    .unknown()
    .optional()
    .transform((value) => toStringSafe(value))
    .default(""),
  discord_id: z
    .unknown()
    .optional()
    .transform((value) => toStringSafe(value))
    .default(""),
  role: z.unknown().optional().transform(toStringArray).default([]),
  roles: z.unknown().optional().transform(toStringArray).default([]),
  community: z.unknown().optional().transform(toStringArray).default([]),
  organizations: z.array(OrganizationSchema).nullable().optional().default([]),
  interest_groups: z.unknown().optional().transform(toStringArray).default([]),
  graduation_year: z.number().nullable().optional(),
  district: z
    .unknown()
    .optional()
    .transform((value) => toStringSafe(value)),
});

export const ManageUserDetailResponseSchema = ApiResponseSchema(
  ManageUserDetailSchema,
);

export const SimpleOptionSchema = z.object({
  id: z.union([z.string(), z.number()]).transform((value) => String(value)),
  title: z.string().optional(),
  name: z.string().optional(),
  location: z.string().optional(),
});

export const CommunitiesResponseSchema = ApiResponseSchema(
  z.object({
    communities: z.array(SimpleOptionSchema),
  }),
);

export const RolesResponseSchema = ApiResponseSchema(
  z.object({
    roles: z.array(SimpleOptionSchema),
  }),
);

export const InterestsResponseSchema = ApiResponseSchema(
  z.object({
    aois: z.array(SimpleOptionSchema),
  }),
);

export const LocationSearchResponseSchema = ApiResponseSchema(
  z.array(
    z.object({
      id: z.union([z.string(), z.number()]).transform((value) => String(value)),
      location: z.string(),
    }),
  ),
);

export const CountriesResponseSchema = ApiResponseSchema(
  z.object({
    countries: z.array(
      z.object({
        id: z
          .union([z.string(), z.number()])
          .transform((value) => String(value)),
        name: z.string(),
      }),
    ),
  }),
);

export const StatesResponseSchema = ApiResponseSchema(
  z.object({
    states: z.array(
      z.object({
        id: z
          .union([z.string(), z.number()])
          .transform((value) => String(value)),
        name: z.string(),
      }),
    ),
  }),
);

export const DistrictsResponseSchema = ApiResponseSchema(
  z.object({
    districts: z.array(
      z.object({
        id: z
          .union([z.string(), z.number()])
          .transform((value) => String(value)),
        name: z.string(),
      }),
    ),
  }),
);

export const CollegesByDistrictResponseSchema = ApiResponseSchema(
  z.object({
    colleges: z.array(
      z.object({
        id: z
          .union([z.string(), z.number()])
          .transform((value) => String(value)),
        title: z.string(),
      }),
    ),
    departments: z.array(
      z.object({
        id: z
          .union([z.string(), z.number()])
          .transform((value) => String(value)),
        title: z.string(),
      }),
    ),
  }),
);

export const SchoolsByDistrictResponseSchema = ApiResponseSchema(
  z.object({
    schools: z.array(
      z.object({
        id: z
          .union([z.string(), z.number()])
          .transform((value) => String(value)),
        title: z.string(),
      }),
    ),
  }),
);

export const GenericMutationResponseSchema = ApiResponseSchema(
  z.object({}).loose(),
);

export const ManageUserFormSchema = z.object({
  full_name: z.string().trim().min(1, "Full name is required"),
  email: z.string().trim().email("Enter a valid email"),
  mobile: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || /^\d{0,10}$/.test(value),
      "Mobile number must be up to 10 digits",
    ),
  discord_id: z.string().trim().optional(),
  location_id: z.string().optional(),
  community: z.array(z.string()),
  roles: z.array(z.string()),
  interest_groups: z.array(z.string()),
  country_id: z.string().optional(),
  state_id: z.string().optional(),
  district_id: z.string().optional(),
  college_id: z.string().optional(),
  department_id: z.string().optional(),
  graduation_year: z
    .string()
    .trim()
    .optional()
    .refine(
      (value) => !value || /^\d{4}$/.test(value),
      "Graduation year must be 4 digits",
    ),
});

export type ManageUserListItem = z.infer<typeof ManageUserListItemSchema>;
export type ManageUsersListData = z.infer<typeof ManageUsersListDataSchema>;
export type ManageUserDetail = z.infer<typeof ManageUserDetailSchema>;
export type ManageUserFormValues = z.infer<typeof ManageUserFormSchema>;

export type UiOption = {
  label: string;
  value: string;
};

export type UpdateManageUserPayload = {
  full_name?: string;
  email?: string;
  mobile?: string;
  discord_id?: string;
  district?: string;
  roles?: string[];
  interest_groups?: string[];
  organizations?: string[];
  department?: string;
  graduation_year?: number;
  community?: string[];
};

// ── Role Assignment Payload ──────────────────────────────────────────────────

export const MentorTierSchema = z.enum([
  "MENTOR",
  "IG_MENTOR",
  "CAMPUS_MENTOR",
  "COMPANY_MENTOR",
]);
export type MentorTier = z.infer<typeof MentorTierSchema>;

/**
 * Discriminated-union payload for POST /api/v1/dashboard/roles/user-role/
 * Each variant maps to a different role type.
 */
export type AssignRolePayload =
  | {
      /** General / Campus Lead / Admin – no extras needed */
      user_id: string;
      role_id: string;
    }
  | {
      /** Intern – guild is required */
      user_id: string;
      role_id: string;
      guild: string;
    }
  | {
      /** General platform mentor */
      user_id: string;
      role_id: string;
      mentor_tier: "MENTOR";
    }
  | {
      /** IG mentor – list of IG UUIDs */
      user_id: string;
      role_id: string;
      mentor_tier: "IG_MENTOR";
      ig_ids: string[];
    }
  | {
      /** Campus / Company mentor – single org UUID */
      user_id: string;
      role_id: string;
      mentor_tier: "CAMPUS_MENTOR" | "COMPANY_MENTOR";
      org_id: string;
    };

export const AssignRoleResponseSchema = z
  .object({
    hasError: z.boolean(),
    statusCode: z.number(),
    message: z.record(z.string(), z.array(z.string())).optional(),
    response: z
      .object({
        message: z.string().optional(),
        intern_guild_created: z.boolean().optional(),
        mentor_profile_created: z.boolean().optional(),
      })
      .passthrough(),
  })
  .passthrough();

// ── Zod form schema for the "Assign Role" dialog ────────────────────────────

export const INTERN_ROLE_NAME = "intern";
export const MENTOR_ROLE_NAME = "mentor";

/**
 * Form schema used by the AssignRoleDialog.
 * `role_type` is derived on the client from the role's name (lower-case match).
 */
export const AssignRoleFormSchema = z
  .object({
    role_id: z.string().min(1, "Please select a role"),
    role_type: z.enum(["general", "intern", "mentor"]).default("general"),

    // Intern extras
    guild: z.string().optional(),

    // Mentor extras
    mentor_tier: MentorTierSchema.optional(),
    ig_ids: z.array(z.string()).optional(),
    org_id: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.role_type === "intern" && !data.guild?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["guild"],
        message: "Guild is required for the Intern role",
      });
    }

    if (data.role_type === "mentor") {
      if (!data.mentor_tier) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["mentor_tier"],
          message: "Please select a mentor tier",
        });
      }

      if (
        data.mentor_tier === "IG_MENTOR" &&
        (!data.ig_ids || data.ig_ids.length === 0)
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["ig_ids"],
          message: "At least one Interest Group is required",
        });
      }

      if (
        (data.mentor_tier === "CAMPUS_MENTOR" ||
          data.mentor_tier === "COMPANY_MENTOR") &&
        !data.org_id?.trim()
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["org_id"],
          message: "Organisation is required for this mentor tier",
        });
      }
    }
  });

export type AssignRoleFormValues = z.infer<typeof AssignRoleFormSchema>;
