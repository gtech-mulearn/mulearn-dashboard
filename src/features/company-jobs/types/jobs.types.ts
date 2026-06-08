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

export type CompanyStatus = "verified" | "pending" | "rejected" | "inactive";

// ─── Core Entities ──────────────────────────────────────────

export interface JobRule {
  id: string;
  rule_type: string;
  rule_value: string;
}

export interface Job {
  id: string;
  title: string;
  experience?: string | null;
  job_description?: string | null;
  job_type: string;
  location: string;
  salary_range?: string | null;
  status: string;
  created_at: string;
  company_name?: string | null;
  company_logo?: string | null;
  updated_at: string;
  rules: JobRule[];
  // Advanced options

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
  company_id?: string;
  company_name?: string;
  jobs: Job[];
  pagination: Pagination;
}

export interface JobDetailResponse {
  job: Job;
}

export interface PublicJob {
  id: string;
  company_name?: string | null;
  company_logo?: string | null;
  title: string;
  job_type?: string | null;
  location?: string | null;
  experience?: string | null;
  job_description?: string | null;
  salary_range?: string | null;
  status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;

  duration_value?: number | null;
  duration_unit?: string | null;
  hourly_rate?: string | null;
  deliverables?: string[] | string | null;
  stipend?: string | null;
  certificate_provided?: boolean | null;
  rules: JobRule[];
}

export interface LearnerApplication {
  id: string;
  job: Job;
  resume_link?: string | null;
  cover_letter?: string | null;
  status: string;
  rejection_reason?: string | null;
  applied_at: string;
}

export interface JobApplicant {
  id: string;
  job: string;
  applicant_name: string;
  applicant_email: string;
  resume_link?: string | null;
  cover_letter?: string | null;
  status: string;
  rejection_reason?: string | null;
  applied_at: string;
}

export interface LearnerProfile {
  id: string;
  full_name: string;
  muid: string;
  email?: string | null;
  karma: number;
  level?: number | null;
  college?: string | null;
  department?: string | null;
  graduation_year?: string | null;
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
  // Advanced options

  duration_value?: number;
  duration_unit?: string;
  hourly_rate?: string;
  deliverables?: string[];
  stipend?: string;
  certificate_provided?: boolean | string;
  rules?: { rule_type: string; rule_value: string | number }[];
}

export interface UpdateJobPayload {
  title?: string;
  experience?: string;
  job_description?: string;
  location?: string;
  salary_range?: string;
  job_type?: string;
  // Advanced options

  duration_value?: number;
  duration_unit?: string;
  hourly_rate?: string;
  deliverables?: string[];
  stipend?: string;
  certificate_provided?: boolean | string;
}

export interface CreateRulePayload {
  rule_type: string;
  rule_value: string;
}

export interface UpdateRulePayload {
  rule_type: string;
  rule_value: string;
}

// ─── API Mutation Responses ─────────────────────────────────

export type CreateJobResponse = Job;

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
    rule_value: string;
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

export interface UpdateApplicantStatusResponse extends JobApplicant {}

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
  min_karma?: number;
  max_karma?: number;
  level?: number;
  college?: string;
  department?: string;
  graduation_year?: string;
  ig?: string;
  skill?: string;
  achievement?: string;
  task?: string;
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  page?: number;
  per_page?: number;
}

// ─── Company Tasks Types ─────────────────────────────────────

export interface Skill {
  id: string;
  name: string;
  code: string;
}

export interface CompanyTask {
  id: string;
  hashtag: string;
  discord_link?: string | null;
  title: string;
  description: string;
  karma: number;
  channel?: string | null;
  type: string;
  active: boolean;
  variable_karma: boolean;
  usage_count: number;
  level?: string | null;
  org?: string | null;
  ig?: string | null;
  event?: string | null;
  bonus_karma: number;
  bonus_time?: string | null;
  approval_status: string;
  rejection_reason?: string | null;
  reviewed_at?: string | null;
  requested_by_name?: string | null;
  requested_at?: string | null;
  skills: Skill[];
  created_at: string;
  updated_at: string;
}

export interface TasksListParams {
  approval_status?: string;
  search?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  page?: number;
  per_page?: number;
}

export interface TasksListResponse {
  data: CompanyTask[];
  pagination: {
    count: number;
    total_pages: number;
    current_page: number;
    per_page: number;
    next?: string | null;
    previous?: string | null;
  };
}

export interface CreateTaskPayload {
  hashtag: string;
  title: string;
  karma: number;
  usage_count?: number;
  description: string;
  type: string;
  level?: string;
  created_by?: string;
  updated_by?: string;
  skill_ids?: string[];
}

export interface UpdateTaskPayload {
  hashtag?: string;
  title?: string;
  karma?: number;
  description?: string;
  type?: string;
  level?: string;
  skill_ids?: string[];
}

// ─── Company Mentor Nomination Types ────────────────────────

export interface MentorNomination {
  id: string;
  user_id: string;
  user_name: string;
  user_email?: string | null;
  org_name: string;
  mentor_tier: string;
  status: string;
  reason: string;
  verification_note?: string | null;
  verified_at?: string | null;
}

export interface NominateMentorPayload {
  muid: string;
  reason: string;
}

// ─── Analytics Types ─────────────────────────────────────────

export interface GigAnalytics {
  total_gigs_posted: number;
  active_gigs: number;
  closed_gigs: number;
  average_hourly_rate: number;
  application_funnel: Record<string, number>;
  conversion_rate: string;
}

export interface CompanyDashboardSummary {
  company: {
    id: string;
    name: string;
    slug: string;
    status: string;
    logo?: string | null;
  };
  quick_stats: {
    jobs_posted: number;
    total_views: number;
    applications: number;
    hired: number;
  };
  stat_cards: Array<{
    key: string;
    label: string;
    value: number;
    delta: number;
    delta_type: string;
    period: string;
  }>;
  talent_pool: {
    total_learners: number;
    level_distribution: Array<{
      level_id: string;
      level_name: string;
      level_order: number;
      count: number;
      percentage: number;
    }>;
    top_interest_groups: Array<{
      ig_id: string;
      name: string;
      learner_count: number;
      total_karma: number;
    }>;
  };
}

export interface JobEngagementAnalytics {
  job_id: string;
  job_title: string;
  total_views: number;
  total_applications: number;
  total_hired: number;
  conversion_rate_percentage: number;
}

export interface TalentPoolAnalytics {
  total_learners: number;
  level_distribution: Array<{
    level_id: string;
    level_name: string;
    level_order: number;
    count: number;
    percentage: number;
  }>;
  top_interest_groups: Array<{
    ig_id: string;
    name: string;
    learner_count: number;
    total_karma: number;
  }>;
}

export interface TalentPoolAnalyticsParams {
  karma_min?: number;
  karma_max?: number;
  level_order_min?: number;
  interested_in_work?: boolean;
  interested_in_gig_work?: boolean;
  ig_ids?: string;
}

export interface AdminSummary {
  total_companies: number;
  verified_companies: number;
  pending_companies: number;
  rejected_companies: number;
  total_jobs: number;
  total_company_tasks: number;
}
