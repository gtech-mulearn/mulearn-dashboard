"use client";

/**
 * useJobMutations — Create / Update / Delete job mutations
 *
 * 📍 src/features/company-jobs/hooks/use-job-mutations.ts
 *
 * Delete uses optimistic removal from list cache with rollback on error.
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/api";
import { createJob, deleteJob, updateJob } from "../api";
import type {
  CreateJobPayload,
  JobsListResponse,
  UpdateJobPayload,
} from "../types";
import { JOBS_KEYS } from "./use-jobs";

// ─── Create Job ─────────────────────────────────────────────

export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateJobPayload) => createJob(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: JOBS_KEYS.all });
      toast.success("Job created successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to create job");
    },
  });
}

// ─── Update Job ─────────────────────────────────────────────

export function useUpdateJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      jobId,
      payload,
    }: {
      jobId: string;
      payload: UpdateJobPayload;
    }) => updateJob(jobId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: JOBS_KEYS.all });
      queryClient.invalidateQueries({
        queryKey: JOBS_KEYS.detail(variables.jobId),
      });
      toast.success("Job updated successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to update job");
    },
  });
}

// ─── Delete Job (optimistic) ────────────────────────────────

export function useDeleteJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) => deleteJob(jobId),
    onMutate: async (jobId: string) => {
      // Cancel any outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: JOBS_KEYS.all });

      // Snapshot ALL list query caches (may have multiple param combos)
      const previousQueries = queryClient.getQueriesData<JobsListResponse>({
        queryKey: JOBS_KEYS.all,
      });

      // Optimistically remove the job from all cached lists
      queryClient.setQueriesData<JobsListResponse>(
        { queryKey: JOBS_KEYS.all },
        (old) => {
          if (!old?.jobs) return old;
          return {
            ...old,
            jobs: old.jobs.filter((job) => job.id !== jobId),
            pagination: {
              ...old.pagination,
              count: Math.max(0, old.pagination.count - 1),
            },
          };
        },
      );

      return { previousQueries };
    },
    onError: (error, _jobId, context) => {
      // Rollback all caches to their previous state
      if (context?.previousQueries) {
        for (const [queryKey, data] of context.previousQueries) {
          queryClient.setQueryData(queryKey, data);
        }
      }
      toast.error(
        error instanceof ApiError ? error.message : "Failed to delete job",
      );
    },
    onSettled: () => {
      // Invalidate the list so it refetches, but DO NOT invalidate the detail query
      // because invalidating the detail query while still on the page causes a 404 refetch.
      queryClient.invalidateQueries({
        queryKey: [...JOBS_KEYS.all, "list"],
      });
    },
    onSuccess: () => {
      toast.success("Job deleted successfully");
    },
  });
}
