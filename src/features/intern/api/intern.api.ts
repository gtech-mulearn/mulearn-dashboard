import { ApiError, apiClient, endpoints } from "@/api";
import type {
  TInternActivityLog,
  TInternOverviewStatus,
  TInternTask,
  TLeaderboardMe,
  TLeaderboardRow,
  TLeaveBalance,
  TLeaveRequest,
  TLeaveSubmitPayload,
  TMinuteItem,
  TPaginatedData,
  TSubmitMinutePayload,
  TTimesheet,
  TTimesheetSubmitPayload,
  TTimesheetSummary,
  TTimesheetUpdatePayload,
  TWeeklyReview,
  TWeeklyReviewSubmitPayload,
  TWeeklyReviewUpdatePayload,
} from "../types";

export interface TInternQueryParams {
  page?: number;
  perPage?: number;
  page_size?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: string;
  status?: string;
  guild?: string;
  complexity?: string;
  category?: string;
  team?: string;
}

function buildQueryString(params?: TInternQueryParams): string {
  if (!params) return "";
  const searchParams = new URLSearchParams();
  if (params.page !== undefined) {
    searchParams.set("page", String(params.page));
    searchParams.set("pageIndex", String(params.page));
    searchParams.set("page_index", String(params.page));
  }
  const perPageVal = params.perPage ?? params.page_size;
  if (perPageVal !== undefined) {
    searchParams.set("perPage", String(perPageVal));
    searchParams.set("per_page", String(perPageVal));
    searchParams.set("page_size", String(perPageVal));
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

  getTimesheetsPrefill: async (): Promise<{
    tasks: Array<{
      task_id: string;
      title: string;
      category: string;
      deadline: string;
      status: string;
      complexity: string;
      output_link: string | null;
      is_overdue: boolean;
    }>;
    on_leave: boolean;
  }> => {
    return apiClient.get(endpoints.intern.timesheetsPrefill);
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

  getTimesheetToday: async (): Promise<TTimesheet> => {
    return apiClient.get<TTimesheet>(endpoints.intern.timesheetToday);
  },

  getTimesheetHistory: async (
    params?: TInternQueryParams,
  ): Promise<TPaginatedData<TTimesheet>> => {
    const qs = buildQueryString(params);
    return apiClient.get<TPaginatedData<TTimesheet>>(
      `${endpoints.intern.timesheetHistory}${qs}`,
    );
  },

  getTimesheetSummary: async (): Promise<TTimesheetSummary> => {
    return apiClient.get<TTimesheetSummary>(endpoints.intern.timesheetSummary);
  },

  // ── Weekly Reviews ──────────────────────────────────────────
  getWeeklyReviews: async (
    params?: TInternQueryParams,
  ): Promise<TPaginatedData<TWeeklyReview>> => {
    const qs = buildQueryString(params);
    return apiClient.get<TPaginatedData<TWeeklyReview>>(
      `${endpoints.intern.reviews}${qs}`,
    );
  },

  getWeeklyReviewDetail: async (id: string): Promise<TWeeklyReview> => {
    return apiClient.get<TWeeklyReview>(endpoints.intern.reviewDetail(id));
  },

  getWeeklyReviewsPrefill: async (): Promise<{
    iso_year: number;
    iso_week: number;
    week_start: string;
    week_end: string;
    tasks: Array<{
      task_id: string;
      title: string;
      category: string;
      complexity: string;
      deadline: string;
      status: string;
      output_link: string | null;
    }>;
  }> => {
    return apiClient.get(endpoints.intern.reviewsPrefill);
  },

  submitWeeklyReview: async (
    payload: TWeeklyReviewSubmitPayload,
  ): Promise<void> => {
    await apiClient.post(endpoints.intern.reviews, payload);
  },

  updateWeeklyReview: async (
    id: string,
    payload: TWeeklyReviewUpdatePayload,
  ): Promise<void> => {
    await apiClient.patch(endpoints.intern.reviewDetail(id), payload);
  },

  getWeeklyReviewCurrent: async (): Promise<TWeeklyReview> => {
    return apiClient.get<TWeeklyReview>(endpoints.intern.reviewCurrent);
  },

  getWeeklyReviewHistory: async (
    params?: TInternQueryParams,
  ): Promise<TPaginatedData<TWeeklyReview>> => {
    const qs = buildQueryString(params);
    return apiClient.get<TPaginatedData<TWeeklyReview>>(
      `${endpoints.intern.reviewHistory}${qs}`,
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
    status: "WAITING_FOR_REVIEW" | "IN_PROGRESS" | "COMPLETED" | "ON_HOLD",
    output_link?: string,
  ): Promise<void> => {
    await apiClient.patch(endpoints.intern.taskSubmit(id), {
      status,
      output_link,
    });
  },

  getTaskCategories: async (): Promise<Record<string, string[]>> => {
    return apiClient.get<Record<string, string[]>>(
      endpoints.intern.tasksCategories,
    );
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

  // ── Guilds ─────────────────────────────────────────────────
  getGuilds: async (): Promise<string[]> => {
    return apiClient.get<string[]>(endpoints.intern.guilds);
  },

  // ── Minutes ────────────────────────────────────────────────
  submitMinute: async (payload: TSubmitMinutePayload): Promise<void> => {
    await apiClient.post(endpoints.intern.minutes, payload);
  },

  updateMinute: async (
    id: string,
    payload: TSubmitMinutePayload,
  ): Promise<void> => {
    await apiClient.put(endpoints.intern.minuteDetail(id), payload);
  },

  getMyMinutes: async (
    params?: TInternQueryParams,
  ): Promise<TPaginatedData<TMinuteItem>> => {
    const qs = buildQueryString(params);
    return apiClient.get<TPaginatedData<TMinuteItem>>(
      `${endpoints.intern.minutes}${qs}`,
    );
  },
};
