/**
 * Settings API Functions
 *
 * 📍 src/features/settings/api/settings.api.ts
 *
 * All settings-related API calls go through here.
 * NO direct fetch calls in components or hooks.
 * NO React dependencies - this is pure data layer.
 *
 * Pattern: Validate full response, extract and return inner data.
 */
import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";

import {
  type ChangeOrganizationResponse,
  ChangeOrganizationResponseSchema,
  type ChangePasswordResponse,
  ChangePasswordResponseSchema,
  CollegeSearchResponseSchema,
  DepartmentSearchResponseSchema,
} from "@/features/settings";

export async function changePassword(payload: {
  current_password: string;
  password: string;
}): Promise<ChangePasswordResponse> {
  const endpoint = endpoints.password.change;

  const res = await apiClient.post(
    endpoint,
    payload,
    ChangePasswordResponseSchema,
  );

  return res;
}

export async function changeOrganization(payload: {
  organization: string;
  department: string;
  graduation_year?: number;
}): Promise<ChangeOrganizationResponse> {
  const endpoint = endpoints.onboarding.selectOrganization;

  const res = await apiClient.post(
    endpoint,
    payload,
    ChangeOrganizationResponseSchema,
  );

  return res;
}

export function searchColleges(search: string) {
  const query = new URLSearchParams({ search, perPage: "20" });
  return apiClient.get(
    `${endpoints.search.colleges}?${query}`,
    CollegeSearchResponseSchema,
  );
}

export function searchDepartments(search: string) {
  const query = new URLSearchParams({ search, perPage: "20" });
  return apiClient.get(
    `${endpoints.onboarding.departments}?${query}`,
    DepartmentSearchResponseSchema,
  );
}
