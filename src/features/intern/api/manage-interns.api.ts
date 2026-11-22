import { apiClient, endpoints } from "@/api";
import type {
  TAdminMonthlyReview,
  TBulkImportResponse,
  TCreateTaskPayload,
  TInternTask,
  TLeaveRequest,
  TLeaveReviewPayload,
  TManageInternItem,
  TMonthlyReviewReviewPayload,
  TOnboardInternPayload,
  TPaginatedData,
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

  getInternDetail: async (id: string): Promise<TManageInternItem> => {
    return apiClient.get<TManageInternItem>(
      endpoints.manageInterns.internDetail(id),
    );
  },

  onboardIntern: async (payload: TOnboardInternPayload): Promise<void> => {
    await apiClient.post(endpoints.manageInterns.interns, payload);
  },

  updateIntern: async (
    id: string,
    payload: TUpdateInternPayload,
  ): Promise<void> => {
    await apiClient.patch(endpoints.manageInterns.internDetail(id), payload);
  },

  deactivateIntern: async (id: string): Promise<void> => {
    await apiClient.delete(endpoints.manageInterns.internDetail(id));
  },

  getInternsStatus: async (): Promise<Record<string, number>> => {
    return apiClient.get<Record<string, number>>(
      endpoints.manageInterns.status,
    );
  },

  exportInternsList: async (): Promise<Blob> => {
    return apiClient.get<Blob>(endpoints.manageInterns.export, undefined, {
      responseType: "blob",
    });
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

  // ── Timesheets (read-only; approval removed) ───────────────
  getTimesheetsList: async (
    params?: TInternQueryParams,
  ): Promise<TPaginatedData<TTimesheet>> => {
    const qs = buildQueryString(params);
    return apiClient.get<TPaginatedData<TTimesheet>>(
      `${endpoints.manageInterns.timesheetsReview}${qs}`,
    );
  },

  getTimesheetDetail: async (id: string): Promise<TTimesheet> => {
    return apiClient.get<TTimesheet>(
      endpoints.manageInterns.timesheetReviewDetail(id),
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

  getMonthlyReviewDetail: async (id: string): Promise<TAdminMonthlyReview> => {
    return apiClient.get<TAdminMonthlyReview>(
      endpoints.manageInterns.monthlyReviewDetail(id),
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
