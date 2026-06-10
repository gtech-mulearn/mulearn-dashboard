"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/api/errors";
import { manageInternsApi, type TInternQueryParams } from "../api";
import type {
  TCreateTaskPayload,
  TLeaveReviewPayload,
  TOnboardInternPayload,
  TTimesheetReviewPayload,
  TUpdateInternPayload,
  TUpdateTaskPayload,
  TWeeklyReviewReviewPayload,
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

export function useManageInternsList(params?: TInternQueryParams) {
  return useQuery({
    queryKey: internKeys.manageInterns(params ?? {}),
    queryFn: () => manageInternsApi.getInternsList(params),
  });
}

export function useOnboardIntern() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TOnboardInternPayload) =>
      manageInternsApi.onboardIntern(payload),
    onSuccess: async () => {
      toast.success("Intern onboarded successfully!");
      await queryClient.invalidateQueries({ queryKey: internKeys.manage() });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to onboard intern"));
    },
  });
}

export function useUpdateIntern(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TUpdateInternPayload) =>
      manageInternsApi.updateIntern(id, payload),
    onSuccess: async () => {
      toast.success("Intern updated successfully!");
      await queryClient.invalidateQueries({ queryKey: internKeys.manage() });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update intern"));
    },
  });
}

export function useDeactivateIntern() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => manageInternsApi.deactivateIntern(id),
    onSuccess: async () => {
      toast.success("Intern deactivated successfully!");
      await queryClient.invalidateQueries({ queryKey: internKeys.manage() });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to deactivate intern"));
    },
  });
}

export function useManageInternsStatus() {
  return useQuery({
    queryKey: internKeys.manageStatus(),
    queryFn: () => manageInternsApi.getInternsStatus(),
  });
}

export function useExportInterns() {
  return useMutation({
    mutationFn: () => manageInternsApi.exportInternsList(),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "interns.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Intern directory exported!");
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to export intern list"));
    },
  });
}

// ── Tasks ──────────────────────────────────────────────────
export function useManageTasks(params?: TInternQueryParams) {
  return useQuery({
    queryKey: internKeys.manageTasks(params ?? {}),
    queryFn: () => manageInternsApi.getTasksList(params),
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TCreateTaskPayload) =>
      manageInternsApi.createTask(payload),
    onSuccess: async () => {
      toast.success("Task created and assigned successfully!");
      await queryClient.invalidateQueries({ queryKey: internKeys.manage() });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to create task"));
    },
  });
}

export function useUpdateTask(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TUpdateTaskPayload) =>
      manageInternsApi.updateTask(id, payload),
    onSuccess: async () => {
      toast.success("Task updated successfully!");
      await queryClient.invalidateQueries({ queryKey: internKeys.manage() });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to update task"));
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => manageInternsApi.deleteTask(id),
    onSuccess: async () => {
      toast.success("Task deleted successfully!");
      await queryClient.invalidateQueries({ queryKey: internKeys.manage() });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to delete task"));
    },
  });
}

// ── Leave Review ───────────────────────────────────────────
export function useManageLeaves(params?: TInternQueryParams) {
  return useQuery({
    queryKey: internKeys.manageLeaves(params ?? {}),
    queryFn: () => manageInternsApi.getLeaveRequests(params),
  });
}

export function useReviewLeave(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TLeaveReviewPayload) =>
      manageInternsApi.reviewLeave(id, payload),
    onSuccess: async () => {
      toast.success("Leave review submitted!");
      await queryClient.invalidateQueries({ queryKey: internKeys.manage() });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to submit leave review"));
    },
  });
}

// ── Timesheet Review ───────────────────────────────────────
export function useManageTimesheets(params?: TInternQueryParams) {
  return useQuery({
    queryKey: internKeys.manageTimesheets(params ?? {}),
    queryFn: () => manageInternsApi.getTimesheetsList(params),
  });
}

export function useReviewTimesheet(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TTimesheetReviewPayload) =>
      manageInternsApi.reviewTimesheet(id, payload),
    onSuccess: async () => {
      toast.success("Timesheet review submitted!");
      await queryClient.invalidateQueries({ queryKey: internKeys.manage() });
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error, "Failed to submit timesheet review"));
    },
  });
}

// ── Weekly Review ──────────────────────────────────────────
export function useManageWeeklyReviews(params?: TInternQueryParams) {
  return useQuery({
    queryKey: internKeys.manageReviews(params ?? {}),
    queryFn: () => manageInternsApi.getWeeklyReviews(params),
  });
}

export function useReviewWeeklyReview(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TWeeklyReviewReviewPayload) =>
      manageInternsApi.reviewWeeklyReview(id, payload),
    onSuccess: async () => {
      toast.success("Weekly review evaluation submitted!");
      await queryClient.invalidateQueries({ queryKey: internKeys.manage() });
    },
    onError: (error: unknown) => {
      toast.error(
        getErrorMessage(error, "Failed to submit weekly review evaluation"),
      );
    },
  });
}
