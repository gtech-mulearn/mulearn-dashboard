import type { z } from "zod";
import { apiClient, publicApiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { fetchCompanyOnboardingStatus } from "@/features/auth/api/auth.api";
import { getEditableUserProfile } from "@/features/profile/api/profile.api";
import type { PublicCompanyProfile, PublicJobsBySlugData } from "../schemas";
import {
  AdminSummaryResponseSchema,
  ApplyJobResponseSchema,
  CompanyDashboardSummaryResponseSchema,
  CompanyProfileResponseSchema,
  CreateJobResponseSchema,
  CreateRuleResponseSchema,
  DeleteJobResponseSchema,
  DeleteRuleResponseSchema,
  GenericResponseSchema,
  GigAnalyticsResponseSchema,
  JobApplicantsResponseSchema,
  JobDetailResponseSchema,
  JobEngagementAnalyticsResponseSchema,
  JobsListResponseSchema,
  LearnerApplicationsResponseSchema,
  LearnerDiscoveryResponseSchema,
  PublicCompanyProfileResponseSchema,
  PublicJobsBySlugResponseSchema,
  PublicJobsResponseSchema,
  TalentPoolAnalyticsResponseSchema,
  TrackJobViewResponseSchema,
  UpdateApplicantStatusResponseSchema,
  UpdateJobResponseSchema,
  UpdateRuleResponseSchema,
} from "../schemas";
import type {
  AdminSummary,
  CompanyDashboardSummary,
  CompanyProfile,
  CreateJobPayload,
  CreateJobResponse,
  CreateRulePayload,
  CreateRuleResponse,
  DeleteJobResponse,
  DeleteRuleResponse,
  GigAnalytics,
  Job,
  JobApplicantsResponse,
  JobEngagementAnalytics,
  JobsListParams,
  JobsListResponse,
  LearnerApplicationsResponse,
  LearnerDiscoveryParams,
  LearnerDiscoveryResponse,
  PublicJobsResponse,
  TalentPoolAnalytics,
  TalentPoolAnalyticsParams,
  UpdateApplicantStatusResponse,
  UpdateJobPayload,
  UpdateJobResponse,
  UpdateRulePayload,
  UpdateRuleResponse,
} from "../types";

// ─── Company Profile ────────────────────────────────────────

export async function fetchCompanyProfile(): Promise<CompanyProfile> {
  // Check verification status first
  const statusRes = await fetchCompanyOnboardingStatus();
  const status = statusRes.status;

  // If pending or rejected, fallback to the editable user profile
  // and construct a minimal CompanyProfile shape for the UI
  if (status === "pending" || status === "rejected") {
    const profile = await getEditableUserProfile();
    return {
      id: "pending-or-rejected",
      name: profile.full_name || "",
      email: profile.email || "",
      description: "",
      ...(statusRes as Record<string, unknown>),
      status: status,
      rejection_reason: statusRes.rejection_reason || null,
      // The rest of the fields will be naturally undefined/null
    } as unknown as CompanyProfile;
  }

  // Active company — fetch full profile
  const res = await apiClient.get(
    endpoints.company.profile,
    CompanyProfileResponseSchema,
  );

  // Explicitly inject the 'verified' status so the UI knows the company is active
  return {
    ...res.response,
    status: "verified",
  };
}

// ─── Jobs CRUD ──────────────────────────────────────────────

export async function fetchJobs(
  params?: JobsListParams,
): Promise<JobsListResponse> {
  const query = new URLSearchParams();

  if (params?.pageIndex || params?.page)
    query.set("page", String(params.page ?? params.pageIndex));
  if (params?.perPage || params?.per_page)
    query.set("per_page", String(params.per_page ?? params.perPage));
  if (params?.search?.trim()) query.set("search", params.search.trim());
  if (params?.sortBy || params?.sort_by)
    query.set("sort_by", params.sort_by ?? params.sortBy ?? "");
  if (params?.sort_order) query.set("sort_order", params.sort_order);

  const queryString = query.toString();
  const url = queryString
    ? `${endpoints.company.jobs}?${queryString}`
    : endpoints.company.jobs;

  const res = await apiClient.get(url, JobsListResponseSchema);
  return res.response;
}

export async function fetchJobDetail(jobId: string): Promise<Job> {
  const res = await apiClient.get(
    endpoints.company.jobDetail(jobId),
    JobDetailResponseSchema,
  );

  const data = res.response;
  if (!data) throw new Error("No data returned from API");

  // Safely extract job object whether nested in .job or returned at root
  const job = data.job ?? data;

  if (!job) {
    throw new Error("Job data could not be parsed or found in response");
  }

  return job as Job;
}

export async function createJob(
  payload: CreateJobPayload,
): Promise<CreateJobResponse> {
  const res = await apiClient.post(
    endpoints.company.jobs,
    payload,
    CreateJobResponseSchema,
  );
  return res.response;
}

export async function updateJob(
  jobId: string,
  payload: UpdateJobPayload,
): Promise<UpdateJobResponse> {
  const res = await apiClient.patch(
    endpoints.company.jobDetail(jobId),
    payload,
    UpdateJobResponseSchema,
  );
  return res.response as UpdateJobResponse;
}

export async function deleteJob(jobId: string): Promise<DeleteJobResponse> {
  const res = await apiClient.delete(
    endpoints.company.jobDetail(jobId),
    undefined,
    DeleteJobResponseSchema,
  );
  return res.response as DeleteJobResponse;
}

// ─── Job Rules CRUD ─────────────────────────────────────────

export async function createJobRule(
  jobId: string,
  payload: CreateRulePayload,
): Promise<CreateRuleResponse> {
  const res = await apiClient.post(
    endpoints.company.createJobRule(jobId),
    payload,
    CreateRuleResponseSchema,
  );
  return res.response;
}

export async function updateJobRule(
  jobId: string,
  ruleId: string,
  payload: UpdateRulePayload,
): Promise<UpdateRuleResponse> {
  const res = await apiClient.patch(
    endpoints.company.updateJobRule(jobId, ruleId),
    payload,
    UpdateRuleResponseSchema,
  );
  return res.response;
}

export async function deleteJobRule(
  jobId: string,
  ruleId: string,
): Promise<DeleteRuleResponse> {
  const res = await apiClient.delete(
    endpoints.company.deleteJobRule(jobId, ruleId),
    undefined,
    DeleteRuleResponseSchema,
  );
  return res.response;
}

// ─── Public Company Profile & Jobs ──────────────────────────

export async function fetchPublicCompanyProfile(
  slug: string,
): Promise<PublicCompanyProfile> {
  const res = await publicApiClient.get(
    endpoints.company.publicProfile(slug),
    PublicCompanyProfileResponseSchema,
  );
  return res.response;
}

export async function fetchPublicCompanyJobsBySlug(
  slug: string,
  params?: {
    pageIndex?: number;
    perPage?: number;
    search?: string;
    sortBy?: "title" | "created_at";
  },
): Promise<PublicJobsBySlugData> {
  const query = new URLSearchParams();
  if (params?.pageIndex) query.set("pageIndex", String(params.pageIndex));
  if (params?.perPage) query.set("perPage", String(params.perPage));
  if (params?.search?.trim()) query.set("search", params.search.trim());
  if (params?.sortBy) query.set("sortBy", params.sortBy);
  const qs = query.toString();
  const url = qs
    ? `${endpoints.company.publicJobsBySlug(slug)}?${qs}`
    : endpoints.company.publicJobsBySlug(slug);
  const res = await publicApiClient.get(url, PublicJobsBySlugResponseSchema);
  return res.response;
}

// ─── Learner Public Jobs & Applications ──────────────────────

export async function fetchPublicJobs(
  params?: JobsListParams,
): Promise<PublicJobsResponse> {
  const query = new URLSearchParams();

  if (params?.pageIndex) query.set("pageIndex", String(params.pageIndex));
  if (params?.perPage) query.set("perPage", String(params.perPage));
  if (params?.search?.trim()) query.set("search", params.search.trim());
  if (params?.sortBy) query.set("sortBy", params.sortBy);

  const queryString = query.toString();
  const url = queryString
    ? `${endpoints.company.jobsAll}?${queryString}`
    : endpoints.company.jobsAll;

  const res = await apiClient.get(url, PublicJobsResponseSchema);
  return res.response;
}

export async function fetchLearnerApplications(params?: {
  search?: string;
  sortBy?: string;
  pageIndex?: number;
  perPage?: number;
}): Promise<LearnerApplicationsResponse> {
  const query = new URLSearchParams();

  if (params?.pageIndex) query.set("pageIndex", String(params.pageIndex));
  if (params?.perPage) query.set("perPage", String(params.perPage));
  if (params?.search?.trim()) query.set("search", params.search.trim());
  if (params?.sortBy) query.set("sortBy", params.sortBy);

  const queryString = query.toString();
  const url = queryString
    ? `${endpoints.company.myApplications}?${queryString}`
    : endpoints.company.myApplications;

  const res = await apiClient.get(url, LearnerApplicationsResponseSchema);
  return res.response;
}

export async function applyToJob(
  jobId: string,
  payload: { resume_link: string; cover_letter?: string },
): Promise<void> {
  await apiClient.post(
    endpoints.company.applyJob(jobId),
    payload,
    ApplyJobResponseSchema,
  );
}

export async function withdrawApplication(appId: string): Promise<void> {
  await apiClient.delete(
    endpoints.company.applicationWithdraw(appId),
    GenericResponseSchema,
  );
}

export async function resubmitApplication(
  appId: string,
  payload: { resume_link?: string; cover_letter?: string },
): Promise<void> {
  await apiClient.patch(
    endpoints.company.applicationResubmit(appId),
    payload,
    GenericResponseSchema,
  );
}

// ─── Company Applicant Management & Talent Pool ──────────────

export async function fetchJobApplicants(
  jobId: string,
  params?: {
    status?: string;
    search?: string;
    sortBy?: string;
    pageIndex?: number;
    perPage?: number;
  },
): Promise<JobApplicantsResponse> {
  const query = new URLSearchParams();

  if (params?.status) query.set("status", params.status);
  if (params?.pageIndex) query.set("pageIndex", String(params.pageIndex));
  if (params?.perPage) query.set("perPage", String(params.perPage));
  if (params?.search?.trim()) query.set("search", params.search.trim());
  if (params?.sortBy) query.set("sortBy", params.sortBy);

  const queryString = query.toString();
  const url = queryString
    ? `${endpoints.company.jobApplications(jobId)}?${queryString}`
    : endpoints.company.jobApplications(jobId);

  const res = await apiClient.get(url, JobApplicantsResponseSchema);
  return res.response;
}

export async function updateApplicantStatus(
  appId: string,
  payload: { status: string; rejection_reason?: string },
): Promise<UpdateApplicantStatusResponse> {
  const { status, rejection_reason } = payload;

  const body: Record<string, unknown> = { status };
  if (rejection_reason !== undefined) body.rejection_reason = rejection_reason;

  const res = await apiClient.patch(
    endpoints.company.applicationStatus(appId),
    body,
    UpdateApplicantStatusResponseSchema,
  );
  return res.response;
}

export async function fetchLearnerDiscovery(
  params?: LearnerDiscoveryParams,
): Promise<LearnerDiscoveryResponse> {
  const query = new URLSearchParams();

  if (params?.min_karma !== undefined)
    query.set("min_karma", String(params.min_karma));
  if (params?.max_karma !== undefined)
    query.set("max_karma", String(params.max_karma));
  if (params?.level !== undefined) query.set("level", String(params.level));
  if (params?.college) query.set("college", params.college);
  if (params?.department) query.set("department", params.department);
  if (params?.graduation_year)
    query.set("graduation_year", params.graduation_year);
  if (params?.ig) query.set("ig", params.ig);
  if (params?.skill) query.set("skill", params.skill);
  if (params?.achievement) query.set("achievement", params.achievement);
  if (params?.task) query.set("task", params.task);
  if (params?.search?.trim()) query.set("search", params.search.trim());
  if (params?.sort_by) query.set("sort_by", params.sort_by);
  if (params?.sort_order) query.set("sort_order", params.sort_order);

  // Support both page/per_page and pageIndex/perPage query params
  const page = params?.page ?? params?.pageIndex;
  const perPage = params?.per_page ?? params?.perPage;

  if (page !== undefined) {
    query.set("page", String(page));
    query.set("pageIndex", String(page));
  }
  if (perPage !== undefined) {
    query.set("per_page", String(perPage));
    query.set("perPage", String(perPage));
  }

  const queryString = query.toString();
  const url = queryString
    ? `${endpoints.company.mulearners}?${queryString}`
    : endpoints.company.mulearners;

  const res = await apiClient.get(url, LearnerDiscoveryResponseSchema);
  return res.response;
}

// ─── Analytics & Summaries ──────────────────────────────────

export async function fetchGigAnalytics(): Promise<GigAnalytics> {
  const res = await apiClient.get(
    endpoints.company.analyticsGigs,
    GigAnalyticsResponseSchema,
  );
  return res.response;
}

export async function fetchCompanyDashboardSummary(params?: {
  period?: string;
  karma_min?: number;
  karma_max?: number;
  level_order_min?: number;
  interested_in_work?: boolean;
  interested_in_gig_work?: boolean;
  ig_ids?: string;
}): Promise<CompanyDashboardSummary> {
  const query = new URLSearchParams();

  if (params?.period) query.set("period", params.period);
  if (params?.karma_min !== undefined)
    query.set("karma_min", String(params.karma_min));
  if (params?.karma_max !== undefined)
    query.set("karma_max", String(params.karma_max));
  if (params?.level_order_min !== undefined)
    query.set("level_order_min", String(params.level_order_min));
  if (params?.interested_in_work !== undefined)
    query.set("interested_in_work", String(params.interested_in_work));
  if (params?.interested_in_gig_work !== undefined)
    query.set("interested_in_gig_work", String(params.interested_in_gig_work));
  if (params?.ig_ids) query.set("ig_ids", params.ig_ids);

  const queryString = query.toString();
  const url = queryString
    ? `${endpoints.company.homeSummary}?${queryString}`
    : endpoints.company.homeSummary;

  const res = await apiClient.get(url, CompanyDashboardSummaryResponseSchema);
  return res.response;
}

export async function trackJobView(
  jobId: string,
): Promise<z.infer<typeof TrackJobViewResponseSchema> | null> {
  try {
    const res = await apiClient.post(
      endpoints.company.trackJobView(jobId),
      undefined,
      TrackJobViewResponseSchema,
    );
    return res;
  } catch (error) {
    console.warn(
      `[trackJobView] Failed to track job view for ID ${jobId}:`,
      error,
    );
    return null;
  }
}

export async function fetchJobEngagementAnalytics(
  jobId: string,
): Promise<JobEngagementAnalytics> {
  const res = await apiClient.get(
    endpoints.company.jobAnalytics(jobId),
    JobEngagementAnalyticsResponseSchema,
  );
  return res.response;
}

export async function fetchTalentPoolAnalytics(
  params?: TalentPoolAnalyticsParams,
): Promise<TalentPoolAnalytics> {
  const query = new URLSearchParams();

  if (params?.karma_min !== undefined)
    query.set("karma_min", String(params.karma_min));
  if (params?.karma_max !== undefined)
    query.set("karma_max", String(params.karma_max));
  if (params?.level_order_min !== undefined)
    query.set("level_order_min", String(params.level_order_min));
  if (params?.interested_in_work !== undefined)
    query.set("interested_in_work", String(params.interested_in_work));
  if (params?.interested_in_gig_work !== undefined)
    query.set("interested_in_gig_work", String(params.interested_in_gig_work));
  if (params?.ig_ids) query.set("ig_ids", params.ig_ids);

  const queryString = query.toString();
  const url = queryString
    ? `${endpoints.company.talentPoolAnalytics}?${queryString}`
    : endpoints.company.talentPoolAnalytics;

  const res = await apiClient.get(url, TalentPoolAnalyticsResponseSchema);
  return res.response;
}

export async function fetchAdminSummary(): Promise<AdminSummary> {
  const res = await apiClient.get(
    endpoints.company.adminSummary,
    AdminSummaryResponseSchema,
  );
  return res.response;
}
