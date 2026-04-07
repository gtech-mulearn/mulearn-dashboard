import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import {
  CompanyProfileResponseSchema,
  CreateJobResponseSchema,
  CreateRuleResponseSchema,
  DeleteJobResponseSchema,
  DeleteRuleResponseSchema,
  JobDetailResponseSchema,
  JobsListResponseSchema,
  UpdateJobResponseSchema,
  UpdateRuleResponseSchema,
} from "../schemas";
import type {
  CompanyProfile,
  CreateJobPayload,
  CreateJobResponse,
  CreateRulePayload,
  CreateRuleResponse,
  DeleteJobResponse,
  DeleteRuleResponse,
  Job,
  JobsListParams,
  JobsListResponse,
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
