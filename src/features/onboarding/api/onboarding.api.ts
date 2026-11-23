/**
 * Onboarding API Functions
 *
 * 📍 src/features/onboarding/api/onboarding.api.ts
 *
 * All onboarding-related API calls.
 */

import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import {
  CollegeSearchResponseSchema,
  CollegesResponseSchema,
  CommunitiesResponseSchema,
  CompaniesResponseSchema,
  CountriesResponseSchema,
  type CreateOrganizationRequest,
  CreateOrganizationResponseSchema,
  DepartmentsResponseSchema,
  DistrictSearchResponseSchema,
  DistrictsResponseSchema,
  RolesResponseSchema,
  SchoolsResponseSchema,
  SelectDomainsResponseSchema,
  SelectEndgoalsResponseSchema,
  type SelectOrganizationRequest,
  SelectOrganizationResponseSchema,
  StatesResponseSchema,
} from "../schemas";

// ============================================
// Organization Data Fetching
// ============================================

/**
 * Fetch list of colleges
 */
export function fetchColleges() {
  return apiClient.get(endpoints.onboarding.colleges, CollegesResponseSchema);
}

/**
 * Server-side search of colleges by name
 */
export function searchColleges(search: string) {
  const query = new URLSearchParams({ search, perPage: "20" });
  return apiClient.get(
    `${endpoints.search.colleges}?${query}`,
    CollegeSearchResponseSchema,
  );
}

/**
 * Fetch list of departments
 */
export function fetchDepartments() {
  return apiClient.get(
    endpoints.onboarding.departments,
    DepartmentsResponseSchema,
  );
}

/**
 * Server-side search of departments by name
 */
export function searchDepartments(search: string) {
  const query = new URLSearchParams({ search, perPage: "20" });
  return apiClient.get(
    `${endpoints.onboarding.departments}?${query}`,
    DepartmentsResponseSchema,
  );
}

/**
 * Fetch list of companies
 */
export function fetchCompanies() {
  return apiClient.get(endpoints.onboarding.companies, CompaniesResponseSchema);
}

/**
 * Search districts by name (public). Returns "District, State, Country" labels.
 */
export function searchDistricts(query: string) {
  return apiClient.get(
    endpoints.onboarding.location(encodeURIComponent(query)),
    DistrictSearchResponseSchema,
  );
}

/**
 * Fetch schools in a district (public)
 */
export function fetchSchoolsByDistrict(districtId: string) {
  return apiClient.post(
    endpoints.location.schools,
    { district: districtId },
    SchoolsResponseSchema,
  );
}

/**
 * Fetch list of communities
 */
export function fetchCommunities() {
  return apiClient.get(
    endpoints.onboarding.communities,
    CommunitiesResponseSchema,
  );
}

/**
 * Fetch list of roles
 */
export function fetchRoles() {
  return apiClient.get(endpoints.onboarding.roles, RolesResponseSchema);
}

// ============================================
// Organization Selection
// ============================================

/**
 * Select an existing organization (college or company)
 */
export function selectOrganization(data: SelectOrganizationRequest) {
  return apiClient.post(
    endpoints.onboarding.selectOrganization,
    data,
    SelectOrganizationResponseSchema,
  );
}

/**
 * Create a new organization if not in list
 */
export function createOrganization(data: CreateOrganizationRequest) {
  // Remove undefined fields to avoid sending them to the API
  const cleanedData = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined),
  ) as CreateOrganizationRequest;

  return apiClient.post(
    endpoints.onboarding.createOrganization,
    cleanedData,
    CreateOrganizationResponseSchema,
  );
}

// ============================================
// Location Cascading
// ============================================

/**
 * Fetch list of countries (GET — no params)
 */
export function fetchCountries() {
  return apiClient.get(endpoints.location.countries, CountriesResponseSchema);
}

/**
 * Fetch states for a given country UUID
 * POST /api/v1/register/state/list/ { country: countryId }
 */
export function fetchStates(countryId: string) {
  return apiClient.post(
    endpoints.location.states,
    { country: countryId },
    StatesResponseSchema,
  );
}

/**
 * Fetch districts for a given state UUID
 * POST /api/v1/register/district/list/ { state: stateId }
 */
export function fetchDistricts(stateId: string) {
  return apiClient.post(
    endpoints.location.districts,
    { state: stateId },
    DistrictsResponseSchema,
  );
}

// ============================================
// Interests/Pathway Selection
// ============================================

/**
 * Submit selected pathways/domains
 */
export function selectDomains(domains: string[]) {
  return apiClient.post(
    endpoints.onboarding.selectDomains,
    { domains },
    SelectDomainsResponseSchema,
  );
}

/**
 * Submit selected endgoals
 */
export function selectEndgoals(endgoals: string[]) {
  return apiClient.post(
    endpoints.onboarding.selectEndgoals,
    { endgoals },
    SelectEndgoalsResponseSchema,
  );
}
