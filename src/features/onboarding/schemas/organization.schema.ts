/**
 * Onboarding Feature Schemas
 *
 * 📍 src/features/onboarding/schemas/organization.schema.ts
 *
 * Zod schemas for organization selection during onboarding.
 */

import { z } from "zod";

// ============================================
// Organization Type Constants
// ============================================

export const ORG_TYPES = [
  { label: "College", value: "College" },
  { label: "Company", value: "Company" },
] as const;

export const ORG_TYPE_VALUES = ["College", "Company"] as const;

// ============================================
// Common Response Wrapper (flexible)
// ============================================

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    hasError: z.boolean(),
    statusCode: z.number(),
    message: z.any().optional(),
    response: dataSchema,
  });

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
  org_type: z.enum(ORG_TYPE_VALUES).optional(),
  department: z.string().optional(),
  graduation_year: z
    .union([z.string(), z.number()])
    .transform((val) => (typeof val === "number" ? val.toString() : val))
    .optional(),
});

export const CreateOrganizationResponseSchema = ApiResponseSchema(
  z
    .object({
      id: z.string().optional(),
    })
    .passthrough(),
);

// ============================================
// Create Company Request
// ============================================

export const CreateCompanyRequestSchema = z.object({
  name: z.string().min(3, "Company name must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  industry_sector: z.string().min(1, "Industry sector is required"),
  website_link: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  email: z.string().email("Please enter a valid email"),
  location: z.string().min(3, "Location must be at least 3 characters"),
});

export const CreateCompanyResponseSchema = ApiResponseSchema(
  z
    .object({
      id: z.string().optional(),
    })
    .passthrough(),
);

// ============================================
// Derived Types
// ============================================

export type OrganizationType = (typeof ORG_TYPE_VALUES)[number];

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

export type CreateCompanyRequest = z.infer<typeof CreateCompanyRequestSchema>;
