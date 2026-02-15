// src/features/manage-users/api/manageUsers.api.ts

import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { env } from "../../../../config/env";
import { authStore } from "../../../lib/auth";
import {
  AreasOfInterestResponseSchema,
  CollegeListResponseSchema,
  CommunitiesResponseSchema,
  CountriesResponseSchema,
  DistrictsResponseSchema,
  LocationSearchResponseSchema,
  ManageUserDetailResponseSchema,
  ManageUserMutationResponseSchema,
  ManageUsersListResponseSchema,
  RolesResponseSchema,
  SchoolListResponseSchema,
  StatesResponseSchema,
} from "../schemas";

function withQuery(
  endpoint: string,
  params?: Record<string, string | number | undefined>,
) {
  if (!params) return endpoint;
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== "") qs.set(k, String(v));
  });
  return qs.toString() ? `${endpoint}?${qs.toString()}` : endpoint;
}

function isMessageParserError(error: unknown) {
  return (
    error instanceof Error &&
    error.message.includes("toLowerCase is not a function")
  );
}

async function directUpdateManageUser(
  id: string,
  payload: Record<string, unknown>,
) {
  const token = authStore.getAccessToken();
  const res = await fetch(
    `${env.NEXT_PUBLIC_DJANGO_API_URL}${endpoints.manageUsers.update(id)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    },
  );

  const rawData = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      rawData &&
      typeof rawData === "object" &&
      "message" in rawData &&
      rawData.message
        ? JSON.stringify(rawData.message)
        : "Failed to update user";
    throw new Error(message);
  }

  const parsed = ManageUserMutationResponseSchema.safeParse(rawData);
  if (!parsed.success) {
    throw new Error("Invalid API response");
  }
  return parsed.data.response;
}

// ============================================
// Users
// ============================================

/** GET - List users */
export async function getManageUsers(params?: {
  perPage?: number;
  pageIndex?: number;
  search?: string;
  sortBy?: string;
}) {
  const endpoint = withQuery(endpoints.manageUsers.list, params);
  const response = await apiClient.get(endpoint, ManageUsersListResponseSchema);
  return response.response;
}

/** GET - User details by id */
export async function getManageUserById(id: string) {
  const response = await apiClient.get(
    endpoints.manageUsers.detail(id),
    ManageUserDetailResponseSchema,
  );
  return response.response;
}

/** PATCH - Update user */
export async function updateManageUser(
  id: string,
  payload: Record<string, unknown>,
) {
  try {
    const response = await apiClient.patch(
      endpoints.manageUsers.update(id),
      payload,
      ManageUserMutationResponseSchema,
    );
    return response.response;
  } catch (error) {
    if (isMessageParserError(error)) {
      return directUpdateManageUser(id, payload);
    }
    throw error;
  }
}

/** DELETE - Delete user */
export async function deleteManageUser(id: string) {
  const response = await apiClient.delete(
    endpoints.manageUsers.delete(id),
    ManageUserMutationResponseSchema,
  );
  return response.response;
}

/** GET - Users CSV export */
export async function getManageUsersCsv() {
  const token = authStore.getAccessToken();
  const res = await fetch(
    `${env.NEXT_PUBLIC_DJANGO_API_URL}${endpoints.manageUsers.csv}`,
    {
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    },
  );

  if (!res.ok) throw new Error("Failed to download users CSV");
  return res.blob();
}

// ============================================
// Meta data for Manage Users form
// ============================================

/** GET - Communities */
export async function getCommunities() {
  const response = await apiClient.get(
    endpoints.manageUsers.communities,
    CommunitiesResponseSchema,
  );
  return response.response.communities;
}

/** GET - Roles */
export async function getRoles() {
  const response = await apiClient.get(
    endpoints.manageUsers.roles,
    RolesResponseSchema,
  );
  return response.response.roles;
}

/** GET - Areas of interest */
export async function getAreasOfInterest() {
  const response = await apiClient.get(
    endpoints.manageUsers.areasOfInterest,
    AreasOfInterestResponseSchema,
  );
  return response.response.aois;
}

/** POST - Colleges by district */
export async function getCollegesByDistrict(district: string) {
  const response = await apiClient.post(
    endpoints.manageUsers.collegesByDistrict,
    { district },
    CollegeListResponseSchema,
  );
  return response.response;
}

/** POST - Schools by district */
export async function getSchoolsByDistrict(district: string) {
  const response = await apiClient.post(
    endpoints.manageUsers.schoolsByDistrict,
    { district },
    SchoolListResponseSchema,
  );
  return response.response.schools;
}

/** GET - Location search */
export async function searchLocations(param: string) {
  const response = await apiClient.get(
    endpoints.manageUsers.locationSearch(param || "india"),
    LocationSearchResponseSchema,
  );
  return response.response;
}

/** GET - Countries */
export async function getCountries() {
  const response = await apiClient.get(
    endpoints.location.countries,
    CountriesResponseSchema,
  );
  return response.response.countries;
}

/** POST - States by country id */
export async function getStates(country: string) {
  const response = await apiClient.post(
    endpoints.location.states,
    { country },
    StatesResponseSchema,
  );
  return response.response.states;
}

/** POST - Districts by state id */
export async function getDistricts(state: string) {
  const response = await apiClient.post(
    endpoints.location.districts,
    { state },
    DistrictsResponseSchema,
  );
  return response.response.districts;
}
