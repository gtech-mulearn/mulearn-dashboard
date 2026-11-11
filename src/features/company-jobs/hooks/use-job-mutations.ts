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
import { getApiResponseError } from "@/hooks/use-get-error";
import {
  approveJob,
  createJob,
  deleteJob,
  rejectJob,
  requestJobChanges,
  updateJob,
} from "../api";
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
      queryClient.invalidateQueries({ queryKey: ["company-analytics"] });
      queryClient.invalidateQueries({
        queryKey: ["home", "company", "home-summary"],
      });
      toast.success("Job created successfully");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to create job" }),
      );
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
      queryClient.invalidateQueries({ queryKey: ["company-analytics"] });
      queryClient.invalidateQueries({
        queryKey: ["home", "company", "home-summary"],
      });
      toast.success("Job updated successfully");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to update job" }),
      );
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
        getApiResponseError(error, { fallback: "Failed to delete job" }),
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
      queryClient.invalidateQueries({ queryKey: ["company-analytics"] });
      queryClient.invalidateQueries({
        queryKey: ["home", "company", "home-summary"],
      });
      toast.success("Job deleted successfully");
    },
  });
}

// ─── Approve Job ────────────────────────────────────────────

export function useApproveJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (jobId: string) => approveJob(jobId),
    onSuccess: (_data, jobId) => {
      queryClient.invalidateQueries({ queryKey: JOBS_KEYS.all });
      queryClient.invalidateQueries({ queryKey: JOBS_KEYS.detail(jobId) });
      toast.success("Job approved and published successfully.");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to approve job." }),
      );
    },
  });
}

// ─── Reject Job ────────────────────────────────────────────

export function useRejectJob() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, reason }: { jobId: string; reason: string }) =>
      rejectJob(jobId, reason),
    onSuccess: (_data, { jobId }) => {
      queryClient.invalidateQueries({ queryKey: JOBS_KEYS.all });
      queryClient.invalidateQueries({ queryKey: JOBS_KEYS.detail(jobId) });
      toast.success("Job rejected successfully.");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to reject job." }),
      );
    },
  });
}

// ─── Request Job Changes ────────────────────────────────────

export function useRequestJobChanges() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ jobId, note }: { jobId: string; note: string }) =>
      requestJobChanges(jobId, note),
    onSuccess: (_data, { jobId }) => {
      queryClient.invalidateQueries({ queryKey: JOBS_KEYS.all });
      queryClient.invalidateQueries({ queryKey: JOBS_KEYS.detail(jobId) });
      toast.success("Revision requested. Mentor notified.");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to request changes on job.",
        }),
      );
    },
  });
}
