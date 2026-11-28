import { apiClient, endpoints } from "@/api";
import type {
  TAdminMonthlyReview,
  TBulkImportResponse,
  TCreateTaskPayload,
  TInternDetail,
  TInternTask,
  TLeaveRequest,
  TLeaveReviewPayload,
  TManageInternItem,
  TMissingMonthlyReviews,
  TMissingTimesheets,
  TMonthlyReviewReviewPayload,
  TOnboardInternPayload,
  TPaginatedData,
  TReassignInternsPayload,
  TReassignInternsResponse,
  TTeam,
  TTeamPayload,
  TTimesheet,
  TUpdateInternPayload,
  TUpdateTaskPayload,
} from "../types";
import { buildQueryString, type TInternQueryParams } from "./intern.api";

export const manageInternsApi = {
  // ── Interns Management ─────────────────────────────────────
  getInternsList: async (
    params?: TInternQueryParams,
  ): Promise<TPaginatedData<TManageInternItem>> => {
    const qs = buildQueryString(params);
    return apiClient.get<TPaginatedData<TManageInternItem>>(
      `${endpoints.manageInterns.interns}${qs}`,
    );
  },

  getInternDetail: async (userId: string): Promise<TInternDetail> => {
    return apiClient.get<TInternDetail>(
      endpoints.manageInterns.internDetail(userId),
    );
  },

  onboardIntern: async (
    payload: TOnboardInternPayload,
  ): Promise<TManageInternItem> => {
    return apiClient.post<TManageInternItem>(
      endpoints.manageInterns.interns,
      payload,
    );
  },

  updateIntern: async (
    userId: string,
    payload: TUpdateInternPayload,
  ): Promise<TManageInternItem> => {
    return apiClient.patch<TManageInternItem>(
      endpoints.manageInterns.internDetail(userId),
      payload,
    );
  },

  deactivateIntern: async (userId: string, reason: string): Promise<void> => {
    await apiClient.delete(endpoints.manageInterns.internDetail(userId), {
      reason,
    });
  },

  reassignInterns: async (
    payload: TReassignInternsPayload,
  ): Promise<TReassignInternsResponse> => {
    return apiClient.post<TReassignInternsResponse>(
      endpoints.manageInterns.reassign,
      payload,
    );
  },

  // ── Teams ──────────────────────────────────────────────────
  getTeams: async (
    params?: TInternQueryParams,
  ): Promise<TPaginatedData<TTeam>> => {
    const qs = buildQueryString(params);
    return apiClient.get<TPaginatedData<TTeam>>(
      `${endpoints.manageInterns.teams}${qs}`,
    );
  },

  createTeam: async (payload: TTeamPayload): Promise<TTeam> => {
    return apiClient.post<TTeam>(endpoints.manageInterns.teams, payload);
  },

  updateTeam: async (id: string, payload: TTeamPayload): Promise<TTeam> => {
    return apiClient.patch<TTeam>(
      endpoints.manageInterns.teamDetail(id),
      payload,
    );
  },

  deactivateTeam: async (
    id: string,
  ): Promise<{ ended_memberships: number }> => {
    return apiClient.delete<{ ended_memberships: number }>(
      endpoints.manageInterns.teamDetail(id),
    );
  },

  activateTeam: async (id: string): Promise<TTeam> => {
    return apiClient.post<TTeam>(endpoints.manageInterns.teamActivate(id), {});
  },

  getInternsStatus: async (): Promise<Record<string, number>> => {
    return apiClient.get<Record<string, number>>(
      endpoints.manageInterns.status,
    );
  },

  exportInternsList: async (params?: TInternQueryParams): Promise<Blob> => {
    return apiClient.get<Blob>(
      `${endpoints.manageInterns.export}${buildQueryString(params)}`,
      undefined,
      { responseType: "blob" },
    );
  },

  // ── Task Management ────────────────────────────────────────
  getTasksList: async (
    params?: TInternQueryParams,
  ): Promise<TPaginatedData<TInternTask>> => {
    const qs = buildQueryString(params);
    return apiClient.get<TPaginatedData<TInternTask>>(
      `${endpoints.manageInterns.tasks}${qs}`,
    );
  },

  getTaskDetail: async (id: string): Promise<TInternTask> => {
    return apiClient.get<TInternTask>(endpoints.manageInterns.taskDetail(id));
  },

  createTask: async (payload: TCreateTaskPayload): Promise<void> => {
    await apiClient.post(endpoints.manageInterns.tasks, payload);
  },

  updateTask: async (
    id: string,
    payload: TUpdateTaskPayload,
  ): Promise<void> => {
    await apiClient.patch(endpoints.manageInterns.taskDetail(id), payload);
  },

  deleteTask: async (id: string): Promise<void> => {
    await apiClient.delete(endpoints.manageInterns.taskDetail(id));
  },

  verifyTask: async (
    id: string,
    payload: { karma_awarded: number },
  ): Promise<void> => {
    await apiClient.post(endpoints.manageInterns.taskVerify(id), payload);
  },

  getTasksByIntern: async (
    muid: string,
    params?: TInternQueryParams,
  ): Promise<TPaginatedData<TInternTask>> => {
    const qs = buildQueryString(params);
    return apiClient.get<TPaginatedData<TInternTask>>(
      `${endpoints.manageInterns.tasksByIntern(muid)}${qs}`,
    );
  },

  // ── Leave Review ───────────────────────────────────────────
  getLeaveRequests: async (
    params?: TInternQueryParams,
  ): Promise<TPaginatedData<TLeaveRequest>> => {
    const qs = buildQueryString(params);
    return apiClient.get<TPaginatedData<TLeaveRequest>>(
      `${endpoints.manageInterns.leave}${qs}`,
    );
  },

  getLeaveDetail: async (id: string): Promise<TLeaveRequest> => {
    return apiClient.get<TLeaveRequest>(
      endpoints.manageInterns.leaveDetail(id),
    );
  },

  reviewLeave: async (
    id: string,
    payload: TLeaveReviewPayload,
  ): Promise<void> => {
    await apiClient.patch(endpoints.manageInterns.leaveReview(id), payload);
  },

  // ── Timesheets (no approval; review note only) ─────────────
  getTimesheetsList: async (
    params?: TInternQueryParams,
  ): Promise<TPaginatedData<TTimesheet>> => {
    const qs = buildQueryString(params);
    return apiClient.get<TPaginatedData<TTimesheet>>(
      `${endpoints.manageInterns.timesheetsReview}${qs}`,
    );
  },

  saveTimesheetReviewNote: async (
    id: string,
    review_note: string,
  ): Promise<TTimesheet> => {
    return apiClient.patch<TTimesheet>(
      endpoints.manageInterns.timesheetReview(id),
      { review_note },
    );
  },

  // ── Missing reports ────────────────────────────────────────
  getMissingTimesheets: async (
    params?: TInternQueryParams,
  ): Promise<TMissingTimesheets> => {
    return apiClient.get<TMissingTimesheets>(
      `${endpoints.manageInterns.missingTimesheets}${buildQueryString(params)}`,
    );
  },

  exportMissingTimesheets: async (
    params: TInternQueryParams,
  ): Promise<Blob> => {
    return apiClient.get<Blob>(
      `${endpoints.manageInterns.missingTimesheetsExport}${buildQueryString(params)}`,
      undefined,
      { responseType: "blob" },
    );
  },

  getMissingMonthlyReviews: async (
    params?: TInternQueryParams,
  ): Promise<TMissingMonthlyReviews> => {
    return apiClient.get<TMissingMonthlyReviews>(
      `${endpoints.manageInterns.missingMonthlyReviews}${buildQueryString(params)}`,
    );
  },

  exportMissingMonthlyReviews: async (
    params: TInternQueryParams,
  ): Promise<Blob> => {
    return apiClient.get<Blob>(
      `${endpoints.manageInterns.missingMonthlyReviewsExport}${buildQueryString(params)}`,
      undefined,
      { responseType: "blob" },
    );
  },

  // ── Monthly Review ─────────────────────────────────────────
  getMonthlyReviews: async (
    params?: TInternQueryParams,
  ): Promise<TPaginatedData<TAdminMonthlyReview>> => {
    const qs = buildQueryString(params);
    return apiClient.get<TPaginatedData<TAdminMonthlyReview>>(
      `${endpoints.manageInterns.monthlyReviews}${qs}`,
    );
  },

  /** Approve or reject a `PENDING` monthly review. */
  reviewMonthlyReview: async (
    id: string,
    payload: TMonthlyReviewReviewPayload,
  ): Promise<TAdminMonthlyReview> => {
    return apiClient.patch<TAdminMonthlyReview>(
      endpoints.manageInterns.monthlyReviewDetail(id),
      payload,
    );
  },

  downloadImportTemplate: async (): Promise<Blob> => {
    return apiClient.get<Blob>(
      endpoints.manageInterns.importTemplate,
      undefined,
      { responseType: "blob" },
    );
  },

  bulkImportInterns: async (file: File): Promise<TBulkImportResponse> => {
    const formData = new FormData();
    formData.append("excel_file", file);
    return apiClient.post<TBulkImportResponse>(
      endpoints.manageInterns.bulkImport,
      formData,
      undefined,
      { isFormData: true },
    );
  },
};
