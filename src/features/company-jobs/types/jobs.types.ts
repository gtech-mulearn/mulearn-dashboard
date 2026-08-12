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
  | "Freelance"
  | "Gig";

export type JobStatus =
  | "Draft"
  | "Pending Approval"
  | "Active"
  | "Closed"
  | "Expired"
  | "Rejected"
  | "NeedsRevision"
  | "Inactive";

export type RuleType = "skill" | "interest_group" | "achievement";

export type CompanyStatus =
  | "verified"
  | "pending"
  | "rejected"
  | "inactive"
  | "deactivated";

export type JobSortValue = "-created_at" | "created_at" | "title" | "-title";

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
  deliverables?: Record<string, unknown> | string[] | string | null;
  stipend?: string | null;
  certificate_provided?: boolean | null;
  applicant_count?: number | null;
  applications_count?: number | null;
  total_applicants?: number | null;
  applicantCount?: number | null;
  applicationsCount?: number | null;
  expires_at?: string | null;
  eligibility?: {
    eligible: boolean;
    rules: {
      rule_type: string;
      rule_value: string;
      met: boolean;
      message?: string;
    }[];
  } | null;
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
  deliverables?: Record<string, unknown> | string[] | string | null;
  stipend?: string | null;
  certificate_provided?: boolean | null;
  rules: JobRule[];
  expires_at?: string | null;
  eligibility?: {
    eligible: boolean;
    rules: {
      rule_type: string;
      rule_value: string;
      met: boolean;
      message?: string;
    }[];
  } | null;
}

export interface LearnerJobSummary {
  id: string;
  title: string;
  company_name?: string | null;
  company_logo?: string | null;
  location?: string | null;
  job_type?: string | null;
  salary_range?: string | null;
  experience?: string | null;
  [key: string]: unknown;
}

export interface LearnerApplication {
  id: string;
  job: Job | LearnerJobSummary;
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
  salary_range?: string;
  job_type: string;
  // Advanced options

  duration_value?: number;
  duration_unit?: string;
  hourly_rate?: string | number;
  deliverables?: Record<string, unknown> | string[] | string;
  stipend?: string | number;
  certificate_provided?: boolean | string;
  expires_at?: string;
  rules?: { rule_type: string; rule_value: string | number }[];
}

export interface UpdateJobPayload {
  title?: string;
  experience?: string;
  job_description?: string;
  location?: string;
  salary_range?: string | null;
  job_type?: string;
  status?: string;
  // Advanced options

  duration_value?: number | null;
  duration_unit?: string | null;
  hourly_rate?: string | number | null;
  deliverables?: Record<string, unknown> | string[] | string | null;
  stipend?: string | number | null;
  certificate_provided?: boolean | string | null;
  expires_at?: string | null;
  rules?: { rule_type: string; rule_value: string | number }[];
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

export type CreateJobResponse =
  | Job
  | { id: string; status?: string; title?: string; [key: string]: unknown };

export type UpdateJobResponse =
  | Job
  | { status?: string; salary_range?: string | null; [key: string]: unknown };

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
  application_id?: string;
  id?: string;
  job_id?: string;
  job_title?: string;
  status?: string;
  applied_at?: string;
}

export type UpdateApplicantStatusResponse =
  | JobApplicant
  | {
      status?: string;
      [key: string]: unknown;
    };

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
  short_pitch?: string | null;
  industry_sector?: string | null;
  website_link?: string | null;
  email?: string | null;
  slug: string;
  location?: string | null;
  country?: string | null;
  state?: string | null;
  district?: string | null;
  country_name?: string | null;
  state_name?: string | null;
  district_name?: string | null;
  // Extended fields from the full backend schema
  company_size?: string | null;
  linkedin_url?: string | null;
  legal_name?: string | null;
  verified_at?: string | null;
  verified_since?: string | null;
  verified_by?: string | null;
  verification_requested_at?: string | null;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  rejection_reason?: string | null;
  profile_completeness?: number | null;
  collaboration_summary?: {
    total_partnerships?: number;
    campus_partnerships?: number;
    ig_partnerships?: number;
  } | null;
  impact_summary?: unknown;
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
  tech_stack?: string[] | null;
  perks?: string[] | null;
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
  page?: number;
  per_page?: number;
  sort_by?: string;
  job_type?: string;
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
  pageIndex?: number;
  perPage?: number;
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
  deactivated_companies?: number;
  total_jobs: number;
  total_company_tasks: number;
}

// ─── MuLearner Directory ────────────────────────────────────

export interface MuLearner {
  id: string;
  full_name: string;
  muid: string;
  email: string;
  karma: number;
  level: number;
  college?: string | null;
  department?: string | null;
  graduation_year?: number | null;
}

export interface MuLearnersResponse {
  data: MuLearner[];
  pagination: Pagination;
}

// ─── New Part A Types (Admin Links, Analytics, Feedback, etc.) ─

export interface CompanyAdminLink {
  id: string;
  company_id: string;
  company_name: string;
  user_id: string;
  user_name?: string | null;
  user_email?: string | null;
  status: string;
  invited_by: string;
  invited_at: string;
  accepted_at?: string | null;
}

export interface UserCompanyStatus {
  has_company: boolean;
  company?: {
    id: string;
    name: string;
    slug: string;
    status: string;
    is_owner: boolean;
  } | null;
  pending_invitations: CompanyAdminLink[];
}

export interface CampusJobApplicant {
  campus_id: string;
  campus_name: string;
  applicant_count: number;
}

export interface CampusTaskCompleter {
  campus_id: string;
  campus_name: string;
  completer_count: number;
}

export interface CampusEventAttendee {
  campus_id: string;
  campus_name: string;
  attendee_count: number;
}

export interface CampusAnalytics {
  job_applicants_by_campus: CampusJobApplicant[];
  task_completers_by_campus: CampusTaskCompleter[];
  event_attendees_by_campus: CampusEventAttendee[];
}

export interface CampusTrendItem {
  quarter: string;
  active_learners: number;
  job_applicants: number;
  karma_earned: number;
  sessions_held: number;
}

export interface CampusTrend {
  campus_id: string;
  campus_name: string;
  trend: CampusTrendItem[];
}

export interface TaskLearnerSatisfaction {
  average_rating: number;
  rating_count: number;
}

export interface TasksAnalytics {
  total_tasks_submitted: number;
  approval_funnel: Record<string, number>;
  total_completions: number;
  completion_rate: string;
  karma_distributed: number;
  learner_satisfaction?: TaskLearnerSatisfaction;
}

export interface ShortlistedLearner {
  id: string;
  user_id: string;
  learner_name: string;
  muid: string;
  email?: string | null;
  karma: number;
  level: number;
  shortlisted_at: string;
  note?: string | null;
}

export interface TalentPoolInsights {
  total_active_learners: number;
  available_for_hire: number;
  available_for_gigs: number;
  district_distribution: Array<{ district: string; count: number }>;
  top_skills: Array<{ skill: string; learner_count: number }>;
  recommended_roles: Array<{ role: string; talent_count: number }>;
}

export interface TaskTemplate {
  id: string;
  title: string;
  description?: string | null;
  hashtag_prefix?: string | null;
  hashtag?: string | null;
  karma: number;
  type_id?: string | null;
  type_title?: string | null;
  type?: string | null;
  skills?: string[];
  created_at?: string | null;
}

export interface CompanyFeedback {
  id: string;
  from_user_name: string;
  from_user_id: string;
  rating: number;
  feedback_type: string;
  comments: string;
  created_at: string;
}

export interface ImpactReport {
  company_id: string;
  company_name: string;
  total_hires: number;
  total_gigs: number;
  total_karma_awarded: number;
  campuses_engaged: number;
  is_published: boolean;
  published_at?: string | null;
}

export interface CompanyCollaboration {
  id: string;
  title: string;
  description: string;
  initiator_company_id: string;
  initiator_company_name: string;
  partner_company_id?: string | null;
  partner_company_name?: string | null;
  status: string;
  collaboration_type: string;
  created_at: string;
}

export interface IgSponsorshipMetrics {
  ig_id: string;
  ig_name: string;
  sponsor_status: string;
  active_learners: number;
  sponsored_tasks_count: number;
  total_karma_funded: number;
  engagement_score: number;
}

export interface EventTemplate {
  id: string;
  title: string;
  description?: string | null;
  event_type: string;
  default_duration_minutes?: number | null;
  mode?: string | null;
  created_at?: string | null;
}
