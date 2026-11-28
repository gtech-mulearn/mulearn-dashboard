import { ApiError, apiClient, endpoints } from "@/api";
import type {
  TInternActivityLog,
  TInternOverviewStatus,
  TInternTask,
  TInternTaskStatus,
  TLeaderboardMe,
  TLeaderboardRow,
  TLeaveBalance,
  TLeaveRequest,
  TLeaveSubmitPayload,
  TMonthlyReview,
  TMonthlyReviewCurrent,
  TMonthlyReviewPayload,
  TMonthlyReviewPrefill,
  TMyTeamMembers,
  TPaginatedData,
  TTeamRef,
  TTimesheet,
  TTimesheetPrefill,
  TTimesheetSubmitPayload,
  TTimesheetUpdatePayload,
} from "../types";

export interface TInternQueryParams {
  page?: number;
  perPage?: number;
  page_size?: number;
  search?: string;
  sortBy?: string;
  /**
   * UI-only sort direction. Never sent as its own query param: the backend
   * expects direction as a `-` prefix on `sortBy` (e.g. `sortBy=-entry_date`).
   */
  sortOrder?: "asc" | "desc" | string;
  status?: string;
  complexity?: string;
  category?: string;
  /** Admin only: one team. */
  team_id?: string;
  /** `true` includes people who are no longer current members. */
  include_former?: boolean;
  /** Admin only (teams list): also list inactive teams. */
  include_inactive?: boolean;
  muid?: string;
  date_from?: string;
  date_to?: string;
  year?: number;
  month?: number;
  /** Missing timesheets: `YYYY-MM-DD` (default today). */
  date?: string;
  /** Missing timesheets: filter on-leave people. */
  on_leave?: boolean;
  /** CSV range exports: `YYYY-MM-DD` (timesheets) or `YYYY-MM` (monthly). */
  from?: string;
  to?: string;
}

function buildSortBy(params: TInternQueryParams): string | undefined {
  if (!params.sortBy) return undefined;
  const field = params.sortBy.replace(/^-/, "");
  const isDesc =
    params.sortOrder === "desc" ||
    (params.sortOrder === undefined && params.sortBy.startsWith("-"));
  return isDesc ? `-${field}` : field;
}

export function buildQueryString(params?: TInternQueryParams): string {
  if (!params) return "";
  const searchParams = new URLSearchParams();
  if (params.page !== undefined) {
    searchParams.set("pageIndex", String(params.page));
  }
  const perPageVal = params.perPage ?? params.page_size;
  if (perPageVal !== undefined) {
    searchParams.set("perPage", String(perPageVal));
  }
  if (params.search) searchParams.set("search", params.search);
  const sortBy = buildSortBy(params);
  if (sortBy) searchParams.set("sortBy", sortBy);
  if (params.status) searchParams.set("status", params.status);
  if (params.complexity) searchParams.set("complexity", params.complexity);
  if (params.category) searchParams.set("category", params.category);
  if (params.team_id) searchParams.set("team_id", params.team_id);
  if (params.include_former) searchParams.set("include_former", "true");
  if (params.include_inactive) searchParams.set("include_inactive", "true");
  if (params.on_leave !== undefined) {
    searchParams.set("on_leave", String(params.on_leave));
  }
  if (params.date) searchParams.set("date", params.date);
  if (params.from) searchParams.set("from", params.from);
  if (params.to) searchParams.set("to", params.to);
  if (params.muid) searchParams.set("muid", params.muid);
  if (params.date_from) searchParams.set("date_from", params.date_from);
  if (params.date_to) searchParams.set("date_to", params.date_to);
  if (params.year !== undefined) searchParams.set("year", String(params.year));
  if (params.month !== undefined) {
    searchParams.set("month", String(params.month));
  }
  const qStr = searchParams.toString();
  return qStr ? `?${qStr}` : "";
}

export const internApi = {
  // ── Overview ───────────────────────────────────────────────
  getOverviewStatus: async (): Promise<TInternOverviewStatus> => {
    return apiClient.get<TInternOverviewStatus>(
      endpoints.intern.overviewStatus,
    );
  },

  getOverviewActivity: async (
    params?: TInternQueryParams,
  ): Promise<TPaginatedData<TInternActivityLog>> => {
    const qs = buildQueryString(params);
    return apiClient.get<TPaginatedData<TInternActivityLog>>(
      `${endpoints.intern.overviewActivity}${qs}`,
    );
  },

  getTopLeaderboard: async (): Promise<TLeaderboardRow[]> => {
    return apiClient.get<TLeaderboardRow[]>(endpoints.intern.topLeaderboard);
  },

  // ── Timesheets ─────────────────────────────────────────────
  getTimesheets: async (
    params?: TInternQueryParams,
  ): Promise<TPaginatedData<TTimesheet>> => {
    const qs = buildQueryString(params);
    return apiClient.get<TPaginatedData<TTimesheet>>(
      `${endpoints.intern.timesheets}${qs}`,
    );
  },

  getTimesheetDetail: async (id: string): Promise<TTimesheet> => {
    return apiClient.get<TTimesheet>(endpoints.intern.timesheetDetail(id));
  },

  getTimesheetsPrefill: async (): Promise<TTimesheetPrefill> => {
    return apiClient.get<TTimesheetPrefill>(endpoints.intern.timesheetsPrefill);
  },

  submitTimesheet: async (payload: TTimesheetSubmitPayload): Promise<void> => {
    await apiClient.post(endpoints.intern.timesheets, payload);
  },

  updateTimesheet: async (
    id: string,
    payload: TTimesheetUpdatePayload,
  ): Promise<void> => {
    await apiClient.patch(endpoints.intern.timesheetDetail(id), payload);
  },

  /** Returns `null` when nothing was submitted today (backend answers 400). */
  getTimesheetToday: async (): Promise<TTimesheet | null> => {
    try {
      return await apiClient.get<TTimesheet>(endpoints.intern.timesheetToday);
    } catch (error) {
      if (error instanceof ApiError && error.status === 400) {
        return null;
      }
      throw error;
    }
  },

  getTimesheetHistory: async (
    params?: TInternQueryParams,
  ): Promise<TPaginatedData<TTimesheet>> => {
    const qs = buildQueryString(params);
    return apiClient.get<TPaginatedData<TTimesheet>>(
      `${endpoints.intern.timesheetHistory}${qs}`,
    );
  },

  // ── Monthly Reviews ─────────────────────────────────────────
  getMonthlyReviews: async (
    params?: TInternQueryParams,
  ): Promise<TPaginatedData<TMonthlyReview>> => {
    const qs = buildQueryString(params);
    return apiClient.get<TPaginatedData<TMonthlyReview>>(
      `${endpoints.intern.monthlyReviews}${qs}`,
    );
  },

  getMonthlyReviewDetail: async (id: string): Promise<TMonthlyReview> => {
    return apiClient.get<TMonthlyReview>(
      endpoints.intern.monthlyReviewDetail(id),
    );
  },

  getMonthlyReviewPrefill: async (): Promise<TMonthlyReviewPrefill> => {
    return apiClient.get<TMonthlyReviewPrefill>(
      endpoints.intern.monthlyReviewsPrefill,
    );
  },

  getMonthlyReviewCurrent: async (): Promise<TMonthlyReviewCurrent> => {
    return apiClient.get<TMonthlyReviewCurrent>(
      endpoints.intern.monthlyReviewCurrent,
    );
  },

  getMonthlyReviewHistory: async (
    params?: TInternQueryParams,
  ): Promise<TPaginatedData<TMonthlyReview>> => {
    const qs = buildQueryString(params);
    return apiClient.get<TPaginatedData<TMonthlyReview>>(
      `${endpoints.intern.monthlyReviewHistory}${qs}`,
    );
  },

  /** Submits (or, after a rejection, resubmits) the open window's review. */
  submitMonthlyReview: async (
    payload: TMonthlyReviewPayload,
  ): Promise<TMonthlyReview> => {
    return apiClient.post<TMonthlyReview>(
      endpoints.intern.monthlyReviews,
      payload,
    );
  },

  /** Edits a `PENDING` review while its window is open. */
  updateMonthlyReview: async (
    id: string,
    payload: TMonthlyReviewPayload,
  ): Promise<TMonthlyReview> => {
    return apiClient.patch<TMonthlyReview>(
      endpoints.intern.monthlyReviewDetail(id),
      payload,
    );
  },

  // ── Tasks ──────────────────────────────────────────────────
  getMyTasks: async (
    params?: TInternQueryParams,
  ): Promise<TPaginatedData<TInternTask>> => {
    const qs = buildQueryString(params);
    return apiClient.get<TPaginatedData<TInternTask>>(
      `${endpoints.intern.tasksMine}${qs}`,
    );
  },

  updateMyTaskStatus: async (
    id: string,
    status: TInternTaskStatus,
    output_link?: string,
  ): Promise<void> => {
    await apiClient.patch(endpoints.intern.taskSubmit(id), {
      status,
      output_link,
    });
  },

  getTaskDetail: async (id: string): Promise<TInternTask> => {
    return apiClient.get<TInternTask>(endpoints.intern.taskDetail(id));
  },

  // ── Leave Management ───────────────────────────────────────
  getLeaveRequests: async (
    params?: TInternQueryParams,
  ): Promise<TPaginatedData<TLeaveRequest>> => {
    const qs = buildQueryString(params);
    return apiClient.get<TPaginatedData<TLeaveRequest>>(
      `${endpoints.intern.leave}${qs}`,
    );
  },

  getLeaveRequestDetail: async (id: string): Promise<TLeaveRequest> => {
    return apiClient.get<TLeaveRequest>(endpoints.intern.leaveDetail(id));
  },

  submitLeaveRequest: async (payload: TLeaveSubmitPayload): Promise<void> => {
    await apiClient.post(endpoints.intern.leave, payload);
  },

  cancelLeaveRequest: async (id: string): Promise<void> => {
    await apiClient.patch(endpoints.intern.leaveDetail(id), {
      action: "cancel",
    });
  },

  getLeaveHistory: async (
    params?: TInternQueryParams,
  ): Promise<TPaginatedData<TLeaveRequest>> => {
    const qs = buildQueryString(params);
    return apiClient.get<TPaginatedData<TLeaveRequest>>(
      `${endpoints.intern.leaveHistory}${qs}`,
    );
  },

  getLeaveBalance: async (): Promise<TLeaveBalance> => {
    return apiClient.get<TLeaveBalance>(endpoints.intern.leaveBalance);
  },

  // ── Leaderboard ────────────────────────────────────────────
  getFullLeaderboard: async (
    params?: TInternQueryParams,
  ): Promise<TPaginatedData<TLeaderboardRow>> => {
    const qs = buildQueryString(params);
    return apiClient.get<TPaginatedData<TLeaderboardRow>>(
      `${endpoints.intern.leaderboard}${qs}`,
    );
  },

  getLeaderboardMe: async (): Promise<TLeaderboardMe> => {
    try {
      return await apiClient.get<TLeaderboardMe>(
        endpoints.intern.leaderboardMe,
      );
    } catch (error) {
      if (error instanceof ApiError && error.status === 400) {
        return { rank: 0, score: 0 };
      }
      throw error;
    }
  },

  // ── Teams ──────────────────────────────────────────────────
  /** Active teams for dropdowns (not paginated). */
  getActiveTeams: async (): Promise<TTeamRef[]> => {
    return apiClient.get<TTeamRef[]>(endpoints.intern.teams);
  },

  getMyTeamMembers: async (
    params?: TInternQueryParams,
  ): Promise<TMyTeamMembers> => {
    const qs = buildQueryString(params);
    return apiClient.get<TMyTeamMembers>(
      `${endpoints.intern.teamMembers}${qs}`,
    );
  },
};
