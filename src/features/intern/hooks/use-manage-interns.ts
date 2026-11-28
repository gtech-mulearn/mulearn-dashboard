"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/api";
import { useUserInfo } from "@/features/auth/hooks";
import { getApiResponseError } from "@/hooks/use-get-error";
import { ROLES } from "@/lib/auth/roles";
import { manageInternsApi, type TInternQueryParams } from "../api";
import type {
  TCreateTaskPayload,
  TInternTask,
  TLeaveRequest,
  TLeaveReviewPayload,
  TMonthlyReviewReviewPayload,
  TOnboardInternPayload,
  TPaginatedData,
  TReassignInternsPayload,
  TTeamPayload,
  TUpdateInternPayload,
  TUpdateTaskPayload,
} from "../types";
import { internKeys } from "./query-keys";

/** Admins see every team; Intern Leads only their own (server-scoped). */
export function useIsInternAdmin() {
  const { data: userInfo } = useUserInfo();
  return (
    Array.isArray(userInfo?.roles) &&
    (userInfo.roles as string[]).includes(ROLES.ADMIN)
  );
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
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to onboard intern" }),
      );
    },
  });
}

/** `userId` is the intern's user id (list rows: `row.user`). */
export function useUpdateIntern(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TUpdateInternPayload) =>
      manageInternsApi.updateIntern(userId, payload),
    onSuccess: async () => {
      toast.success("Intern updated successfully!");
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
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      manageInternsApi.deactivateIntern(userId, reason),
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

export function useInternDetail(userId: string | null) {
  return useQuery({
    queryKey: internKeys.manageInternDetail(userId ?? ""),
    queryFn: () => manageInternsApi.getInternDetail(userId as string),
    enabled: !!userId,
  });
}

export function useReassignInterns() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: TReassignInternsPayload) =>
      manageInternsApi.reassignInterns(payload),
    onSuccess: async (data) => {
      toast.success(`Moved ${data.moved_count} intern(s).`);
      if (data.already_in_team.length > 0) {
        toast.info(
          `${data.already_in_team.length} already in that team; skipped.`,
        );
      }
      await queryClient.invalidateQueries({ queryKey: internKeys.manage() });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to reassign interns" }),
      );
    },
  });
}

// ── Teams ──────────────────────────────────────────────────
export function useManageTeams(params?: TInternQueryParams) {
  return useQuery({
    queryKey: internKeys.manageTeams(params ?? {}),
    queryFn: () => manageInternsApi.getTeams(params),
    placeholderData: keepPreviousData,
  });
}

function useTeamMutation<TVars, TData>(
  mutationFn: (vars: TVars) => Promise<TData>,
  success: string,
  fallback: string,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: async () => {
      toast.success(success);
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: [...internKeys.manage(), "teams"],
        }),
        queryClient.invalidateQueries({ queryKey: internKeys.activeTeams() }),
      ]);
    },
    onError: (error) => {
      toast.error(getApiResponseError(error, { fallback }));
    },
  });
}

export function useCreateTeam() {
  return useTeamMutation(
    (payload: TTeamPayload) => manageInternsApi.createTeam(payload),
    "Team created successfully.",
    "Failed to create team",
  );
}

export function useUpdateTeam() {
  return useTeamMutation(
    ({ id, payload }: { id: string; payload: TTeamPayload }) =>
      manageInternsApi.updateTeam(id, payload),
    "Team updated successfully.",
    "Failed to update team",
  );
}

export function useDeactivateTeam() {
  return useTeamMutation(
    (id: string) => manageInternsApi.deactivateTeam(id),
    "Team deactivated.",
    "Failed to deactivate team",
  );
}

export function useActivateTeam() {
  return useTeamMutation(
    (id: string) => manageInternsApi.activateTeam(id),
    "Team activated.",
    "Failed to activate team",
  );
}

export function useManageInternsStatus() {
  return useQuery({
    queryKey: internKeys.manageStatus(),
    queryFn: () => manageInternsApi.getInternsStatus(),
  });
}

function saveBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export function useExportInterns() {
  return useMutation({
    mutationFn: (params?: TInternQueryParams) =>
      manageInternsApi.exportInternsList(params),
    onSuccess: (blob) => {
      saveBlob(blob, "interns.csv");
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
      saveBlob(blob, "intern_bulk_import_template.xlsx");
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

// ── Timesheets (no approval; review note only) ─────────────
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

export function useSaveTimesheetReviewNote(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (review_note: string) =>
      manageInternsApi.saveTimesheetReviewNote(id, review_note),
    onSuccess: async () => {
      toast.success("Review note saved.");
      await queryClient.invalidateQueries({
        queryKey: [...internKeys.manage(), "timesheets"],
      });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to save review note" }),
      );
    },
  });
}

// ── Missing reports ────────────────────────────────────────
export function useMissingTimesheets(
  params?: TInternQueryParams,
  enabled = true,
) {
  return useQuery({
    queryKey: internKeys.missingTimesheets(params ?? {}),
    queryFn: () => manageInternsApi.getMissingTimesheets(params),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useMissingMonthlyReviews(
  params?: TInternQueryParams,
  enabled = true,
) {
  return useQuery({
    queryKey: internKeys.missingMonthlyReviews(params ?? {}),
    queryFn: () => manageInternsApi.getMissingMonthlyReviews(params),
    enabled,
    placeholderData: keepPreviousData,
  });
}

export function useExportMissingTimesheets() {
  return useMutation({
    mutationFn: (params: TInternQueryParams) =>
      manageInternsApi.exportMissingTimesheets(params),
    onSuccess: (blob, params) => {
      saveBlob(blob, `missing-timesheets_${params.from}_${params.to}.csv`);
      toast.success("Missing timesheets exported!");
    },
    onError: (error) => {
      toast.error(getApiResponseError(error, { fallback: "Export failed" }));
    },
  });
}

export function useExportMissingMonthlyReviews() {
  return useMutation({
    mutationFn: (params: TInternQueryParams) =>
      manageInternsApi.exportMissingMonthlyReviews(params),
    onSuccess: (blob, params) => {
      saveBlob(blob, `missing-monthly-reviews_${params.from}_${params.to}.csv`);
      toast.success("Missing monthly reviews exported!");
    },
    onError: (error) => {
      toast.error(getApiResponseError(error, { fallback: "Export failed" }));
    },
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
