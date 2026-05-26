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
  // Advanced options
  karma_reward?: number | null;
  duration_value?: number | null;
  duration_unit?: string | null;
  hourly_rate?: string | null;
  deliverables?: string[] | string | null;
  stipend?: string | null;
  certificate_provided?: boolean | null;
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

export interface PublicJob {
  id: string;
  title: string;
  job_type: string;
  location: string;
  experience?: string | null;
  job_description?: string | null;
  salary_range?: string | null;
  min_karma: number;
  min_level: number;
  status: string;
  created_at: string;
  updated_at: string;
  karma_reward?: number | null;
  duration_value?: number | null;
  duration_unit?: string | null;
  hourly_rate?: string | null;
  deliverables?: string[] | null;
  stipend?: string | null;
  certificate_provided?: boolean | null;
  rules: JobRule[];
}

export interface LearnerApplication {
  id: string;
  status: "applied" | "shortlisted" | "accepted" | "rejected";
  cover_note?: string | null;
  job_title: string;
  job_type: string;
  company_name: string;
  company_id: string;
  created_at: string;
  updated_at: string;
}

export interface JobApplicant {
  id: string;
  status: "applied" | "shortlisted" | "accepted" | "rejected";
  cover_note?: string | null;
  applicant_id: string;
  full_name: string;
  muid: string;
  district?: string | null;
  karma: number;
  level: { id: string; name: string; level_order: number };
  reviewed_by_id?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface LearnerProfile {
  id: string;
  muid: string;
  full_name: string;
  gender?: string | null;
  district?: string | null;
  karma: number;
  level: { id: string; name: string; level_order: number };
  interest_groups: { id: string; name: string }[];
  interested_in_work: boolean;
  interested_in_gig_work: boolean;
}

export interface PublicJobsResponse {
  jobs: PublicJob[];
  pagination: Pagination;
}

export interface LearnerApplicationsResponse {
  applications: LearnerApplication[];
  pagination: Pagination;
}

export interface JobApplicantsResponse {
  job_id: string;
  job_title: string;
  applicants: JobApplicant[];
  pagination: Pagination;
}

export interface LearnerDiscoveryResponse {
  learners: LearnerProfile[];
  pagination: Pagination;
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
  // Advanced options
  karma_reward?: number;
  duration_value?: number;
  duration_unit?: string;
  hourly_rate?: string;
  deliverables?: string[];
  stipend?: string;
  certificate_provided?: boolean;
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
  // Advanced options
  karma_reward?: number;
  duration_value?: number;
  duration_unit?: string;
  hourly_rate?: string;
  deliverables?: string[];
  stipend?: string;
  certificate_provided?: boolean;
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

export interface ApplyJobResponse {
  application_id: string;
  job_id: string;
  job_title: string;
  status: string;
  applied_at: string;
}

export interface UpdateApplicantStatusResponse {
  application_id: string;
  applicant_id: string;
  new_status: string;
  reviewed_by: string;
  reviewed_at: string;
}

// ─── Company Profile Sub-types ──────────────────────────────

export interface CompanyTestimonial {
  learner_name: string;
  role: string;
  quote: string;
  author_avatar?: string;
  author_level?: string;
  author_ig?: string;
  id?: string;
  created_at?: string;
}

export interface CompanyGalleryItem {
  image_url: string;
  caption?: string;
  sort_order?: number;
}

// ─── Company Profile ────────────────────────────────────────

export interface CompanyProfile {
  id: string;
  name: string;
  status?: string;
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
  registration_number?: string | null;
  tax_id?: string | null;
  verification_document_url?: string | null;
  // Extended profile fields (new backend fields — optional for backwards compat)
  founded_year?: number | null;
  remote_policy?: string | null;
  culture_text?: string | null;
  tech_stack?: string[];
  perks?: string[];
  testimonials?: CompanyTestimonial[];
  gallery?: CompanyGalleryItem[];
  hire_count?: number;
  alumni_count?: number;
  avg_karma_of_hires?: number;
  campus_events_count?: number;
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

export interface LearnerDiscoveryParams {
  karma_min?: number;
  karma_max?: number;
  ig_ids?: string;
  achievement_ids?: string;
  level_order_min?: number;
  interested_in_work?: boolean;
  interested_in_gig_work?: boolean;
  search?: string;
  sortBy?: string;
  pageIndex?: number;
  perPage?: number;
}
