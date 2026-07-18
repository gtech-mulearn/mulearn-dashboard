"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";
import {
  activateRule,
  bulkClaimAchievements,
  bulkIssueAchievements,
  claimAchievement,
  createAchievement,
  createRule,
  deactivateRule,
  deleteAchievement,
  issueVC,
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
    mutationFn: (data: FormData | Record<string, unknown>) =>
      createAchievement(data),
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
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ACHIEVEMENT_KEYS.issuedLogsAll(),
      });
      if (data.failed_count > 0) {
        toast.warning(
          `Bulk issue processed: ${data.success_count} succeeded, ${data.failed_count} failed.`,
        );
      } else {
        toast.success(
          `Successfully issued ${data.success_count} achievements!`,
        );
      }
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Bulk issue failed" }),
      );
    },
  });
}

// ==========================================
// useClaimAchievement
// ==========================================

/**
 * After a successful claim with `vc_pending: true`, we need to open the
 * IssueVCDialog. We do this by dispatching a custom DOM event so any mounted
 * dialog listener can react without tight coupling.
 */
function dispatchVCPending(achievementId: string, achievementName?: string) {
  window.dispatchEvent(
    new CustomEvent("achievement:vc-pending", {
      detail: { achievementId, achievementName },
    }),
  );
}

export function useClaimAchievement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (achievementId: string) => claimAchievement(achievementId),
    onSuccess: (data, achievementId) => {
      // Invalidate relevant queries when a user claims an achievement
      queryClient.invalidateQueries({ queryKey: ACHIEVEMENT_KEYS.eligible() });
      queryClient.invalidateQueries({ queryKey: ACHIEVEMENT_KEYS.progress() });

      if (data.vc_pending) {
        // Show a toast with an action button to immediately open the VC dialog.
        // The IssueVCDialog must be rendered somewhere in the tree and listen for
        // the "achievement:vc-pending" custom event (see IssueVCDialogListener).
        toast.success(
          "Achievement claimed! A Verifiable Credential is available.",
          {
            duration: 10_000,
            action: {
              label: "Issue VC",
              onClick: () => dispatchVCPending(achievementId),
            },
          },
        );
      } else {
        toast.success("Achievement claimed successfully!");
      }
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to claim achievement" }),
      );
    },
  });
}

// ==========================================
// useBulkClaimAchievements
// ==========================================

export function useBulkClaimAchievements() {
  const queryClient = useQueryClient();

  return useMutation({
    // NOTE: /bulk-claim/ requires a backend API key, not a JWT (see achievements.api.ts).
    // Pass optional date range to scope which users are processed.
    mutationFn: (params?: { dateFrom?: string; dateTo?: string }) =>
      bulkClaimAchievements(params?.dateFrom, params?.dateTo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACHIEVEMENT_KEYS.eligible() });
      queryClient.invalidateQueries({ queryKey: ACHIEVEMENT_KEYS.progress() });
      toast.success("Bulk claim processed successfully");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Bulk claim failed" }),
      );
    },
  });
}

// ==========================================
// useIssueVC
// ==========================================

export function useIssueVC() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      achievementId,
      vcUrl,
    }: {
      achievementId: string;
      vcUrl: string;
    }) => issueVC(achievementId, vcUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ACHIEVEMENT_KEYS.all });
      toast.success("Verifiable Credential associated successfully!");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to associate VC" }),
      );
    },
  });
}
