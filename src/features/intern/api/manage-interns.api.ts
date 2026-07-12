import { apiClient, endpoints } from "@/api";
import type {
  TBulkImportResponse,
  TCreateTaskPayload,
  TInternTask,
  TLeaveRequest,
  TLeaveReviewPayload,
  TManageInternItem,
  TMinuteItem,
  TOnboardInternPayload,
  TPaginatedData,
  TTimesheet,
  TTimesheetReviewPayload,
  TUpdateInternPayload,
  TUpdateTaskPayload,
  TWeeklyReview,
  TWeeklyReviewReviewPayload,
} from "../types";
import type { TInternQueryParams } from "./intern.api";

function buildQueryString(params?: TInternQueryParams): string {
  if (!params) return "";
  const searchParams = new URLSearchParams();
  if (params.page !== undefined) {
    searchParams.set("page", String(params.page));
    searchParams.set("pageIndex", String(params.page));
    searchParams.set("page_index", String(params.page));
  }
  if (params.perPage !== undefined) {
    searchParams.set("perPage", String(params.perPage));
    searchParams.set("per_page", String(params.perPage));
    searchParams.set("page_size", String(params.perPage));
  }
  if (params.search) searchParams.set("search", params.search);
  if (params.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params.sortOrder) searchParams.set("sortOrder", params.sortOrder);
  if (params.status) searchParams.set("status", params.status);
  if (params.guild) searchParams.set("guild", params.guild);
  if (params.complexity) searchParams.set("complexity", params.complexity);
  if (params.category) searchParams.set("category", params.category);
  if (params.team) searchParams.set("team", params.team);
  const qStr = searchParams.toString();
  return qStr ? `?${qStr}` : "";
}

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

  // ── Timesheet Review ───────────────────────────────────────
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

  reviewTimesheet: async (
    id: string,
    payload: TTimesheetReviewPayload,
  ): Promise<void> => {
    await apiClient.patch(
      endpoints.manageInterns.timesheetReviewDetail(id),
      payload,
    );
  },

  // ── Weekly Review ──────────────────────────────────────────
  getWeeklyReviews: async (
    params?: TInternQueryParams,
  ): Promise<TPaginatedData<TWeeklyReview>> => {
    const qs = buildQueryString(params);
    return apiClient.get<TPaginatedData<TWeeklyReview>>(
      `${endpoints.manageInterns.reviews}${qs}`,
    );
  },

  getWeeklyReviewDetail: async (id: string): Promise<TWeeklyReview> => {
    return apiClient.get<TWeeklyReview>(
      endpoints.manageInterns.weeklyReviewDetail(id),
    );
  },

  reviewWeeklyReview: async (
    id: string,
    payload: TWeeklyReviewReviewPayload,
  ): Promise<void> => {
    await apiClient.patch(
      endpoints.manageInterns.weeklyReviewDetail(id),
      payload,
    );
  },

  // ── Minutes (Admin/Lead View) ─────────────────────────────
  getAllMinutes: async (
    params?: TInternQueryParams,
  ): Promise<TPaginatedData<TMinuteItem>> => {
    const qs = buildQueryString(params);
    return apiClient.get<TPaginatedData<TMinuteItem>>(
      `${endpoints.manageInterns.minutes}${qs}`,
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
