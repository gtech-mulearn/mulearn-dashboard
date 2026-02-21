/**
 * Onboarding Feature Schemas
 *
 * 📍 src/features/onboarding/schemas/organization.schema.ts
 *
 * Zod schemas for organization selection during onboarding.
 */

import { z } from "zod";
import { ApiResponseSchema } from "@/lib/schemas/api-response";

export { ApiResponseSchema };

// ============================================
// College/Organization Schemas (flexible field names)
// ============================================

export const CollegeSchema = z
  .object({
    id: z.string(),
    title: z.string(),
  })
  .passthrough();

export const CollegesResponseSchema = ApiResponseSchema(
  z.object({ colleges: z.array(CollegeSchema) }).passthrough(),
);

export const DepartmentSchema = z
  .object({
    id: z.string(),
    title: z.string(),
  })
  .passthrough();

export const DepartmentsResponseSchema = ApiResponseSchema(
  z.object({ departments: z.array(DepartmentSchema) }).passthrough(),
);

export const CompanySchema = z
  .object({
    id: z.string(),
    title: z.string(),
  })
  .passthrough();

export const CompaniesResponseSchema = ApiResponseSchema(
  z.object({ companies: z.array(CompanySchema) }).passthrough(),
);

export const RoleSchema = z
  .object({
    id: z.string(),
    title: z.string(),
  })
  .passthrough();

export const RolesResponseSchema = ApiResponseSchema(
  z.object({ roles: z.array(RoleSchema) }).passthrough(),
);

// ============================================
// Organization Selection Request
// ============================================

export const SelectOrganizationRequestSchema = z.object({
  organization: z.string().nullable(),
  department: z.string().nullable().optional(),
  graduation_year: z.number().nullable().optional(),
  is_student: z.boolean(),
});

export const SelectOrganizationResponseSchema = ApiResponseSchema(z.object({}));

// ============================================
// Create Organization Request
// ============================================

export const CreateOrganizationRequestSchema = z.object({
  title: z.string().min(3, "Organization name must be at least 3 characters"),
  org_type: z.string().nullable().optional(),
  department: z.string().nullable().optional(),
  graduation_year: z.number().nullable().optional(),
});

export const CreateOrganizationResponseSchema = ApiResponseSchema(z.object({}));

// ============================================
// Derived Types
// ============================================

export type College = z.infer<typeof CollegeSchema>;
export type CollegesResponse = z.infer<typeof CollegesResponseSchema>;

export type Department = z.infer<typeof DepartmentSchema>;
export type DepartmentsResponse = z.infer<typeof DepartmentsResponseSchema>;

export type Company = z.infer<typeof CompanySchema>;
export type CompaniesResponse = z.infer<typeof CompaniesResponseSchema>;

export type Role = z.infer<typeof RoleSchema>;
export type RolesResponse = z.infer<typeof RolesResponseSchema>;

export type SelectOrganizationRequest = z.infer<
  typeof SelectOrganizationRequestSchema
>;
export type CreateOrganizationRequest = z.infer<
  typeof CreateOrganizationRequestSchema
>;
