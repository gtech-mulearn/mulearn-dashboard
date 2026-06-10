import { apiClient, publicApiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import type { PublicJobsBySlugData } from "../schemas";
import {
  ApplyJobResponseSchema,
  CompanyProfileResponseSchema,
  CreateJobResponseSchema,
  CreateRuleResponseSchema,
  DeleteJobResponseSchema,
  DeleteRuleResponseSchema,
  GigAnalyticsResponseSchema,
  JobApplicantsResponseSchema,
  JobDetailResponseSchema,
  JobsListResponseSchema,
  LearnerApplicationsResponseSchema,
  LearnerDiscoveryResponseSchema,
  MuLearnersResponseSchema,
  PublicCompanyProfileResponseSchema,
  PublicJobsBySlugResponseSchema,
  PublicJobsResponseSchema,
  UpdateApplicantStatusResponseSchema,
  UpdateJobResponseSchema,
  UpdateRuleResponseSchema,
} from "../schemas";
import type {
  ApplyJobResponse,
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
  JobsListParams,
  JobsListResponse,
  LearnerApplicationsResponse,
  LearnerDiscoveryParams,
  LearnerDiscoveryResponse,
  MuLearnersResponse,
  PublicJobsResponse,
  UpdateApplicantStatusResponse,
  UpdateJobPayload,
  UpdateJobResponse,
  UpdateRulePayload,
  UpdateRuleResponse,
} from "../types";

// ─── Company Profile ────────────────────────────────────────

export async function fetchCompanyProfile(): Promise<CompanyProfile> {
  const res = await apiClient.get(
    endpoints.company.profile,
    CompanyProfileResponseSchema,
  );
  return res.response;
}

// ─── Jobs CRUD ──────────────────────────────────────────────

export async function fetchJobs(
  params?: JobsListParams,
): Promise<JobsListResponse> {
  const query = new URLSearchParams();

  if (params?.pageIndex) query.set("pageIndex", String(params.pageIndex));
  if (params?.perPage) query.set("perPage", String(params.perPage));
  if (params?.search?.trim()) query.set("search", params.search.trim());
  if (params?.sortBy) query.set("sortBy", params.sortBy);

  const queryString = query.toString();
  const url = queryString
    ? `${endpoints.company.jobs}?${queryString}`
    : endpoints.company.jobs;

  const res = await apiClient.get(url, JobsListResponseSchema);
  return res.response;
}

export async function fetchJobDetail(jobId: string): Promise<Job> {
  const res = await apiClient.get(
    endpoints.company.jobDetails(jobId),
    JobDetailResponseSchema,
  );
  return res.response.job;
}

export async function createJob(
  payload: CreateJobPayload,
): Promise<CreateJobResponse> {
  const res = await apiClient.post(
    endpoints.company.createJob,
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
    endpoints.company.updateJob(jobId),
    payload,
    UpdateJobResponseSchema,
  );
  return res.response;
}

export async function deleteJob(jobId: string): Promise<DeleteJobResponse> {
  const res = await apiClient.delete(
    endpoints.company.deleteJob(jobId),
    undefined,
    DeleteJobResponseSchema,
  );
  return res.response;
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
): Promise<CompanyProfile> {
  const res = await apiClient.get(
    endpoints.company.publicProfile(slug),
    PublicCompanyProfileResponseSchema,
  );
  return res.response;
}

export async function fetchPublicCompanyJobsBySlug(
  slug: string,
  params?: { pageIndex?: number; perPage?: number; search?: string },
): Promise<PublicJobsBySlugData> {
  const query = new URLSearchParams();
  if (params?.pageIndex) query.set("pageIndex", String(params.pageIndex));
  if (params?.perPage) query.set("perPage", String(params.perPage));
  if (params?.search?.trim()) query.set("search", params.search.trim());
  const qs = query.toString();
  const url = qs
    ? `${endpoints.company.publicJobsBySlug(slug)}?${qs}`
    : endpoints.company.publicJobsBySlug(slug);
  const res = await apiClient.get(url, PublicJobsBySlugResponseSchema);
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
    ? `${endpoints.company.publicJobs}?${queryString}`
    : endpoints.company.publicJobs;

  const res = await publicApiClient.get(url, PublicJobsResponseSchema);
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
    ? `${endpoints.company.learnerApplications}?${queryString}`
    : endpoints.company.learnerApplications;

  const res = await apiClient.get(url, LearnerApplicationsResponseSchema);
  return res.response;
}

export async function applyToJob(
  jobId: string,
  coverNote?: string,
): Promise<ApplyJobResponse> {
  const res = await apiClient.post(
    endpoints.company.applyJob(jobId),
    coverNote ? { cover_note: coverNote } : {},
    ApplyJobResponseSchema,
  );
  return res.response;
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
    ? `${endpoints.company.jobApplicants(jobId)}?${queryString}`
    : endpoints.company.jobApplicants(jobId);

  const res = await apiClient.get(url, JobApplicantsResponseSchema);
  return res.response;
}

export async function updateApplicantStatus(
  appId: string,
  status: string,
  rejection_reason?: string | null,
): Promise<UpdateApplicantStatusResponse> {
  const body: Record<string, unknown> = { status };
  if (rejection_reason !== undefined) body.rejection_reason = rejection_reason;
  const res = await apiClient.patch(
    endpoints.company.updateApplicantStatus(appId),
    body,
    UpdateApplicantStatusResponseSchema,
  );
  return res.response;
}

export async function fetchLearnerDiscovery(
  params?: LearnerDiscoveryParams,
): Promise<LearnerDiscoveryResponse> {
  const query = new URLSearchParams();

  if (params?.karma_min !== undefined)
    query.set("karma_min", String(params.karma_min));
  if (params?.karma_max !== undefined)
    query.set("karma_max", String(params.karma_max));
  if (params?.ig_ids) query.set("ig_ids", params.ig_ids);
  if (params?.achievement_ids)
    query.set("achievement_ids", params.achievement_ids);
  if (params?.level_order_min !== undefined)
    query.set("level_order_min", String(params.level_order_min));
  if (params?.interested_in_work !== undefined)
    query.set("interested_in_work", String(params.interested_in_work));
  if (params?.interested_in_gig_work !== undefined)
    query.set("interested_in_gig_work", String(params.interested_in_gig_work));
  if (params?.pageIndex) query.set("pageIndex", String(params.pageIndex));
  if (params?.perPage) query.set("perPage", String(params.perPage));
  if (params?.search?.trim()) query.set("search", params.search.trim());
  if (params?.sortBy) query.set("sortBy", params.sortBy);

  const queryString = query.toString();
  const url = queryString
    ? `${endpoints.company.learners}?${queryString}`
    : endpoints.company.learners;

  const res = await apiClient.get(url, LearnerDiscoveryResponseSchema);
  return res.response;
}

// ─── MuLearner Directory ────────────────────────────────────────────────────────

export interface MuLearnerParams {
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
  sortBy?: string;
  pageIndex?: number;
  perPage?: number;
}

export async function fetchMuLearners(
  params?: MuLearnerParams,
): Promise<MuLearnersResponse> {
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
  if (params?.pageIndex) query.set("pageIndex", String(params.pageIndex));
  if (params?.perPage) query.set("perPage", String(params.perPage));
  if (params?.search?.trim()) query.set("search", params.search.trim());
  if (params?.sortBy) query.set("sortBy", params.sortBy);

  const queryString = query.toString();
  const url = queryString
    ? `${endpoints.company.mulearners}?${queryString}`
    : endpoints.company.mulearners;

  const res = await apiClient.get(url, MuLearnersResponseSchema);
  return res.response;
}

// ─── Gig Analytics ───────────────────────────────────────────────────────────────

export async function fetchGigAnalytics(): Promise<GigAnalytics> {
  const res = await apiClient.get(
    endpoints.company.gigAnalytics,
    GigAnalyticsResponseSchema,
  );
  return res.response;
}
