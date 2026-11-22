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
import { manageInternsApi, type TInternQueryParams } from "../api";
import type {
  TCreateTaskPayload,
  TInternTask,
  TLeaveRequest,
  TLeaveReviewPayload,
  TManageInternItem,
  TMonthlyReviewReviewPayload,
  TOnboardInternPayload,
  TPaginatedData,
  TUpdateInternPayload,
  TUpdateTaskPayload,
} from "../types";
import { internKeys } from "./query-keys";

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
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to onboard intern" }),
      );
    },
  });
}

export function useUpdateIntern(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TUpdateInternPayload) =>
      manageInternsApi.updateIntern(id, payload),
    onSuccess: async (_data, payload) => {
      toast.success("Intern updated successfully!");

      // Optimistically patch the role in every cached manage-interns list
      // This ensures the Role column updates immediately even if the backend
      // doesn't yet return the 'role' field in its list response.
      queryClient.setQueriesData(
        { queryKey: internKeys.manage() },
        (old: unknown) => {
          if (!old || typeof old !== "object") return old;
          const cached = old as {
            data?: TManageInternItem[];
            [key: string]: unknown;
          };
          if (!Array.isArray(cached.data)) return old;
          return {
            ...cached,
            data: cached.data.map((item) =>
              item.id === id
                ? {
                    ...item,
                    guild: payload.guild ?? item.guild,
                    status: payload.status ?? item.status,
                    role: payload.role ?? item.role,
                  }
                : item,
            ),
          };
        },
      );

      // Invalidate to sync with backend once it's ready
      await queryClient.invalidateQueries({ queryKey: internKeys.manage() });
      await queryClient.invalidateQueries({
        queryKey: internKeys.overviewStatus(),
      });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to update intern" }),
      );
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
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to deactivate intern" }),
      );
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
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to export intern list",
        }),
      );
    },
  });
}

export function useDownloadImportTemplate() {
  return useMutation({
    mutationFn: () => manageInternsApi.downloadImportTemplate(),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "intern_bulk_import_template.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Template downloaded successfully!");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to download template",
        }),
      );
    },
  });
}

export function useBulkImportInterns() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => manageInternsApi.bulkImportInterns(file),
    onSuccess: async (data) => {
      if (data.success_count > 0) {
        toast.success(
          `Successfully onboarded ${data.success_count} intern(s)!`,
        );
      }
      if (data.failed_count > 0) {
        toast.warning(
          `${data.failed_count} row(s) failed — check results for details.`,
        );
      }
      await queryClient.invalidateQueries({ queryKey: internKeys.manage() });
      await queryClient.invalidateQueries({
        queryKey: internKeys.overviewStatus(),
      });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Bulk import failed" }),
      );
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
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to create task" }),
      );
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
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to update task" }),
      );
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
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to delete task" }),
      );
    },
  });
}

export function useVerifyTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      karma_awarded,
    }: {
      id: string;
      karma_awarded: number;
    }) => manageInternsApi.verifyTask(id, { karma_awarded }),
    onSuccess: async () => {
      toast.success("Task verified successfully!");
      await queryClient.invalidateQueries({ queryKey: internKeys.manage() });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to verify task" }),
      );
    },
  });
}

export function useTasksByIntern(muid: string, params?: TInternQueryParams) {
  return useQuery<TPaginatedData<TInternTask>>({
    queryKey: [
      ...internKeys.manage(),
      "tasks",
      "by-intern",
      muid,
      params ?? {},
    ],
    queryFn: () => manageInternsApi.getTasksByIntern(muid, params),
    enabled: !!muid,
  });
}

export function useManageTaskDetail(id: string) {
  return useQuery<TInternTask>({
    queryKey: internKeys.manageTaskDetail(id),
    queryFn: () => manageInternsApi.getTaskDetail(id),
    enabled: !!id,
  });
}

// ── Leave Review ───────────────────────────────────────────
export function useManageLeaves(params?: TInternQueryParams) {
  return useQuery({
    queryKey: internKeys.manageLeaves(params ?? {}),
    queryFn: () => manageInternsApi.getLeaveRequests(params),
  });
}

export function useLeaveDetail(id: string) {
  return useQuery<TLeaveRequest>({
    queryKey: internKeys.manageLeaveDetail(id),
    queryFn: () => manageInternsApi.getLeaveDetail(id),
    enabled: !!id,
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
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to submit leave review",
        }),
      );
    },
  });
}

// ── Timesheets (read-only; approval removed) ───────────────
export function useManageTimesheets(
  params?: TInternQueryParams,
  enabled = true,
) {
  return useQuery({
    queryKey: internKeys.manageTimesheets(params ?? {}),
    queryFn: () => manageInternsApi.getTimesheetsList(params),
    enabled,
    placeholderData: keepPreviousData,
  });
}

// ── Monthly Review ─────────────────────────────────────────
export function useManageMonthlyReviews(
  params?: TInternQueryParams,
  enabled = true,
) {
  return useQuery({
    queryKey: internKeys.manageMonthlyReviews(params ?? {}),
    queryFn: () => manageInternsApi.getMonthlyReviews(params),
    enabled,
    placeholderData: keepPreviousData,
  });
}

/** Approval doesn't affect ranking, so the leaderboard isn't refreshed. */
export function useReviewMonthlyReview(id: string) {
  const queryClient = useQueryClient();
  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({
        queryKey: internKeys.manageMonthlyReviewsAll(),
      }),
      queryClient.invalidateQueries({
        queryKey: internKeys.monthlyReviews(),
      }),
    ]);
  return useMutation({
    mutationFn: (payload: TMonthlyReviewReviewPayload) =>
      manageInternsApi.reviewMonthlyReview(id, payload),
    onSuccess: async (_data, variables) => {
      toast.success(
        variables.action === "approve"
          ? "Monthly review approved"
          : "Monthly review rejected",
      );
      await refresh();
    },
    onError: async (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to review monthly review",
        }),
      );
      // Someone else already reviewed it: reload the list.
      if (
        error instanceof ApiError &&
        error.message === "Pending monthly review not found."
      ) {
        await refresh();
      }
    },
  });
}
