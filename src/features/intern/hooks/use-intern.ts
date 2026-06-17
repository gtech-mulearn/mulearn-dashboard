"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/api/errors";
import { internApi, type TInternQueryParams } from "../api";
import type {
  TLeaveSubmitPayload,
  TSubmitMinutePayload,
  TTimesheetSubmitPayload,
  TTimesheetUpdatePayload,
  TWeeklyReviewSubmitPayload,
  TWeeklyReviewUpdatePayload,
} from "../types";
import { internKeys } from "./query-keys";

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError && error.message) {
    return error.message;
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
}

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

export function useTimesheetHistory(params?: TInternQueryParams) {
  return useQuery({
    queryKey: internKeys.timesheetHistory(params ?? {}),
    queryFn: () => internApi.getTimesheetHistory(params),
  });
}

export function useTimesheets(params?: TInternQueryParams) {
  return useQuery({
    queryKey: [...internKeys.timesheets(), params ?? {}],
    queryFn: () => internApi.getTimesheets(params),
  });
}

export function useTimesheetToday() {
  return useQuery({
    queryKey: internKeys.timesheetToday(),
    queryFn: () => internApi.getTimesheetToday(),
    retry: false, // Don't spam if 400 (none submitted today)
  });
}

export function useSubmitTimesheet() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TTimesheetSubmitPayload) =>
      internApi.submitTimesheet(payload),
    onSuccess: async () => {
      toast.success("Timesheet submitted successfully!");
      await queryClient.invalidateQueries({
        queryKey: internKeys.timesheets(),
      });
      await queryClient.invalidateQueries({
        queryKey: internKeys.overviewStatus(),
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to submit timesheet"));
    },
  });
}

export function useEditTimesheet(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TTimesheetUpdatePayload) =>
      internApi.updateTimesheet(id, payload),
    onSuccess: async () => {
      toast.success("Timesheet updated successfully!");
      await queryClient.invalidateQueries({
        queryKey: internKeys.timesheets(),
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update timesheet"));
    },
  });
}

export function useWeeklyReviews(params?: TInternQueryParams) {
  return useQuery({
    queryKey: internKeys.reviewHistory(params ?? {}),
    queryFn: () => internApi.getWeeklyReviews(params),
  });
}

export function useWeeklyReviewHistory(params?: TInternQueryParams) {
  return useQuery({
    queryKey: [...internKeys.reviews(), "history", params ?? {}],
    queryFn: () => internApi.getWeeklyReviewHistory(params),
  });
}

export function useWeeklyReviewCurrent() {
  return useQuery({
    queryKey: internKeys.reviewCurrent(),
    queryFn: () => internApi.getWeeklyReviewCurrent(),
    retry: false,
  });
}

export function useSubmitWeeklyReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TWeeklyReviewSubmitPayload) =>
      internApi.submitWeeklyReview(payload),
    onSuccess: async () => {
      toast.success("Weekly review submitted successfully!");
      await queryClient.invalidateQueries({ queryKey: internKeys.reviews() });
      await queryClient.invalidateQueries({
        queryKey: internKeys.overviewStatus(),
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to submit weekly review"));
    },
  });
}

export function useEditWeeklyReview(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TWeeklyReviewUpdatePayload) =>
      internApi.updateWeeklyReview(id, payload),
    onSuccess: async () => {
      toast.success("Weekly review updated successfully!");
      await queryClient.invalidateQueries({ queryKey: internKeys.reviews() });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update weekly review"));
    },
  });
}

export function useInternTasks(params?: TInternQueryParams) {
  return useQuery({
    queryKey: internKeys.tasksMine(params ?? {}),
    queryFn: () => internApi.getMyTasks(params),
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
      status: "WAITING_FOR_REVIEW" | "IN_PROGRESS" | "COMPLETED" | "ON_HOLD";
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
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update task status"));
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
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to submit leave request"));
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
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to cancel leave request"));
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

export function useGuilds() {
  return useQuery({
    queryKey: internKeys.guilds(),
    queryFn: () => internApi.getGuilds(),
  });
}

export function useMyMinutes(params?: TInternQueryParams) {
  return useQuery({
    queryKey: internKeys.myMinutes(params ?? {}),
    queryFn: () => internApi.getMyMinutes(params),
  });
}

export function useSubmitMinute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TSubmitMinutePayload) =>
      internApi.submitMinute(payload),
    onSuccess: async () => {
      toast.success("Minutes uploaded successfully!");
      await queryClient.invalidateQueries({
        queryKey: internKeys.myMinutes({}),
      });
      await queryClient.invalidateQueries({
        queryKey: ["manage-minutes"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["intern", "manage", "minutes"],
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to upload minutes"));
    },
  });
}

export function useUpdateMinute(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TSubmitMinutePayload) =>
      internApi.updateMinute(id, payload),
    onSuccess: async () => {
      toast.success("Minutes updated successfully!");
      await queryClient.invalidateQueries({
        queryKey: internKeys.myMinutes({}),
      });
      await queryClient.invalidateQueries({
        queryKey: ["manage-minutes"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["intern", "manage", "minutes"],
      });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update minutes"));
    },
  });
}
