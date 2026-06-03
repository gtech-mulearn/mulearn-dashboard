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
  JobApplicantsResponseSchema,
  JobDetailResponseSchema,
  JobsListResponseSchema,
  LearnerApplicationsResponseSchema,
  LearnerDiscoveryResponseSchema,
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
  Job,
  JobApplicantsResponse,
  JobsListParams,
  JobsListResponse,
  LearnerApplicationsResponse,
  LearnerDiscoveryParams,
  LearnerDiscoveryResponse,
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
    endpoints.company.jobDetail(jobId),
    JobDetailResponseSchema,
  );
  return res.response.job;
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
  return res.response;
}

export async function deleteJob(jobId: string): Promise<DeleteJobResponse> {
  const res = await apiClient.delete(
    endpoints.company.jobDetail(jobId),
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
    ? `${endpoints.company.jobsAll}?${queryString}`
    : endpoints.company.jobsAll;

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
    ? `${endpoints.company.myApplications}?${queryString}`
    : endpoints.company.myApplications;

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
    ? `${endpoints.company.jobApplications(jobId)}?${queryString}`
    : endpoints.company.jobApplications(jobId);

  const res = await apiClient.get(url, JobApplicantsResponseSchema);
  return res.response;
}

export async function updateApplicantStatus(
  jobId: string,
  appId: string,
  status: string,
): Promise<UpdateApplicantStatusResponse> {
  const res = await apiClient.patch(
    endpoints.company.applicationStatus(appId),
    { status },
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
    ? `${endpoints.company.mulearners}?${queryString}`
    : endpoints.company.mulearners;

  const res = await apiClient.get(url, LearnerDiscoveryResponseSchema);
  return res.response;
}
