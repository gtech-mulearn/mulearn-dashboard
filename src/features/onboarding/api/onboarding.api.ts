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
  CollegesResponseSchema,
  CompaniesResponseSchema,
  type CreateOrganizationRequest,
  CreateOrganizationResponseSchema,
  DepartmentsResponseSchema,
  RolesResponseSchema,
  SelectDomainsResponseSchema,
  SelectEndgoalsResponseSchema,
  type SelectOrganizationRequest,
  SelectOrganizationResponseSchema,
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
 * Fetch list of departments
 */
export function fetchDepartments() {
  return apiClient.get(
    endpoints.onboarding.departments,
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
  return apiClient.post(
    endpoints.onboarding.createOrganization,
    data,
    CreateOrganizationResponseSchema,
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
