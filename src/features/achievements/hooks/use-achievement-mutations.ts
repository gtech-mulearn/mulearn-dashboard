"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  bulkIssueAchievements,
  createAchievement,
  createRule,
  deactivateRule,
  deleteAchievement,
  manualIssue,
  revokeAchievement,
  updateAchievement,
} from "../api";
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
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to create achievement");
    },
  });
}

// ==========================================
// useUpdateAchievement
// ==========================================

export function useUpdateAchievement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      updateAchievement(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACHIEVEMENT_KEYS.list() });
      toast.success("Achievement updated successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to update achievement");
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
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(ACHIEVEMENT_KEYS.list(), context.previous);
      }
      toast.error("Failed to delete achievement");
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
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to create rule");
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
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to deactivate rule");
    },
  });
}

// ==========================================
// useManualIssue
// ==========================================

export function useManualIssue() {
  return useMutation({
    mutationFn: manualIssue,
    onSuccess: () => {
      toast.success("Achievement issued successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to issue achievement");
    },
  });
}

// ==========================================
// useRevokeAchievement
// ==========================================

export function useRevokeAchievement() {
  return useMutation({
    mutationFn: revokeAchievement,
    onSuccess: () => {
      toast.success("Achievement revoked");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to revoke achievement");
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
        queryKey: ACHIEVEMENT_KEYS.issuedLogs(1, 10),
      });
      toast.success("Bulk issue processed successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Bulk issue failed");
    },
  });
}
