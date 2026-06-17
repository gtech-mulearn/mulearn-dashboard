/**
 * Profile Feature Schemas
 *
 * 📍 src/features/profile/schemas/profile.schema.ts
 *
 * Zod schemas for profile-related API responses.
 * Updated to match Django backend serializers with response wrappers.
 */

import { z } from "zod";
import { ApiResponseSchema } from "@/lib/schemas/api-response";

export { ApiResponseSchema };

const StringIdSchema = z
  .union([z.string(), z.number()])
  .transform((v) => String(v));

// ============================================
// User Profile Schemas
// ============================================

/** Interest group with karma */
export const InterestGroupSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  karma: z.number().optional(),
  level: z
    .object({
      unit: z.string(),
      count: z.number(),
    })
    .default({ unit: "level", count: 1 }),
});
export type InterestGroup = z.infer<typeof InterestGroupSchema>;

/** Interest group list item (from /api/v1/dashboard/ig/list/) */
export const InterestGroupListItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string().optional(),
});
export type InterestGroupListItem = z.infer<typeof InterestGroupListItemSchema>;

/** Interest groups list response */
export const InterestGroupsListDataSchema = z.object({
  interestGroup: z.array(InterestGroupListItemSchema),
});
export type InterestGroupsListData = z.infer<
  typeof InterestGroupsListDataSchema
>;

export const InterestGroupsListResponseSchema = ApiResponseSchema(
  InterestGroupsListDataSchema,
);

/** Karma distribution by task type */
export const KarmaDistributionSchema = z.object({
  task_type: z.string(),
  karma: z.number(),
});
export type KarmaDistribution = z.infer<typeof KarmaDistributionSchema>;

/** Full user profile response - matches UserProfileSerializer */
export const UserProfileSchema = z.object({
  id: z.string(),
  muid: z.string(),
  full_name: z.string(),
  email: z.string().optional(),
  mobile: z.string().optional(),
  profile_pic: z.string().nullable(),
  cover_pic: z.string().nullable().optional(),
  gender: z.string().nullable(),
  dob: z.string().optional(),
  college_code: z.string().nullable(),
  college_id: z.string().nullable(),
  department_id: z.string().nullable().optional(),
  department_name: z.string().nullable().optional(),
  department: z
    .object({
      id: z.string().nullable().optional(),
      title: z.string().nullable().optional(),
      name: z.string().nullable().optional(),
    })
    .passthrough()
    .nullable()
    .optional(),
  org_district_id: z.string().nullable().optional(),
  level: z.string().nullable(),
  karma: z.coerce.number().nullable(),
  rank: z.coerce.number().nullable(),
  percentile: z.coerce.number().nullable(),
  joined: z.string(),
  is_public: z.boolean().nullable(),
  roles: z.array(z.string()),
  interest_groups: z.array(InterestGroupSchema),
  karma_distribution: z.array(KarmaDistributionSchema),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

/** Wrapped response for API validation */
export const UserProfileResponseSchema = ApiResponseSchema(UserProfileSchema);
export type UserProfileResponse = z.infer<typeof UserProfileResponseSchema>;

/** GET /api/v1/dashboard/profile/ - edit profile prefill */
export const EditableProfileSchema = z
  .object({
    full_name: z.string().nullable().optional().default(""),
    email: z.string().nullable().optional().default(""),
    mobile: z.string().nullable().optional().default(""),
    gender: z.string().nullable().optional().default(""),
    dob: z.string().nullable().optional().default(""),
    communities: z.array(z.string()).nullable().optional(),
    community: z.array(z.string()).nullable().optional(),
  })
  .transform((data) => ({
    full_name: data.full_name ?? "",
    email: data.email ?? "",
    mobile: data.mobile ?? "",
    gender: data.gender ?? "",
    dob: data.dob ?? "",
    communities: data.communities ?? data.community ?? [],
  }));
export type EditableProfile = z.infer<typeof EditableProfileSchema>;

export const EditableProfileResponseSchema = ApiResponseSchema(
  EditableProfileSchema,
);

// ============================================
// User Activity Log Schemas
// ============================================

/** Single activity log entry - matches UserLogSerializer */
export const UserLogEntrySchema = z.object({
  task_name: z.string(),
  karma: z.coerce.number(),
  created_date: z.string(),
});
export type UserLogEntry = z.infer<typeof UserLogEntrySchema>;

/** User log data schema */
export const UserLogDataSchema = z.array(UserLogEntrySchema);
export type UserLogData = z.infer<typeof UserLogDataSchema>;

/** Wrapped response for API validation */
export const UserLogResponseSchema = ApiResponseSchema(UserLogDataSchema);
export type UserLogResponse = z.infer<typeof UserLogResponseSchema>;

// ============================================
// User Level Schemas
// ============================================

/** Interest group info in task */
export const TaskInterestGroupSchema = z.object({
  id: z.string().nullable(),
  name: z.string().nullable(),
});

/** Submission channel info in task */
export const TaskSubmissionChannelSchema = z.object({
  id: z.string().nullable(),
  name: z.string().nullable(),
  discord_id: z.string().nullable(),
});

/** Task within a level - matches UserLevelSerializer.get_tasks */
export const LevelTaskSchema = z.object({
  task_name: z.string(),
  discord_link: z.string().nullable(),
  hashtag: z.string().nullable(),
  active: z.boolean(),
  completed: z.boolean(),
  karma: z.number(),
  task_description: z.string().nullable().optional(),
  interest_group: TaskInterestGroupSchema.optional(),
  submission_channel: TaskSubmissionChannelSchema.optional(),
});
export type LevelTask = z.infer<typeof LevelTaskSchema>;

/** Level with tasks - matches UserLevelSerializer */
export const UserLevelSchema = z.object({
  name: z.string(),
  karma: z.number(),
  tasks: z.array(LevelTaskSchema),
});
export type UserLevel = z.infer<typeof UserLevelSchema>;

/** User levels data schema */
export const UserLevelsDataSchema = z.array(UserLevelSchema);
export type UserLevelsData = z.infer<typeof UserLevelsDataSchema>;

/** Wrapped response for API validation */
export const UserLevelsResponseSchema = ApiResponseSchema(UserLevelsDataSchema);
export type UserLevelsResponse = z.infer<typeof UserLevelsResponseSchema>;

// ============================================
// Socials Schema - matches LinkSocials serializer
// ============================================

export const SocialsSchema = z.object({
  github: z.string().nullable().optional(),
  facebook: z.string().nullable().optional(),
  instagram: z.string().nullable().optional(),
  linkedin: z.string().nullable().optional(),
  dribble: z.string().nullable().optional(),
  behance: z.string().nullable().optional(),
  stackoverflow: z.string().nullable().optional(),
  medium: z.string().nullable().optional(),
  hackerrank: z.string().nullable().optional(),
});
export type Socials = z.infer<typeof SocialsSchema>;

/** Wrapped response for API validation */
export const SocialsResponseSchema = ApiResponseSchema(SocialsSchema);
export type SocialsResponse = z.infer<typeof SocialsResponseSchema>;

// ============================================
// User Preferences Schema - matches UserPreferencesAPI
// ============================================

export const UserPreferencesSchema = z.object({
  domains: z.array(z.string()).optional(),
  endgoals: z.array(z.string()).optional(),
  orgs: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
      }),
    )
    .optional(),
  interested_in_work: z.boolean().optional(),
  interested_in_gig_work: z.boolean().optional(),
});
export type UserPreferences = z.infer<typeof UserPreferencesSchema>;

/** Wrapped response for API validation */
export const UserPreferencesResponseSchema = ApiResponseSchema(
  UserPreferencesSchema,
);
export type UserPreferencesResponseType = z.infer<
  typeof UserPreferencesResponseSchema
>;

// ============================================
// Update Profile Schema
// ============================================

export const UpdateProfileRequestSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  full_name: z.string().optional(),
  email: z.string().optional(),
  mobile: z.string().optional(),
  gender: z.string().optional(),
  dob: z.string().optional(),
  communities: z.array(z.string()).optional(),
});
export type UpdateProfileRequest = z.infer<typeof UpdateProfileRequestSchema>;

export const UpdateProfileImageRequestSchema = z.object({
  profile: z.unknown(),
  user_id: z.string(),
});
export type UpdateProfileImageRequest = z.infer<
  typeof UpdateProfileImageRequestSchema
>;

export const UpdateProfileImageResponseSchema = ApiResponseSchema(
  z
    .object({
      profile_pic: z.string().optional(),
    })
    .passthrough(),
);

export const CoverPicResponseSchema = ApiResponseSchema(
  z.object({
    cover_pic: z.string().nullable(),
  }),
);
export type CoverPicResponse = z.infer<typeof CoverPicResponseSchema>;

export const EditProfileFormSchema = z
  .object({
    full_name: z.string().trim().optional(),
    email: z
      .string()
      .trim()
      .optional()
      .refine((value) => !value || z.email().safeParse(value).success, {
        message: "Enter a valid email",
      }),
    mobile: z
      .string()
      .trim()
      .optional()
      .refine(
        (value) => !value || (/^\+?[0-9]+$/.test(value) && value.length >= 10),
        "Enter a valid mobile number",
      )
      .refine(
        (value) => !value || value.length <= 15,
        "Mobile number is too long",
      ),
    gender: z.string().trim().optional(),
    dob: z.string().trim().optional(),
    communities: z.array(z.string()).optional(),
    country_id: z.string().trim().optional(),
    state_id: z.string().trim().optional(),
    district_id: z.string().trim().optional(),
    org_id: z.string().trim().optional(),
    department_id: z.string().trim().optional(),
    has_college_changes: z.boolean().optional(),
    profile_pic: z.instanceof(File).optional(),
  })
  .superRefine((values, ctx) => {
    if (!values.has_college_changes) return;

    if (!values.district_id?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["district_id"],
        message: "District is required",
      });
    }

    if (!values.org_id?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["org_id"],
        message: "College / School is required",
      });
    }

    if (!values.department_id?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["department_id"],
        message: "Department is required",
      });
    }
  });
export type EditProfileFormValues = z.infer<typeof EditProfileFormSchema>;

const IdSchema = StringIdSchema;

export const OptionSchema = z.object({
  id: IdSchema,
  title: z.string().optional(),
  name: z.string().optional(),
  location: z.string().optional(),
});
export type Option = z.infer<typeof OptionSchema>;

export const CommunitiesResponseSchema = ApiResponseSchema(
  z.object({
    communities: z.array(OptionSchema),
  }),
);

export const CountriesResponseSchema = ApiResponseSchema(
  z.object({
    countries: z.array(
      z.object({
        id: IdSchema,
        name: z.string(),
      }),
    ),
  }),
);

export const StatesResponseSchema = ApiResponseSchema(
  z.object({
    states: z.array(
      z.object({
        id: IdSchema,
        name: z.string(),
      }),
    ),
  }),
);

export const DistrictsResponseSchema = ApiResponseSchema(
  z.object({
    districts: z.array(
      z.object({
        id: IdSchema,
        name: z.string(),
      }),
    ),
  }),
);

export const CollegesByDistrictResponseSchema = ApiResponseSchema(
  z.object({
    colleges: z.array(
      z.object({
        id: IdSchema,
        title: z.string(),
      }),
    ),
    departments: z.array(
      z.object({
        id: IdSchema,
        title: z.string(),
      }),
    ),
  }),
);

export const SchoolsByDistrictResponseSchema = ApiResponseSchema(
  z.object({
    schools: z.array(
      z.object({
        id: IdSchema,
        title: z.string(),
      }),
    ),
  }),
);

export const LocationOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
});
export type LocationOption = z.infer<typeof LocationOptionSchema>;

// ============================================
// Toggle Public Profile Schema
// ============================================

export const TogglePublicProfileRequestSchema = z.object({
  is_public: z.boolean(),
});
export type TogglePublicProfileRequest = z.infer<
  typeof TogglePublicProfileRequestSchema
>;

// ============================================
// Generic Success Response
// ============================================

export const EmptyResponseSchema = ApiResponseSchema(z.object({}));
export type EmptyResponse = z.infer<typeof EmptyResponseSchema>;
