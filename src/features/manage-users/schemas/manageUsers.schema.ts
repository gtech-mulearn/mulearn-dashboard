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
  org: IdSchema.nullable().optional(),
  org_type: z.string().nullable().optional(),
  department: IdSchema.nullable().optional(),
  graduation_year: z.union([z.string(), z.number()]).nullable().optional(),
  country: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  district: z.string().nullable().optional(),
});

export type UserOrganization = z.infer<typeof UserOrganizationSchema>;

export const ManageUserDetailSchema = z.object({
  id: IdSchema.optional(),
  full_name: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  mobile: z.string().nullable().optional(),
  discord_id: z.string().nullable().optional(),
  district: z.string().nullable().optional(),
  role: z.array(IdSchema).nullable().optional(),
  interest_groups: z.array(IdSchema).nullable().optional(),
  organizations: z.array(UserOrganizationSchema).nullable().optional(),
  communities: z.array(IdSchema).nullable().optional(),
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

// ============================================
// /api/v1/register/country/list/ (GET)
// /api/v1/register/state/list/ (POST)
// /api/v1/register/district/list/ (POST)
// ============================================

export const CountrySchema = z.object({
  id: IdSchema,
  name: z.string(),
});

export type Country = z.infer<typeof CountrySchema>;

export const CountriesResponseSchema = ApiResponseSchema(
  z.object({
    countries: z.array(CountrySchema),
  }),
);

export type CountriesResponse = z.infer<typeof CountriesResponseSchema>;

export const StateSchema = z.object({
  id: IdSchema,
  name: z.string(),
});

export type StateItem = z.infer<typeof StateSchema>;

export const StatesResponseSchema = ApiResponseSchema(
  z.object({
    states: z.array(StateSchema),
  }),
);

export type StatesResponse = z.infer<typeof StatesResponseSchema>;

export const DistrictSchema = z.object({
  id: IdSchema,
  name: z.string(),
});

export type DistrictItem = z.infer<typeof DistrictSchema>;

export const DistrictsResponseSchema = ApiResponseSchema(
  z.object({
    districts: z.array(DistrictSchema),
  }),
);

export type DistrictsResponse = z.infer<typeof DistrictsResponseSchema>;

// ============================================
// Manage Users Form (UI validation + payload mapping)
// ============================================

export const ManageUserOrganizationFormSchema = z.object({
  org_type: z.string().trim().optional(),
  org: z.string().trim().optional(),
  department: z.string().trim().optional(),
  graduation_year: z.string().trim().optional(),
  country: z.string().trim().optional(),
  state: z.string().trim().optional(),
  district: z.string().trim().optional(),
});

export type ManageUserOrganizationFormValues = z.infer<
  typeof ManageUserOrganizationFormSchema
>;

export const ManageUserFormSchema = z.object({
  full_name: z.string().trim().min(1, "Full name is required"),
  email: z.string().trim().email("Enter a valid email"),
  mobile: z.string().trim().optional(),
  discord_id: z.string().trim().optional(),
  role: z.array(z.string()).default([]),
  communities: z.array(z.string()).default([]),
  interest_groups: z.array(z.string()).default([]),
  location_query: z.string().trim().optional(),
  organization: ManageUserOrganizationFormSchema,
});

export type ManageUserFormValues = z.infer<typeof ManageUserFormSchema>;

function asOptionalString(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function normalizeIdArray(values: string[]) {
  return values.map((value) => value.trim()).filter(Boolean);
}

function buildOrganizationsPayload(
  organization: ManageUserOrganizationFormValues,
) {
  const org = asOptionalString(organization.org);
  if (!org) return undefined;

  const payload: Record<string, unknown> = { org };

  const orgType = asOptionalString(organization.org_type);
  if (orgType) {
    const lower = orgType.toLowerCase();
    payload.org_type =
      lower === "college" ? "College" : lower === "school" ? "School" : orgType;
  }

  const department = asOptionalString(organization.department);
  if (department) payload.department = department;

  const graduationYear = asOptionalString(organization.graduation_year);
  if (graduationYear) payload.graduation_year = graduationYear;

  const country = asOptionalString(organization.country);
  if (country) payload.country = country;

  const state = asOptionalString(organization.state);
  if (state) payload.state = state;

  const district = asOptionalString(organization.district);
  if (district) payload.district = district;

  return [payload];
}

export function toManageUserCreatePayload(form: ManageUserFormValues) {
  const payload: Record<string, unknown> = {
    full_name: form.full_name.trim(),
    email: form.email.trim(),
  };

  const mobile = asOptionalString(form.mobile);
  if (mobile) payload.mobile = mobile;

  const discordId = asOptionalString(form.discord_id);
  if (discordId) payload.discord_id = discordId;

  const roles = normalizeIdArray(form.role);
  if (roles.length > 0) payload.role = roles;

  const communities = normalizeIdArray(form.communities);
  if (communities.length > 0) payload.communities = communities;

  const interests = normalizeIdArray(form.interest_groups);
  if (interests.length > 0) payload.interest_groups = interests;

  const organizations = buildOrganizationsPayload(form.organization);
  if (organizations) payload.organizations = organizations;

  return payload;
}

function areStringArraysEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false;
  const as = [...a].sort();
  const bs = [...b].sort();
  return as.every((value, index) => value === bs[index]);
}

function areOrganizationsEqual(
  current: ManageUserOrganizationFormValues,
  initial: ManageUserOrganizationFormValues,
) {
  return (
    asOptionalString(current.org_type) === asOptionalString(initial.org_type) &&
    asOptionalString(current.org) === asOptionalString(initial.org) &&
    asOptionalString(current.department) ===
      asOptionalString(initial.department) &&
    asOptionalString(current.graduation_year) ===
      asOptionalString(initial.graduation_year) &&
    asOptionalString(current.country) === asOptionalString(initial.country) &&
    asOptionalString(current.state) === asOptionalString(initial.state) &&
    asOptionalString(current.district) === asOptionalString(initial.district)
  );
}

export function toManageUserUpdatePayload(
  form: ManageUserFormValues,
  detail?: ManageUserDetail | null,
) {
  const initial = toManageUserFormValues(detail);
  const payload: Record<string, unknown> = {};

  const fullName = asOptionalString(form.full_name);
  const initialFullName = asOptionalString(initial.full_name);
  if (fullName !== initialFullName && fullName) {
    payload.full_name = fullName;
  }

  const email = asOptionalString(form.email);
  const initialEmail = asOptionalString(initial.email);
  if (email !== initialEmail && email) {
    payload.email = email;
  }

  const mobile = asOptionalString(form.mobile);
  const initialMobile = asOptionalString(initial.mobile);
  if (mobile !== initialMobile && mobile) {
    payload.mobile = mobile;
  }

  const discordId = asOptionalString(form.discord_id);
  const initialDiscordId = asOptionalString(initial.discord_id);
  if (discordId !== initialDiscordId && discordId) {
    payload.discord_id = discordId;
  }

  const roles = normalizeIdArray(form.role);
  const initialRoles = normalizeIdArray(initial.role);
  if (!areStringArraysEqual(roles, initialRoles)) {
    payload.role = roles;
  }

  const communities = normalizeIdArray(form.communities);
  const initialCommunities = normalizeIdArray(initial.communities);
  if (!areStringArraysEqual(communities, initialCommunities)) {
    payload.communities = communities;
  }

  const interests = normalizeIdArray(form.interest_groups);
  const initialInterests = normalizeIdArray(initial.interest_groups);
  if (!areStringArraysEqual(interests, initialInterests)) {
    payload.interest_groups = interests;
  }

  if (!areOrganizationsEqual(form.organization, initial.organization)) {
    const organizations = buildOrganizationsPayload(form.organization);
    if (organizations) {
      payload.organizations = organizations;
    }
  }

  return payload;
}

export function toManageUserFormValues(
  detail?: ManageUserDetail | null,
): ManageUserFormValues {
  const org = detail?.organizations?.[0];
  const locationText = detail?.district ?? "";

  const parseLocationParts = (value: string) => {
    const parts = value
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);

    return {
      district: parts[0] ?? "",
      state: parts.length > 2 ? parts.slice(1, -1).join(", ") : "",
      country: parts.length > 1 ? parts[parts.length - 1] : "",
    };
  };

  const isUuidLike = (value?: string | null) =>
    !!value &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value.trim(),
    );

  const locationInput = isUuidLike(locationText) ? "" : locationText;

  return {
    full_name: detail?.full_name ?? "",
    email: detail?.email ?? "",
    mobile: detail?.mobile ?? "",
    discord_id: detail?.discord_id ?? "",
    role: (detail?.role ?? []).map((value) => String(value)),
    communities: (detail?.communities ?? []).map((value) => String(value)),
    interest_groups: (detail?.interest_groups ?? []).map((value) =>
      String(value),
    ),
    location_query: locationInput,
    organization: {
      org_type: org?.org_type ?? "",
      org: org?.org ? String(org.org) : "",
      department: org?.department ? String(org.department) : "",
      graduation_year: org?.graduation_year ? String(org.graduation_year) : "",
      // Keep backend IDs for cascading APIs (country -> state -> district).
      country: org?.country ?? "",
      state: org?.state ?? "",
      district: org?.district ?? "",
    },
  };
}
