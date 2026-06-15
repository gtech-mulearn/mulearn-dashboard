import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import {
  CollegesByDistrictResponseSchema,
  CommunitiesResponseSchema,
  CountriesResponseSchema,
  DistrictsResponseSchema,
  GenericMutationResponseSchema,
  InterestsResponseSchema,
  LocationSearchResponseSchema,
  type ManageUserDetail,
  ManageUserDetailResponseSchema,
  type ManageUsersListData,
  ManageUsersListResponseSchema,
  RolesResponseSchema,
  SchoolsByDistrictResponseSchema,
  StatesResponseSchema,
  type UiOption,
  type UpdateManageUserPayload,
  type AssignRolePayload,
  AssignRoleResponseSchema,
} from "../schemas";

interface ManageUsersListParams {
  pageIndex: number;
  perPage: number;
  search?: string;
  sortBy?: string;
}

function toOption(item: {
  id: string;
  title?: string;
  name?: string;
  location?: string;
}): UiOption {
  return {
    value: item.id,
    label: item.title ?? item.name ?? item.location ?? item.id,
  };
}

function sortOptions(options: UiOption[]): UiOption[] {
  return [...options].sort((a, b) => a.label.localeCompare(b.label));
}

export async function fetchManageUsers(
  params: ManageUsersListParams,
): Promise<ManageUsersListData> {
  const query = new URLSearchParams({
    perPage: String(params.perPage),
    pageIndex: String(params.pageIndex),
  });

  if (params.search?.trim()) {
    query.set("search", params.search.trim());
  }

  if (params.sortBy?.trim()) {
    query.set("sortBy", params.sortBy.trim());
  }

  const response = await apiClient.get(
    `${endpoints.manageUsers.list}?${query.toString()}`,
    ManageUsersListResponseSchema,
  );

  return {
    ...response.response,
    data: response.response.data.map((user) => ({
      ...user,
      college: user.college ?? user.company ?? user.college,
    })),
  };
}

export async function fetchManageUserDetail(
  id: string,
): Promise<ManageUserDetail> {
  const response = await apiClient.get(
    endpoints.manageUsers.detail(id),
    ManageUserDetailResponseSchema,
  );

  const res = response.response as Record<string, any>;
  return {
    ...(res as any),
    message: res.message ?? "Success",
    intern_guild_created: res.intern_guild_created,
    mentor_profile_created: res.mentor_profile_created,
  } as ManageUserDetail;
}

export async function updateManageUser(
  id: string,
  payload: UpdateManageUserPayload,
): Promise<void> {
  await apiClient.patch(
    endpoints.manageUsers.update(id),
    payload,
    GenericMutationResponseSchema,
  );
}

export async function deleteManageUser(id: string): Promise<void> {
  await apiClient.delete(
    endpoints.manageUsers.delete(id),
    GenericMutationResponseSchema,
  );
}

export async function fetchCommunities(): Promise<UiOption[]> {
  const response = await apiClient.get(
    endpoints.manageUsers.communities,
    CommunitiesResponseSchema,
  );

  return sortOptions(response.response.communities.map(toOption));
}

export async function fetchRoles(): Promise<UiOption[]> {
  const response = await apiClient.get(
    endpoints.manageUsers.roles,
    RolesResponseSchema,
  );
  return sortOptions(response.response.roles.map(toOption));
}

export async function UserRoles(user_id: string): Promise<UiOption[]> {
  if (!user_id) return [];
  const response = await apiClient.post(
    endpoints.manageUsers.userRoles,
    { user_id },
    RolesResponseSchema,
  );

  return sortOptions(response.response.roles.map(toOption));
}

export async function fetchInterests(): Promise<UiOption[]> {
  const response = await apiClient.get(
    endpoints.manageUsers.areasOfInterest,
    InterestsResponseSchema,
  );

  return sortOptions(response.response.aois.map(toOption));
}

export async function searchLocations(queryText: string): Promise<UiOption[]> {
  const response = await apiClient.get(
    endpoints.manageUsers.locationSearch(queryText || "india"),
    LocationSearchResponseSchema,
  );

  return sortOptions(
    response.response.map((item) => ({
      value: item.id,
      label: item.location,
    })),
  );
}

export async function fetchCountries(): Promise<UiOption[]> {
  const response = await apiClient.get(
    endpoints.location.countries,
    CountriesResponseSchema,
  );
  return sortOptions(
    response.response.countries.map((country) => ({
      value: country.id,
      label: country.name,
    })),
  );
}

export async function fetchStates(countryId: string): Promise<UiOption[]> {
  if (!countryId) return [];

  const response = await apiClient.post(
    endpoints.location.states,
    { country: countryId },
    StatesResponseSchema,
  );

  return sortOptions(
    response.response.states.map((state) => ({
      value: state.id,
      label: state.name,
    })),
  );
}

export async function fetchDistricts(stateId: string): Promise<UiOption[]> {
  if (!stateId) return [];

  const response = await apiClient.post(
    endpoints.location.districts,
    { state: stateId },
    DistrictsResponseSchema,
  );

  return sortOptions(
    response.response.districts.map((district) => ({
      value: district.id,
      label: district.name,
    })),
  );
}

export async function fetchCollegesAndDepartments(districtId: string): Promise<{
  colleges: UiOption[];
  departments: UiOption[];
}> {
  const [collegesResponse, schoolsResponse] = await Promise.all([
    apiClient.post(
      endpoints.manageUsers.collegesByDistrict,
      { district: districtId || "" },
      CollegesByDistrictResponseSchema,
    ),
    apiClient.post(
      endpoints.manageUsers.schoolsByDistrict,
      { district: districtId || "" },
      SchoolsByDistrictResponseSchema,
    ),
  ]);

  const colleges = collegesResponse.response.colleges.map((college) => ({
    value: college.id,
    label: college.title,
  }));

  const schools = schoolsResponse.response.schools.map((school) => ({
    value: school.id,
    label: school.title,
  }));

  const departments = collegesResponse.response.departments.map(
    (department) => ({
      value: department.id,
      label: department.title,
    }),
  );

  return {
    colleges: sortOptions([...colleges, ...schools]),
    departments: sortOptions(departments),
  };
}

export async function assignUserRole(payload: AssignRolePayload): Promise<{
  message: string;
  intern_guild_created?: boolean;
  mentor_profile_created?: boolean;
}> {
  const response = await apiClient.post(
    endpoints.manageUsers.userRoles,
    payload,
    AssignRoleResponseSchema,
  );
  const res = response.response as Record<string, any>;
  return {
    message: res.message ?? "Success",
    intern_guild_created: res.intern_guild_created,
    mentor_profile_created: res.mentor_profile_created,
  };
}
