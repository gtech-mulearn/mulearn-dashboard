/**
 * Company Jobs — Type Definitions
 *
 * 📍 src/features/company-jobs/types/jobs.types.ts
 *
 * Pure TypeScript types — no imports from React, API, or any other layer.
 */

// ─── Enums / Unions ─────────────────────────────────────────

export type JobType =
  | "Full-Time"
  | "Part-Time"
  | "Internship"
  | "Contract"
  | "Freelance";

export type JobStatus = "Active" | "Inactive" | "Draft";

export type RuleType = "skill" | "interest_group" | "achievement";

export type CompanyStatus =
  | "active"
  | "pending_verification"
  | "rejected"
  | "inactive";

// ─── Core Entities ──────────────────────────────────────────

export interface JobRule {
  id: string;
  rule_type: string;
  rule_type_id: string;
  rule_name: string;
}

export interface Job {
  id: string;
  title: string;
  experience?: string | null;
  job_description?: string | null;
  job_type: string;
  location: string;
  salary_range: string;
  min_karma: number;
  min_level: number;
  status: string;
  created_at: string;
  updated_at: string;
  rules: JobRule[];
}

export interface Pagination {
  count: number;
  totalPages: number;
  isNext: boolean;
  isPrev: boolean;
  nextPage: number | null;
}

export interface JobsListResponse {
  company_id: string;
  company_name: string;
  jobs: Job[];
  pagination: Pagination;
}

export interface JobDetailResponse {
  job: Job;
}

// ─── API Payloads ───────────────────────────────────────────

export interface CreateJobPayload {
  title: string;
  experience: string;
  job_description: string;
  location: string;
  salary_range: string;
  job_type: string;
  min_karma: number;
  min_level: number;
}

export interface UpdateJobPayload {
  title?: string;
  experience?: string;
  job_description?: string;
  location?: string;
  salary_range?: string;
  job_type?: string;
  min_karma?: number;
  min_level?: number;
}

export interface CreateRulePayload {
  rule_type: string;
  rule_type_id: string;
}

export interface UpdateRulePayload {
  rule_type: string;
  rule_type_id: string;
}

// ─── API Mutation Responses ─────────────────────────────────

export interface CreateJobResponse {
  job: {
    id: string;
    company_id: string;
    title: string;
    job_type: string;
    created_at: string;
  };
}

export interface UpdateJobResponse {
  job_id: string;
  updated_fields: string[];
}

export interface DeleteJobResponse {
  job_id: string;
  deleted_at: string;
}

export interface CreateRuleResponse {
  job_rule: {
    id: string;
    job_id: string;
    rule_type: string;
    rule_type_id: string;
    created_at: string;
  };
}

export interface UpdateRuleResponse {
  rule_id: string;
  updated_value: string;
}

export interface DeleteRuleResponse {
  rule_id: string;
  job_id: string;
  deleted_at: string;
}

// ─── Company Profile ────────────────────────────────────────

export interface CompanyProfile {
  id: string;
  name: string;
  status: string;
  logo?: string | null;
  description?: string | null;
  industry_sector?: string | null;
  website_link?: string | null;
  email?: string | null;
  slug: string;
  location?: string | null;
  // Extended fields from the full backend schema
  company_size?: string | null;
  linkedin_url?: string | null;
  legal_name?: string | null;
  verified_at?: string | null;
  created_at?: string;
  // Frontend-only permission flags (not from API)
  can_edit_profile?: boolean;
  can_access_advanced_features?: boolean;
}

// ─── Stepper Types ──────────────────────────────────────────

export type StepId = "basic-info" | "requirements" | "rules" | "review";

export interface StepDefinition {
  id: StepId;
  label: string;
  description: string;
}

// ─── Query Parameter Types ──────────────────────────────────

export interface JobsListParams {
  pageIndex?: number;
  perPage?: number;
  search?: string;
  sortBy?: string;
}
