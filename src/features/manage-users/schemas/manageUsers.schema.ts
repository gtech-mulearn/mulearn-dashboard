/**
 * Manage Users Feature Schemas
 *
 * 📍 src/features/manage-users/schemas/manageUsers.schema.ts
 */

import { z } from "zod";

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    hasError: z.boolean(),
    statusCode: z.number(),
    message: z.record(z.string(), z.array(z.string())).optional(),
    response: dataSchema,
  });

// ============================================
// Shared
// ============================================

export const IdSchema = z.union([z.string(), z.number()]);

// ============================================
// /api/v1/dashboard/user/ (GET list)
// /api/v1/dashboard/user/ (POST create)
// /api/v1/dashboard/user/{id}/ (GET/PATCH/DELETE)
// ============================================

export const ManageUserListItemSchema = z.object({
  id: IdSchema,
  full_name: z.string().optional(),
  email: z.string().optional(),
  mobile: z.string().nullable().optional(),
  discord_id: z.string().nullable().optional(),
  muid: z.string().optional(),
  karma: z.number().nullable().optional(),
  level: z.union([z.string(), z.number()]).nullable().optional(),
  created_at: z.string().optional(),
  college: z.string().nullable().optional(),
  company: z.string().nullable().optional(),
});

export type ManageUserListItem = z.infer<typeof ManageUserListItemSchema>;

export const ManageUsersListDataSchema = z.object({
  data: z.array(ManageUserListItemSchema),
  pagination: z
    .object({
      totalPages: z.number(),
      pageIndex: z.number().optional(),
      perPage: z.number().optional(),
      totalCount: z.number().optional(),
    })
    .passthrough(),
});

export type ManageUsersListData = z.infer<typeof ManageUsersListDataSchema>;

export const ManageUsersListResponseSchema = ApiResponseSchema(
  ManageUsersListDataSchema,
);
export type ManageUsersListResponse = z.infer<
  typeof ManageUsersListResponseSchema
>;

export const UserOrganizationSchema = z.object({
  org: IdSchema,
  org_type: z.string().optional(),
  department: IdSchema.nullable().optional(),
  graduation_year: z.union([z.string(), z.number()]).nullable().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  district: z.string().optional(),
});

export type UserOrganization = z.infer<typeof UserOrganizationSchema>;

export const ManageUserDetailSchema = z.object({
  id: IdSchema,
  full_name: z.string(),
  email: z.string(),
  mobile: z.string().nullable().optional(),
  discord_id: z.string().nullable().optional(),
  district: z.string().optional(),
  role: z.array(IdSchema).optional(),
  interest_groups: z.array(IdSchema).optional(),
  organizations: z.array(UserOrganizationSchema).optional(),
});

export type ManageUserDetail = z.infer<typeof ManageUserDetailSchema>;

export const ManageUserDetailResponseSchema = ApiResponseSchema(
  ManageUserDetailSchema,
);
export type ManageUserDetailResponse = z.infer<
  typeof ManageUserDetailResponseSchema
>;

// For create / patch / delete endpoints where backend response body may vary
export const ManageUserMutationResponseSchema = ApiResponseSchema(z.unknown());
export type ManageUserMutationResponse = z.infer<
  typeof ManageUserMutationResponseSchema
>;

// ============================================
// /api/v1/dashboard/user/csv/ (GET)
// ============================================

export const UsersCsvResponseSchema = z.union([
  z.string(), // raw csv text
  z.instanceof(Blob), // browser blob
]);

export type UsersCsvResponse = z.infer<typeof UsersCsvResponseSchema>;

// ============================================
// /api/v1/register/community/list/ (GET)
// ============================================

export const CommunitySchema = z.object({
  id: IdSchema,
  title: z.string(),
});

export type Community = z.infer<typeof CommunitySchema>;

export const CommunitiesResponseSchema = ApiResponseSchema(
  z.object({
    communities: z.array(CommunitySchema),
  }),
);

export type CommunitiesResponse = z.infer<typeof CommunitiesResponseSchema>;

// ============================================
// /api/v1/register/role/list/ (GET)
// ============================================

export const RoleSchema = z.object({
  id: IdSchema,
  title: z.string(),
});

export type Role = z.infer<typeof RoleSchema>;

export const RolesResponseSchema = ApiResponseSchema(
  z.object({
    roles: z.array(RoleSchema),
  }),
);

export type RolesResponse = z.infer<typeof RolesResponseSchema>;

// ============================================
// /api/v1/register/area-of-interest/list/ (GET)
// ============================================

export const AreaOfInterestSchema = z.object({
  id: IdSchema,
  name: z.string(),
});

export type AreaOfInterest = z.infer<typeof AreaOfInterestSchema>;

export const AreasOfInterestResponseSchema = ApiResponseSchema(
  z.object({
    aois: z.array(AreaOfInterestSchema),
  }),
);

export type AreasOfInterestResponse = z.infer<
  typeof AreasOfInterestResponseSchema
>;

// ============================================
// /api/v1/register/college/list/ (POST)
// /api/v1/register/schools/list/ (POST)
// ============================================

export const CollegeSchema = z.object({
  id: IdSchema,
  title: z.string(),
});

export type College = z.infer<typeof CollegeSchema>;

export const DepartmentSchema = z.object({
  id: IdSchema,
  title: z.string(),
});

export type Department = z.infer<typeof DepartmentSchema>;

export const CollegeListResponseSchema = ApiResponseSchema(
  z.object({
    colleges: z.array(CollegeSchema),
    departments: z.array(DepartmentSchema),
  }),
);

export type CollegeListResponse = z.infer<typeof CollegeListResponseSchema>;

export const SchoolSchema = z.object({
  id: IdSchema,
  title: z.string(),
});

export type School = z.infer<typeof SchoolSchema>;

export const SchoolListResponseSchema = ApiResponseSchema(
  z.object({
    schools: z.array(SchoolSchema),
  }),
);

export type SchoolListResponse = z.infer<typeof SchoolListResponseSchema>;

// ============================================
// /api/v1/register/location/?q={param} (GET)
// ============================================

export const LocationItemSchema = z.object({
  id: IdSchema,
  location: z.string(),
});

export type LocationItem = z.infer<typeof LocationItemSchema>;

export const LocationSearchResponseSchema = ApiResponseSchema(
  z.array(LocationItemSchema),
);

export type LocationSearchResponse = z.infer<
  typeof LocationSearchResponseSchema
>;
