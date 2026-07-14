"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";
import {
  activateRule,
  bulkIssueAchievements,
  createAchievement,
  createRule,
  deactivateRule,
  deleteAchievement,
  manualIssue,
  revokeAchievement,
  updateAchievement,
  updateRule,
} from "../api";
import type { CreateRuleRequest } from "../schemas";
import { ACHIEVEMENT_KEYS } from "./use-achievements";

// ==========================================
// useCreateAchievement
// ==========================================

export function useCreateAchievement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => createAchievement(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACHIEVEMENT_KEYS.list() });
      toast.success("Achievement created successfully");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to create achievement",
        }),
      );
    },
  });
}

// ==========================================
// useUpdateAchievement
// ==========================================

export function useUpdateAchievement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: FormData | Record<string, unknown>;
    }) => updateAchievement(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACHIEVEMENT_KEYS.list() });
      toast.success("Achievement updated successfully");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to update achievement",
        }),
      );
    },
  });
}

// ==========================================
// useDeleteAchievement — optimistic removal
// ==========================================

export function useDeleteAchievement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteAchievement(id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ACHIEVEMENT_KEYS.list() });
      const previous = queryClient.getQueryData(ACHIEVEMENT_KEYS.list());
      queryClient.setQueryData(
        ACHIEVEMENT_KEYS.list(),
        (old: { id: string }[] | undefined) =>
          old?.filter((item) => item.id !== id) ?? [],
      );
      return { previous };
    },
    onError: (error, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(ACHIEVEMENT_KEYS.list(), context.previous);
      }
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to delete achievement",
        }),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACHIEVEMENT_KEYS.list() });
      toast.success("Achievement deleted");
    },
  });
}

// ==========================================
// useCreateRule
// ==========================================

export function useCreateRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createRule,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACHIEVEMENT_KEYS.rules() });
      toast.success("Rule created successfully");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to create rule" }),
      );
    },
  });
}

// ==========================================
// useUpdateRule
// ==========================================

export function useUpdateRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ruleId,
      data,
    }: {
      ruleId: string;
      data: CreateRuleRequest;
    }) => updateRule(ruleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACHIEVEMENT_KEYS.rules() });
      toast.success("Rule updated successfully");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to update rule" }),
      );
    },
  });
}

// ==========================================
// useDeactivateRule
// ==========================================

export function useDeactivateRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ruleId: string) => deactivateRule(ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACHIEVEMENT_KEYS.rules() });
      toast.success("Rule deactivated");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to deactivate rule" }),
      );
    },
  });
}

// ==========================================
// useActivateRule
// ==========================================

export function useActivateRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ruleId: string) => activateRule(ruleId), // Ensure activateRule is imported
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACHIEVEMENT_KEYS.rules() });
      toast.success("Rule activated");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to activate rule" }),
      );
    },
  });
}

// ==========================================
// useManualIssue
// ==========================================

export function useManualIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: manualIssue,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ACHIEVEMENT_KEYS.issuedLogsAll(),
      });
      toast.success("Achievement issued successfully");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to issue achievement" }),
      );
    },
  });
}

// ==========================================
// useRevokeAchievement
// ==========================================

export function useRevokeAchievement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: revokeAchievement,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ACHIEVEMENT_KEYS.issuedLogsAll(),
      });
      toast.success("Achievement revoked");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to revoke achievement",
        }),
      );
    },
  });
}

// ==========================================
// useBulkIssue
// ==========================================

export function useBulkIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => bulkIssueAchievements(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ACHIEVEMENT_KEYS.issuedLogsAll(),
      });
      toast.success("Bulk issue processed successfully");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Bulk issue failed" }),
      );
    },
  });
}
