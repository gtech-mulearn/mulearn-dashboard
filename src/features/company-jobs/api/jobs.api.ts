import type { z } from "zod";
import { apiClient, publicApiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import { fetchCompanyOnboardingStatus } from "@/features/auth/api/auth.api";
import { getEditableUserProfile } from "@/features/profile/api/profile.api";
import type { PublicCompanyProfile, PublicJobsBySlugData } from "../schemas";
import {
  AdminSummaryResponseSchema,
  ApplyJobResponseSchema,
  CampusAnalyticsResponseSchema,
  CampusTrendResponseSchema,
  CompanyAdminLinkListResponseSchema,
  CompanyAdminLinkResponseSchema,
  CompanyCollaborationListResponseSchema,
  CompanyCollaborationResponseSchema,
  CompanyDashboardSummaryResponseSchema,
  CompanyFeedbackListResponseSchema,
  CompanyFeedbackResponseSchema,
  CompanyProfileResponseSchema,
  CreateJobResponseSchema,
  DeleteJobResponseSchema,
  EventTemplateDetailResponseSchema,
  EventTemplatesListResponseSchema,
  GenericResponseSchema,
  GigAnalyticsResponseSchema,
  IgSponsorshipMetricsResponseSchema,
  ImpactReportResponseSchema,
  JobApplicantsResponseSchema,
  JobDetailResponseSchema,
  JobEngagementAnalyticsResponseSchema,
  JobsListResponseSchema,
  LearnerApplicationsResponseSchema,
  LearnerDiscoveryResponseSchema,
  PublicCompanyProfileResponseSchema,
  PublicJobsBySlugResponseSchema,
  PublicJobsResponseSchema,
  ResubmitApplicationResponseSchema,
  ShortlistListResponseSchema,
  ShortlistMutationResponseSchema,
  TalentPoolAnalyticsResponseSchema,
  TalentPoolInsightsResponseSchema,
  TasksAnalyticsResponseSchema,
  TaskTemplateDetailResponseSchema,
  TaskTemplatesListResponseSchema,
  TrackJobViewResponseSchema,
  UpdateApplicantStatusResponseSchema,
  UpdateCompanyProfileResponseSchema,
  UpdateJobResponseSchema,
  UserCompanyStatusResponseSchema,
} from "../schemas";
import type {
  AdminSummary,
  CampusAnalytics,
  CampusTrend,
  CompanyAdminLink,
  CompanyCollaboration,
  CompanyDashboardSummary,
  CompanyFeedback,
  CompanyProfile,
  CreateJobPayload,
  CreateJobResponse,
  CreateRulePayload,
  CreateRuleResponse,
  DeleteJobResponse,
  DeleteRuleResponse,
  EventTemplate,
  GigAnalytics,
  IgSponsorshipMetrics,
  ImpactReport,
  Job,
  JobApplicantsResponse,
  JobEngagementAnalytics,
  JobsListParams,
  JobsListResponse,
  LearnerApplicationsResponse,
  LearnerDiscoveryParams,
  LearnerDiscoveryResponse,
  PublicJobsResponse,
  ShortlistedLearner,
  TalentPoolAnalytics,
  TalentPoolAnalyticsParams,
  TalentPoolInsights,
  TasksAnalytics,
  TaskTemplate,
  UpdateApplicantStatusResponse,
  UpdateJobPayload,
  UpdateJobResponse,
  UpdateRulePayload,
  UpdateRuleResponse,
  UserCompanyStatus,
} from "../types";

// ─── Company Profile (§2) ───────────────────────────────────

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

/**
 * PATCH company/profile/ (owner only)
 * Update company profile fields (short_pitch, tech_stack, etc.)
 */
export async function updateCompanyProfile(
  payload: Partial<CompanyProfile>,
): Promise<{
  data: Partial<CompanyProfile>;
  message: string;
}> {
  const res = await apiClient.patch(
    endpoints.company.profile,
    payload,
    UpdateCompanyProfileResponseSchema,
  );
  return {
    data: res.response as Partial<CompanyProfile>,
    message:
      res.general_message ||
      (res as { message?: { general?: string[] } }).message?.general?.[0] ||
      "Company profile updated successfully.",
  };
}

export const patchCompanyProfile = updateCompanyProfile;

// ─── Jobs CRUD (§4) ─────────────────────────────────────────

export async function fetchJobs(
  params?: JobsListParams,
): Promise<JobsListResponse> {
  const query = new URLSearchParams();

  const page = params?.page ?? params?.pageIndex;
  if (page !== undefined) {
    query.set("page", String(page));
    query.set("pageIndex", String(page));
  }

  const perPage = params?.per_page ?? params?.perPage;
  if (perPage !== undefined) query.set("per_page", String(perPage));

  if (params?.search?.trim()) query.set("search", params.search.trim());
  const sortBy = params?.sort_by ?? params?.sortBy;
  if (sortBy) query.set("sortBy", sortBy);
  if (params?.job_type) query.set("job_type", params.job_type);

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

// ─── Job Rules Management (via PATCH Job) ───────────────────

export async function createJobRule(
  jobId: string,
  payload: CreateRulePayload,
): Promise<CreateRuleResponse> {
  const currentJob = await fetchJobDetail(jobId);
  const existingRules = currentJob.rules || [];
  const newRules = [
    ...existingRules.map((r) => ({
      rule_type: r.rule_type,
      rule_value: r.rule_value,
    })),
    { rule_type: payload.rule_type, rule_value: payload.rule_value },
  ];
  const updated = await updateJob(jobId, { rules: newRules });
  const rulesList =
    updated && "rules" in updated && Array.isArray(updated.rules)
      ? updated.rules
      : [];
  const addedRule = rulesList.find(
    (r: { rule_type?: string; rule_value?: string | number; id?: string }) =>
      r.rule_type === payload.rule_type &&
      String(r.rule_value) === String(payload.rule_value),
  ) || {
    id: `rule-${Date.now()}`,
    job_id: jobId,
    rule_type: payload.rule_type,
    rule_value: payload.rule_value,
    created_at: new Date().toISOString(),
  };

  return {
    job_rule: {
      id: addedRule.id || `rule-${Date.now()}`,
      job_id: jobId,
      rule_type: payload.rule_type,
      rule_value: payload.rule_value,
      created_at: new Date().toISOString(),
    },
  };
}

export async function updateJobRule(
  jobId: string,
  ruleId: string,
  payload: UpdateRulePayload,
): Promise<UpdateRuleResponse> {
  const currentJob = await fetchJobDetail(jobId);
  const existingRules = currentJob.rules || [];
  const newRules = existingRules.map((r) =>
    r.id === ruleId
      ? {
          rule_type: payload.rule_type || r.rule_type,
          rule_value: payload.rule_value,
        }
      : { rule_type: r.rule_type, rule_value: r.rule_value },
  );
  await updateJob(jobId, { rules: newRules });
  return {
    rule_id: ruleId,
    updated_value: payload.rule_value,
  };
}

export async function deleteJobRule(
  jobId: string,
  ruleId: string,
): Promise<DeleteRuleResponse> {
  const currentJob = await fetchJobDetail(jobId);
  const existingRules = currentJob.rules || [];
  const newRules = existingRules
    .filter((r) => r.id !== ruleId)
    .map((r) => ({ rule_type: r.rule_type, rule_value: r.rule_value }));
  await updateJob(jobId, { rules: newRules });
  return {
    rule_id: ruleId,
    job_id: jobId,
    deleted_at: new Date().toISOString(),
  };
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

  const page = params?.page ?? params?.pageIndex;
  if (page !== undefined) {
    query.set("page", String(page));
    query.set("pageIndex", String(page));
  }
  const perPage = params?.per_page ?? params?.perPage;
  if (perPage !== undefined) query.set("per_page", String(perPage));
  if (params?.search?.trim()) query.set("search", params.search.trim());
  const sortBy = params?.sort_by ?? params?.sortBy;
  if (sortBy) query.set("sortBy", sortBy);
  if (params?.job_type) query.set("job_type", params.job_type);

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
  sort_by?: string;
  pageIndex?: number;
  page?: number;
  perPage?: number;
  per_page?: number;
}): Promise<LearnerApplicationsResponse> {
  const query = new URLSearchParams();

  const page = params?.page ?? params?.pageIndex;
  if (page !== undefined) {
    query.set("page", String(page));
    query.set("pageIndex", String(page));
  }
  const perPage = params?.per_page ?? params?.perPage;
  if (perPage !== undefined) query.set("per_page", String(perPage));
  if (params?.search?.trim()) query.set("search", params.search.trim());
  const sortBy = params?.sort_by ?? params?.sortBy;
  if (sortBy) query.set("sortBy", sortBy);

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
    undefined,
    GenericResponseSchema,
  );
}

export async function resubmitApplication(
  appId: string,
  payload: { resume_link?: string; cover_letter?: string },
): Promise<{ status?: string } | undefined> {
  const res = await apiClient.patch(
    endpoints.company.applicationResubmit(appId),
    payload,
    ResubmitApplicationResponseSchema,
  );
  return res.response as { status?: string } | undefined;
}

// ─── Company Applicant Management & Talent Pool ──────────────

export async function fetchJobApplicants(
  jobId: string,
  params?: {
    status?: string;
    search?: string;
    sort_by?: string;
    page?: number;
    per_page?: number;
  },
): Promise<JobApplicantsResponse> {
  const query = new URLSearchParams();

  if (params?.status) query.set("status", params.status);
  if (params?.page !== undefined) {
    query.set("page", String(params.page));
    query.set("pageIndex", String(params.page));
  }
  if (params?.per_page !== undefined)
    query.set("per_page", String(params.per_page));
  if (params?.search?.trim()) query.set("search", params.search.trim());
  if (params?.sort_by) query.set("sort_by", params.sort_by);

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
  if (params?.sort_by) query.set("sortBy", params.sort_by);
  if (params?.sort_order) query.set("sort_order", params.sort_order);

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

// ─── Analytics & Summaries (§5, §13) ─────────────────────────

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

// ─── Company Admin Links & Co-Admins (§2) ───────────────────

export async function inviteCompanyAdmin(
  email: string,
): Promise<CompanyAdminLink> {
  const res = await apiClient.post(
    endpoints.company.adminLink,
    { email },
    CompanyAdminLinkResponseSchema,
  );
  return res.response;
}

export async function respondCompanyAdminInvitation(
  linkId: string,
  accept: boolean,
): Promise<CompanyAdminLink> {
  const res = await apiClient.post(
    endpoints.company.adminLinkRespond(linkId),
    { accept },
    CompanyAdminLinkResponseSchema,
  );
  return res.response;
}

export async function removeCompanyAdmin(linkId: string): Promise<void> {
  await apiClient.delete(
    endpoints.company.adminLinkRemove(linkId),
    undefined,
    GenericResponseSchema,
  );
}

export async function leaveCompanyAdmin(linkId: string): Promise<void> {
  await apiClient.delete(
    endpoints.company.adminLinkLeave(linkId),
    undefined,
    GenericResponseSchema,
  );
}

export async function fetchCompanyAdminLinks(): Promise<CompanyAdminLink[]> {
  const res = await apiClient.get(
    endpoints.company.adminLinkList,
    CompanyAdminLinkListResponseSchema,
  );
  return res.response ?? [];
}

export async function fetchUserCompanyStatus(): Promise<UserCompanyStatus> {
  const res = await apiClient.get(
    endpoints.company.userStatus,
    UserCompanyStatusResponseSchema,
  );
  return res.response;
}

export async function deactivateCompanySelf(): Promise<void> {
  await apiClient.post(
    endpoints.company.deactivateSelf,
    undefined,
    GenericResponseSchema,
  );
}

// ─── Admin Job Review (§4) ──────────────────────────────────

export async function fetchPendingJobs(
  params?: JobsListParams,
): Promise<JobsListResponse> {
  const query = new URLSearchParams();
  const page = params?.page ?? params?.pageIndex;
  if (page !== undefined) {
    query.set("page", String(page));
    query.set("pageIndex", String(page));
  }
  const perPage = params?.per_page ?? params?.perPage;
  if (perPage !== undefined) query.set("per_page", String(perPage));
  if (params?.search?.trim()) query.set("search", params.search.trim());
  const sortBy = params?.sort_by ?? params?.sortBy;
  if (sortBy) query.set("sortBy", sortBy);
  if (params?.job_type) query.set("job_type", params.job_type);

  const qs = query.toString();
  const url = qs
    ? `${endpoints.company.jobsPending}?${qs}`
    : endpoints.company.jobsPending;

  const res = await apiClient.get(url, JobsListResponseSchema);
  return res.response;
}

export async function approveJob(jobId: string): Promise<void> {
  await apiClient.post(
    endpoints.company.jobApprove(jobId),
    undefined,
    GenericResponseSchema,
  );
}

export async function rejectJob(jobId: string, reason: string): Promise<void> {
  await apiClient.post(
    endpoints.company.jobReject(jobId),
    { reason },
    GenericResponseSchema,
  );
}

export async function requestJobChanges(
  jobId: string,
  note: string,
): Promise<void> {
  await apiClient.post(
    endpoints.company.jobRequestChanges(jobId),
    { note },
    GenericResponseSchema,
  );
}

// ─── Extended Analytics (§5) ────────────────────────────────

export async function fetchCampusAnalytics(): Promise<CampusAnalytics> {
  const res = await apiClient.get(
    endpoints.company.analyticsCampus,
    CampusAnalyticsResponseSchema,
  );
  return res.response;
}

export async function fetchCampusQuarterTrend(params: {
  campus_id: string;
  quarters?: number;
}): Promise<CampusTrend> {
  const query = new URLSearchParams();
  if (params.campus_id) query.set("campus_id", params.campus_id);
  if (params.quarters !== undefined)
    query.set("quarters", String(params.quarters));

  const queryString = query.toString();
  const url = queryString
    ? `${endpoints.company.analyticsCampusTrend}?${queryString}`
    : endpoints.company.analyticsCampusTrend;

  const res = await apiClient.get(url, CampusTrendResponseSchema);
  return res.response;
}

export async function fetchTasksAnalytics(): Promise<TasksAnalytics> {
  const res = await apiClient.get(
    endpoints.company.analyticsTasks,
    TasksAnalyticsResponseSchema,
  );
  return res.response;
}

// ─── Talent Pool Shortlist & Insights (§6) ──────────────────

export async function fetchShortlistedLearners(): Promise<
  ShortlistedLearner[]
> {
  const res = await apiClient.get(
    endpoints.company.shortlist,
    ShortlistListResponseSchema,
  );
  return res.response ?? [];
}

export async function addLearnerToShortlist(
  userId: string,
  note?: string,
): Promise<ShortlistedLearner> {
  const res = await apiClient.post(
    endpoints.company.shortlistAdd,
    { user_id: userId, note },
    ShortlistMutationResponseSchema,
  );
  return res.response;
}

export async function removeLearnerFromShortlist(
  userId: string,
): Promise<void> {
  await apiClient.delete(
    endpoints.company.shortlistRemove(userId),
    undefined,
    GenericResponseSchema,
  );
}

export async function fetchTalentPoolInsights(): Promise<TalentPoolInsights> {
  const res = await apiClient.get(
    endpoints.company.talentPoolInsights,
    TalentPoolInsightsResponseSchema,
  );
  return res.response;
}

export async function fetchTaskTemplates(): Promise<TaskTemplate[]> {
  const res = await apiClient.get(
    endpoints.company.taskTemplates,
    TaskTemplatesListResponseSchema,
  );
  if ("response" in res && res.response) {
    if (Array.isArray(res.response)) return res.response;
    if ("data" in res.response && Array.isArray(res.response.data)) {
      return res.response.data;
    }
  }
  if ("data" in res && Array.isArray(res.data)) {
    return res.data;
  }
  if (Array.isArray(res)) {
    return res;
  }
  return [];
}

export async function createTaskTemplate(
  payload: Partial<TaskTemplate>,
): Promise<TaskTemplate> {
  const res = await apiClient.post(
    endpoints.company.taskTemplates,
    payload,
    TaskTemplateDetailResponseSchema,
  );
  if ("response" in res && res.response) {
    return res.response as TaskTemplate;
  }
  return res as unknown as TaskTemplate;
}

export async function deleteTaskTemplate(templateId: string): Promise<void> {
  await apiClient.delete(
    endpoints.company.taskTemplateDetail(templateId),
    undefined,
    GenericResponseSchema,
  );
}

// ─── Feedback & Impact Reports (§8) ─────────────────────────

export async function submitCompanyFeedback(payload: {
  to_user_id?: string;
  rating: number;
  feedback_type: string;
  comments: string;
}): Promise<CompanyFeedback> {
  const res = await apiClient.post(
    endpoints.company.feedback,
    payload,
    CompanyFeedbackResponseSchema,
  );
  return res.response;
}

export async function fetchCompanyFeedbackList(): Promise<CompanyFeedback[]> {
  const res = await apiClient.get(
    endpoints.company.feedbackList,
    CompanyFeedbackListResponseSchema,
  );
  return res.response ?? [];
}

export async function fetchCompanyImpactReport(): Promise<ImpactReport> {
  const res = await apiClient.get(
    endpoints.company.impactReport,
    ImpactReportResponseSchema,
  );
  return res.response;
}

export async function togglePublishImpactReport(
  isPublished: boolean,
): Promise<ImpactReport> {
  const res = await apiClient.patch(
    endpoints.company.impactReportPublish,
    { is_published: isPublished },
    ImpactReportResponseSchema,
  );
  return res.response;
}

// ─── Inter-Company Collaboration (§9) ───────────────────────

export async function fetchCollaborations(): Promise<CompanyCollaboration[]> {
  const res = await apiClient.get(
    endpoints.company.collaborations,
    CompanyCollaborationListResponseSchema,
  );
  return res.response ?? [];
}

export async function createCollaboration(payload: {
  title: string;
  description: string;
  collaboration_type: string;
  partner_company_id?: string;
}): Promise<CompanyCollaboration> {
  const res = await apiClient.post(
    endpoints.company.collaborations,
    payload,
    CompanyCollaborationResponseSchema,
  );
  return res.response;
}

export async function discoverCollaborations(): Promise<
  CompanyCollaboration[]
> {
  const res = await apiClient.get(
    endpoints.company.collaborationsDiscover,
    CompanyCollaborationListResponseSchema,
  );
  return res.response ?? [];
}

export async function respondCollaboration(
  id: string,
  accept: boolean,
): Promise<CompanyCollaboration> {
  const res = await apiClient.post(
    endpoints.company.collaborationRespond(id),
    { accept },
    CompanyCollaborationResponseSchema,
  );
  return res.response;
}

export async function cancelCollaboration(id: string): Promise<void> {
  await apiClient.delete(
    endpoints.company.collaborationDetail(id),
    undefined,
    GenericResponseSchema,
  );
}

// ─── Interest Group Sponsorships (§10) ──────────────────────

export async function submitIgSponsorship(
  igId: string,
  payload: { proposal: string; budget?: number; duration_months?: number },
): Promise<void> {
  await apiClient.post(
    endpoints.company.igSponsorship(igId),
    payload,
    GenericResponseSchema,
  );
}

export async function reviewIgSponsorship(
  igId: string,
  payload: { action: "APPROVE" | "REJECT"; comments?: string },
): Promise<void> {
  await apiClient.patch(
    endpoints.company.igSponsorshipReview(igId),
    payload,
    GenericResponseSchema,
  );
}

export async function fetchIgSponsorshipMetrics(
  igId: string,
): Promise<IgSponsorshipMetrics> {
  const res = await apiClient.get(
    endpoints.company.igSponsorshipMetrics(igId),
    IgSponsorshipMetricsResponseSchema,
  );
  return res.response;
}

// ─── Event Templates (§11) ──────────────────────────────────

export async function fetchEventTemplates(): Promise<EventTemplate[]> {
  const res = await apiClient.get(
    endpoints.company.eventTemplates,
    EventTemplatesListResponseSchema,
  );
  if ("response" in res && res.response) {
    if (Array.isArray(res.response)) return res.response;
    if ("data" in res.response && Array.isArray(res.response.data)) {
      return res.response.data;
    }
  }
  if ("data" in res && Array.isArray(res.data)) {
    return res.data;
  }
  if (Array.isArray(res)) {
    return res;
  }
  return [];
}

export async function createEventTemplate(payload: {
  title: string;
  description?: string;
  event_type: string;
  default_duration_minutes?: number;
  mode?: string;
}): Promise<EventTemplate> {
  const res = await apiClient.post(
    endpoints.company.eventTemplates,
    payload,
    EventTemplateDetailResponseSchema,
  );
  if ("response" in res && res.response) {
    return res.response as EventTemplate;
  }
  return res as unknown as EventTemplate;
}

export async function deleteEventTemplate(templateId: string): Promise<void> {
  await apiClient.delete(
    endpoints.company.eventTemplateDetail(templateId),
    undefined,
    GenericResponseSchema,
  );
}
