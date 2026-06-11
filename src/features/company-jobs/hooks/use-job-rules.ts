"use client";

/**
 * useJobRules — Rule CRUD mutations with optimistic updates
 *
 * 📍 src/features/company-jobs/hooks/use-job-rules.ts
 *
 * All rule mutations optimistically update the parent job's detail cache.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/api";
import { createJobRule, deleteJobRule, updateJobRule } from "../api";
import type { CreateRulePayload, Job, UpdateRulePayload } from "../types";
import { JOBS_KEYS } from "./use-jobs";

// ─── Create Rule (optimistic) ───────────────────────────────

export function useCreateJobRule(jobId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRulePayload) => createJobRule(jobId, payload),
    onMutate: async (payload) => {
      await queryClient.cancelQueries({
        queryKey: JOBS_KEYS.detail(jobId),
      });

      const previousJob = queryClient.getQueryData<Job>(
        JOBS_KEYS.detail(jobId),
      );

      // Optimistically add a temporary rule
      queryClient.setQueryData<Job>(JOBS_KEYS.detail(jobId), (old) => {
        if (!old) return old;
        return {
          ...old,
          rules: [
            ...old.rules,
            {
              id: `temp-${Date.now()}`,
              rule_type: payload.rule_type,
              rule_value: payload.rule_value,
            },
          ],
        };
      });

      return { previousJob };
    },
    onError: (error, _payload, context) => {
      if (context?.previousJob) {
        queryClient.setQueryData(JOBS_KEYS.detail(jobId), context.previousJob);
      }
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Failed to add eligibility rule",
      );
    },
    onSettled: () => {
      // Always refetch to get the server-canonical data
      queryClient.invalidateQueries({
        queryKey: JOBS_KEYS.detail(jobId),
      });
      queryClient.invalidateQueries({ queryKey: JOBS_KEYS.all });
    },
    onSuccess: () => {
      toast.success("Eligibility rule added");
    },
  });
}

// ─── Update Rule (optimistic) ───────────────────────────────

export function useUpdateJobRule(jobId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      ruleId,
      payload,
    }: {
      ruleId: string;
      payload: UpdateRulePayload;
    }) => updateJobRule(jobId, ruleId, payload),
    onMutate: async ({ ruleId, payload }) => {
      await queryClient.cancelQueries({
        queryKey: JOBS_KEYS.detail(jobId),
      });

      const previousJob = queryClient.getQueryData<Job>(
        JOBS_KEYS.detail(jobId),
      );

      queryClient.setQueryData<Job>(JOBS_KEYS.detail(jobId), (old) => {
        if (!old) return old;
        return {
          ...old,
          rules: old.rules.map((rule) =>
            rule.id === ruleId
              ? {
                  ...rule,
                  rule_type: payload.rule_type,
                  rule_value: payload.rule_value,
                }
              : rule,
          ),
        };
      });

      return { previousJob };
    },
    onError: (error, _vars, context) => {
      if (context?.previousJob) {
        queryClient.setQueryData(JOBS_KEYS.detail(jobId), context.previousJob);
      }
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Failed to update eligibility rule",
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: JOBS_KEYS.detail(jobId),
      });
    },
    onSuccess: () => {
      toast.success("Eligibility rule updated");
    },
  });
}

// ─── Delete Rule (optimistic) ───────────────────────────────

export function useDeleteJobRule(jobId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ruleId: string) => deleteJobRule(jobId, ruleId),
    onMutate: async (ruleId: string) => {
      await queryClient.cancelQueries({
        queryKey: JOBS_KEYS.detail(jobId),
      });

      const previousJob = queryClient.getQueryData<Job>(
        JOBS_KEYS.detail(jobId),
      );

      queryClient.setQueryData<Job>(JOBS_KEYS.detail(jobId), (old) => {
        if (!old) return old;
        return {
          ...old,
          rules: old.rules.filter((rule) => rule.id !== ruleId),
        };
      });

      return { previousJob };
    },
    onError: (error, _ruleId, context) => {
      if (context?.previousJob) {
        queryClient.setQueryData(JOBS_KEYS.detail(jobId), context.previousJob);
      }
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Failed to remove eligibility rule",
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: JOBS_KEYS.detail(jobId),
      });
      queryClient.invalidateQueries({ queryKey: JOBS_KEYS.all });
    },
    onSuccess: () => {
      toast.success("Eligibility rule removed");
    },
  });
}
