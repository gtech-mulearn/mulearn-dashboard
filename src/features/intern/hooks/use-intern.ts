"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/api";
import { getApiResponseError } from "@/hooks/use-get-error";
import { internApi, type TInternQueryParams } from "../api";
import type {
  TInternTaskStatus,
  TLeaveSubmitPayload,
  TMonthlyReview,
  TMonthlyReviewPayload,
  TMonthlyReviewWindow,
  TTimesheetSubmitPayload,
  TTimesheetUpdatePayload,
} from "../types";
import { internKeys } from "./query-keys";

export function useInternOverview() {
  return useQuery({
    queryKey: internKeys.overviewStatus(),
    queryFn: () => internApi.getOverviewStatus(),
  });
}

export function useInternActivityLog(params?: TInternQueryParams) {
  return useQuery({
    queryKey: internKeys.overviewActivity(params ?? {}),
    queryFn: () => internApi.getOverviewActivity(params),
  });
}

export function useTopLeaderboard() {
  return useQuery({
    queryKey: internKeys.topLeaderboard(),
    queryFn: () => internApi.getTopLeaderboard(),
  });
}

export function useTimesheetHistory(
  params?: TInternQueryParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: internKeys.timesheetHistory(params ?? {}),
    queryFn: () => internApi.getTimesheetHistory(params),
    placeholderData: keepPreviousData,
    ...options,
  });
}

export function useTimesheets(params?: TInternQueryParams) {
  return useQuery({
    queryKey: [...internKeys.timesheets(), params ?? {}],
    queryFn: () => internApi.getTimesheets(params),
  });
}

export function useTimesheetsPrefill() {
  return useQuery({
    queryKey: [...internKeys.timesheets(), "prefill"],
    queryFn: () => internApi.getTimesheetsPrefill(),
  });
}

export function useTimesheetToday() {
  return useQuery({
    queryKey: internKeys.timesheetToday(),
    // Resolves to `null` when nothing was submitted today.
    queryFn: () => internApi.getTimesheetToday(),
    retry: false,
  });
}

/**
 * Refreshes everything a timesheet submit/edit can change. Submitting also
 * moves the intern on the leaderboard (backend ranking), so refresh it too.
 */
async function invalidateAfterTimesheetChange(
  queryClient: ReturnType<typeof useQueryClient>,
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: internKeys.timesheets() }),
    queryClient.invalidateQueries({ queryKey: internKeys.tasks() }),
    queryClient.invalidateQueries({ queryKey: internKeys.leaderboard() }),
    queryClient.invalidateQueries({ queryKey: internKeys.topLeaderboard() }),
  ]);
}

export function useSubmitTimesheet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TTimesheetSubmitPayload) =>
      internApi.submitTimesheet(payload),
    onSuccess: async () => {
      toast.success("Timesheet submitted");
      await invalidateAfterTimesheetChange(queryClient);
    },
    onError: (error) => {
      // 409 (already submitted for that date) is handled by the caller.
      if (error instanceof ApiError && error.status === 409) return;
      toast.error(
        getApiResponseError(error, { fallback: "Failed to submit timesheet" }),
      );
    },
  });
}

export function useEditTimesheet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: TTimesheetUpdatePayload;
    }) => internApi.updateTimesheet(id, payload),
    onSuccess: async () => {
      toast.success("Timesheet updated");
      await invalidateAfterTimesheetChange(queryClient);
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to update timesheet" }),
      );
    },
  });
}

// ── Monthly reviews ──────────────────────────────────────────

export function useMonthlyReviews(params?: TInternQueryParams) {
  return useQuery({
    queryKey: internKeys.monthlyReviewList(params ?? {}),
    queryFn: () => internApi.getMonthlyReviews(params),
  });
}

export function useMonthlyReviewPrefill(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: internKeys.monthlyReviewPrefill(),
    queryFn: () => internApi.getMonthlyReviewPrefill(),
    ...options,
  });
}

export function useMonthlyReviewCurrent() {
  return useQuery({
    queryKey: internKeys.monthlyReviewCurrent(),
    queryFn: () => internApi.getMonthlyReviewCurrent(),
  });
}

export function useMonthlyReviewHistory(params?: TInternQueryParams) {
  return useQuery({
    queryKey: internKeys.monthlyReviewHistory(params ?? {}),
    queryFn: () => internApi.getMonthlyReviewHistory(params),
  });
}

export function useMonthlyReviewDetail(id: string | undefined) {
  return useQuery({
    queryKey: internKeys.monthlyReviewDetail(id ?? ""),
    queryFn: () => internApi.getMonthlyReviewDetail(id as string),
    enabled: !!id,
  });
}

/** `response.window` on the "window closed" 400, if present. */
export function getMonthlyReviewErrorWindow(
  error: unknown,
): TMonthlyReviewWindow | null {
  if (!(error instanceof ApiError)) return null;
  const data = error.data as
    | { response?: { window?: TMonthlyReviewWindow } }
    | undefined;
  return data?.response?.window ?? null;
}

const MONTHLY_REVIEW_STALE_MESSAGES = [
  "Pending monthly review not found.",
  "This review can no longer be edited; its submission window has closed.",
];

async function syncMonthlyReview(
  queryClient: ReturnType<typeof useQueryClient>,
  review?: TMonthlyReview,
) {
  if (review) {
    queryClient.setQueryData(internKeys.monthlyReviewDetail(review.id), review);
  }
  await queryClient.invalidateQueries({
    queryKey: internKeys.monthlyReviews(),
  });
}

export function useSubmitMonthlyReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      payload,
    }: {
      payload: TMonthlyReviewPayload;
      /** True when replacing a rejected review (changes the toast only). */
      isResubmit?: boolean;
    }) => internApi.submitMonthlyReview(payload),
    onSuccess: async (review, { isResubmit }) => {
      toast.success(
        isResubmit ? "Monthly review resubmitted" : "Monthly review submitted",
      );
      await syncMonthlyReview(queryClient, review);
    },
    onError: async (error) => {
      // Field errors are mapped onto the form by the caller.
      if (error instanceof ApiError && getFieldErrors(error)) return;
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to submit monthly review",
        }),
      );
      // 409 (already submitted) or window closed: the form state is stale.
      if (
        error instanceof ApiError &&
        (error.status === 409 || getMonthlyReviewErrorWindow(error))
      ) {
        await syncMonthlyReview(queryClient);
      }
    },
  });
}

export function useEditMonthlyReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: TMonthlyReviewPayload;
    }) => internApi.updateMonthlyReview(id, payload),
    onSuccess: async (review) => {
      toast.success("Monthly review updated");
      await syncMonthlyReview(queryClient, review);
    },
    onError: async (error) => {
      if (error instanceof ApiError && getFieldErrors(error)) return;
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to update monthly review",
        }),
      );
      if (
        error instanceof ApiError &&
        MONTHLY_REVIEW_STALE_MESSAGES.includes(error.message)
      ) {
        await syncMonthlyReview(queryClient);
      }
    },
  });
}

/**
 * Backend field errors (`response.<field>: string[]`) on a validation 400,
 * or `null` when the error isn't a field-validation error.
 */
export function getFieldErrors(
  error: unknown,
): Record<string, string[]> | null {
  if (!(error instanceof ApiError)) return null;
  const data = error.data as { response?: unknown } | undefined;
  const response = data?.response;
  if (!response || typeof response !== "object" || Array.isArray(response)) {
    return null;
  }
  const entries = Object.entries(response).filter(
    ([key, value]) =>
      key !== "window" &&
      Array.isArray(value) &&
      value.every((v) => typeof v === "string"),
  );
  return entries.length > 0
    ? (Object.fromEntries(entries) as Record<string, string[]>)
    : null;
}

export function useInternTasks(params?: TInternQueryParams) {
  return useQuery({
    queryKey: internKeys.tasksMine(params ?? {}),
    queryFn: () => internApi.getMyTasks(params),
  });
}

export function useTaskDetail(id: string) {
  return useQuery({
    queryKey: [...internKeys.tasks(), "detail", id],
    queryFn: () => internApi.getTaskDetail(id),
    enabled: !!id,
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
      outputLink,
    }: {
      id: string;
      status: TInternTaskStatus;
      outputLink?: string;
    }) => internApi.updateMyTaskStatus(id, status, outputLink),
    onSuccess: async () => {
      toast.success("Task status updated!");
      await queryClient.invalidateQueries({ queryKey: internKeys.tasks() });
      await queryClient.invalidateQueries({
        queryKey: internKeys.overviewStatus(),
      });
      await queryClient.invalidateQueries({
        queryKey: internKeys.overviewActivity({}),
      });
      await queryClient.invalidateQueries({
        queryKey: internKeys.topLeaderboard(),
      });
      await queryClient.invalidateQueries({
        queryKey: internKeys.leaderboard(),
      });
      await queryClient.invalidateQueries({
        queryKey: internKeys.leaderboardMe(),
      });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to update task status",
        }),
      );
    },
  });
}

export function useLeaveRequests(params?: TInternQueryParams) {
  return useQuery({
    queryKey: internKeys.leaveHistory(params ?? {}),
    queryFn: () => internApi.getLeaveRequests(params),
  });
}

export function useSubmitLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TLeaveSubmitPayload) =>
      internApi.submitLeaveRequest(payload),
    onSuccess: async () => {
      toast.success("Leave request submitted successfully!");
      await queryClient.invalidateQueries({ queryKey: internKeys.leaves() });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to submit leave request",
        }),
      );
    },
  });
}

export function useCancelLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => internApi.cancelLeaveRequest(id),
    onSuccess: async () => {
      toast.success("Leave request cancelled successfully!");
      await queryClient.invalidateQueries({ queryKey: internKeys.leaves() });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to cancel leave request",
        }),
      );
    },
  });
}

export function useLeaveBalance() {
  return useQuery({
    queryKey: internKeys.leaveBalance(),
    queryFn: () => internApi.getLeaveBalance(),
  });
}

export function useLeaderboard(params?: TInternQueryParams) {
  return useQuery({
    queryKey: internKeys.leaderboardFull(params ?? {}),
    queryFn: () => internApi.getFullLeaderboard(params),
  });
}

export function useLeaderboardMe() {
  return useQuery({
    queryKey: internKeys.leaderboardMe(),
    queryFn: () => internApi.getLeaderboardMe(),
  });
}

/** Active teams `{id,name,code}` for dropdowns. */
export function useActiveTeams(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: internKeys.activeTeams(),
    queryFn: () => internApi.getActiveTeams(),
    staleTime: 5 * 60 * 1000,
    ...options,
  });
}

export function useMyTeamMembers(params?: TInternQueryParams) {
  return useQuery({
    queryKey: internKeys.myTeamMembers(params ?? {}),
    queryFn: () => internApi.getMyTeamMembers(params),
    placeholderData: keepPreviousData,
  });
}
