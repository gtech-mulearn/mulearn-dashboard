"use client";

/**
 * Problem Statement Hooks
 *
 * 📍 src/features/problem-statements/hooks/problem-statements.hooks.ts
 *
 * TanStack Query v5 hooks for all problem statement operations.
 * Aligned with PROBLEM_STATEMENT_API.md.
 *
 * Toast strategy:
 *  - Mutations that have dedicated dialog UX do NOT toast internally — the
 *    caller owns the messaging.
 *  - Simple mutations (delete, interaction toggle) toast from within the hook.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";
import { authStore } from "@/lib/auth";
import {
  adminCreateStatement,
  adminDeleteStatement,
  adminDeleteUserInteraction,
  adminFetchInteractions,
  adminFetchStatementDetail,
  adminFetchStatements,
  adminPublishStatement,
  adminUnpublishStatement,
  adminUpdateStatement,
  createCompanyStatement,
  deleteCompanyStatement,
  fetchCompanyInteractions,
  fetchCompanyStatementDetail,
  fetchCompanyStatements,
  fetchInteractionCounts,
  fetchMyInteraction,
  fetchPersonalProblemStatements,
  fetchProblemStatementDetail,
  fetchProblemStatementFeed,
  publishCompanyStatement,
  removeInteraction,
  setInteraction,
  submitSolution,
  unpublishCompanyStatement,
  updateCompanyStatement,
  withdrawSubmission,
} from "../api";
import type {
  AdminCreateStatementPayload,
  AdminQueryParams,
  CompanyCreateStatementPayload,
  CompanyQueryParams,
  FeedQueryParams,
  InteractionsQueryParams,
  SetInteractionPayload,
  SubmitSolutionPayload,
  UpdateStatementPayload,
} from "../types/problem-statement.types";
import { problemStatementKeys } from "./query-keys";

// ─── Public / Learner Feed ────────────────────────────────────────────────────

/** Browse the published problem statements feed (public, optionally authenticated). */
export function useProblemStatementFeed(
  params?: FeedQueryParams,
  options?: { enabled?: boolean },
) {
  const authenticated = authStore.isAuthenticated();
  return useQuery({
    queryKey: problemStatementKeys.feed(params ?? {}, authenticated),
    queryFn: () => fetchProblemStatementFeed(params, authenticated),
    enabled: options?.enabled,
  });
}

/** Fetch all published problem statements across pages for personal interaction tabs. */
export function usePersonalProblemStatementsFeed(
  params?: Omit<FeedQueryParams, "pageIndex" | "perPage">,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: problemStatementKeys.feedPersonal(params ?? {}),
    queryFn: () => fetchPersonalProblemStatements(params),
    enabled: options?.enabled,
    staleTime: 60_000,
  });
}

/** Fetch a single statement by ID (public). Draft/Unpublished returns 404 to learners. */
export function useProblemStatementDetail(id?: string) {
  const authenticated = authStore.isAuthenticated();
  return useQuery({
    queryKey: problemStatementKeys.detail(id as string, authenticated),
    queryFn: () => fetchProblemStatementDetail(id as string, authenticated),
    enabled: !!id,
  });
}

// ─── Interaction (I'm Trying It) ─────────────────────────────────────────────

/** GET <id>/interaction/ — current learner's interaction. */
export function useMyInteraction(statementId: string) {
  return useQuery({
    queryKey: problemStatementKeys.interaction(statementId),
    queryFn: () => fetchMyInteraction(statementId),
    enabled: !!statementId && authStore.isAuthenticated(),
  });
}

/** GET <id>/interaction/counts/ — interaction counts object. */
export function useInteractionCounts(statementId: string) {
  return useQuery({
    queryKey: problemStatementKeys.interactionCounts(statementId),
    queryFn: () => fetchInteractionCounts(statementId),
    enabled: !!statementId,
  });
}

/**
 * Smart toggle hook: PUT when not trying, DELETE when already trying.
 * Updates the statement detail and feed caches optimistically.
 * Toasts on error.
 */
export function useToggleInteraction(
  statementId: string,
  isCurrentlyTrying: boolean,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload?: SetInteractionPayload) => {
      if (isCurrentlyTrying) {
        return removeInteraction(statementId).then(
          () => undefined as undefined,
        );
      }
      return setInteraction(statementId, payload).then(() => undefined);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: problemStatementKeys.all,
      });
    },
    onError: (error: unknown) => {
      toast.error(
        getApiResponseError(error, {
          fallback: isCurrentlyTrying
            ? "Failed to remove interaction"
            : "Failed to submit interaction",
        }),
      );
    },
  });
}

/** Explicit PUT — add or change interaction. */
export function useSetInteraction(statementId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SetInteractionPayload = { status: "Trying" }) =>
      setInteraction(statementId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: problemStatementKeys.all,
      });
    },
    onError: (error: unknown) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to submit interaction",
        }),
      );
    },
  });
}

/** Explicit DELETE — remove interaction. */
export function useRemoveInteraction(statementId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => removeInteraction(statementId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: problemStatementKeys.all,
      });
    },
    onError: (error: unknown) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to remove interaction",
        }),
      );
    },
  });
}

/** PUT <id>/submission/ — submit or update solution link */
export function useSubmitSolution(statementId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SubmitSolutionPayload) =>
      submitSolution(statementId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: problemStatementKeys.all,
      });
    },
    onError: (error: unknown) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to submit solution",
        }),
      );
    },
  });
}

/** DELETE <id>/submission/ — withdraw solution link and revert to Trying */
export function useWithdrawSubmission(statementId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => withdrawSubmission(statementId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: problemStatementKeys.all,
      });
    },
    onError: (error: unknown) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to withdraw solution",
        }),
      );
    },
  });
}

// ─── Company Management Queries ───────────────────────────────────────────────

export function useCompanyStatements(
  params?: CompanyQueryParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: problemStatementKeys.companyList(params ?? {}),
    queryFn: () => fetchCompanyStatements(params),
    enabled: options?.enabled,
  });
}

export function useCompanyStatementDetail(
  id: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: problemStatementKeys.companyDetail(id),
    queryFn: () => fetchCompanyStatementDetail(id),
    enabled: !!id && (options?.enabled ?? true),
  });
}

export function useCompanyInteractions(
  id: string,
  params?: InteractionsQueryParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: problemStatementKeys.companyInteractions(id, params),
    queryFn: () => fetchCompanyInteractions(id, params),
    enabled: !!id && (options?.enabled ?? true),
  });
}

// ─── Company Management Mutations ─────────────────────────────────────────────

/** Create a new statement (always Draft). Caller owns success toast. */
export function useCreateCompanyStatement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CompanyCreateStatementPayload) =>
      createCompanyStatement(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: problemStatementKeys.company(),
      });
      await queryClient.invalidateQueries({
        queryKey: problemStatementKeys.feeds(),
      });
    },
    onError: (error: unknown) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to create statement" }),
      );
    },
  });
}

/** Partial update — all fields optional. Caller owns success toast. */
export function useUpdateCompanyStatement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateStatementPayload;
    }) => updateCompanyStatement(id, payload),
    onSuccess: async (_data, { id }) => {
      await queryClient.invalidateQueries({
        queryKey: problemStatementKeys.companyDetail(id),
      });
      await queryClient.invalidateQueries({
        queryKey: problemStatementKeys.companyLists(),
      });
      await queryClient.invalidateQueries({
        queryKey: problemStatementKeys.feeds(),
      });
      await queryClient.invalidateQueries({
        queryKey: problemStatementKeys.detail(id, false),
      });
      await queryClient.invalidateQueries({
        queryKey: problemStatementKeys.detail(id, true),
      });
    },
    onError: (error: unknown) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to update statement" }),
      );
    },
  });
}

/** Permanently delete. Caller must confirm first. */
export function useDeleteCompanyStatement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCompanyStatement(id),
    onSuccess: async (_data, id) => {
      toast.success("Problem statement deleted.");
      await queryClient.invalidateQueries({
        queryKey: problemStatementKeys.company(),
      });
      await queryClient.invalidateQueries({
        queryKey: problemStatementKeys.feeds(),
      });
      await queryClient.invalidateQueries({
        queryKey: problemStatementKeys.detail(id, false),
      });
      await queryClient.invalidateQueries({
        queryKey: problemStatementKeys.detail(id, true),
      });
    },
    onError: (error: unknown) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to delete statement" }),
      );
    },
  });
}

/** Publish — Draft/Unpublished → Published. Caller owns success toast. */
export function usePublishCompanyStatement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => publishCompanyStatement(id),
    onSuccess: async (_data, id) => {
      await queryClient.invalidateQueries({
        queryKey: problemStatementKeys.company(),
      });
      await queryClient.invalidateQueries({
        queryKey: problemStatementKeys.feeds(),
      });
      await queryClient.invalidateQueries({
        queryKey: problemStatementKeys.detail(id, false),
      });
      await queryClient.invalidateQueries({
        queryKey: problemStatementKeys.detail(id, true),
      });
    },
    onError: (error: unknown) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to publish statement" }),
      );
    },
  });
}

/** Unpublish — Published → Unpublished. Caller owns success toast. */
export function useUnpublishCompanyStatement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => unpublishCompanyStatement(id),
    onSuccess: async (_data, id) => {
      await queryClient.invalidateQueries({
        queryKey: problemStatementKeys.company(),
      });
      await queryClient.invalidateQueries({
        queryKey: problemStatementKeys.feeds(),
      });
      await queryClient.invalidateQueries({
        queryKey: problemStatementKeys.detail(id, false),
      });
      await queryClient.invalidateQueries({
        queryKey: problemStatementKeys.detail(id, true),
      });
    },
    onError: (error: unknown) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to unpublish statement",
        }),
      );
    },
  });
}

// ─── Admin Queries ────────────────────────────────────────────────────────────

export function useAdminStatements(
  params?: AdminQueryParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: problemStatementKeys.adminList(params ?? {}),
    queryFn: () => adminFetchStatements(params),
    enabled: options?.enabled,
  });
}

export function useAdminStatementDetail(
  id: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: problemStatementKeys.adminDetail(id),
    queryFn: () => adminFetchStatementDetail(id),
    enabled: !!id && (options?.enabled ?? true),
  });
}

export function useAdminInteractions(
  id: string,
  params?: InteractionsQueryParams,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: problemStatementKeys.adminInteractions(id, params),
    queryFn: () => adminFetchInteractions(id, params),
    enabled: !!id && (options?.enabled ?? true),
  });
}

// ─── Admin Mutations ──────────────────────────────────────────────────────────

/** Admin create — creates a statement for muLearn without company attribution. Caller owns success toast. */
export function useAdminCreateStatement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdminCreateStatementPayload) =>
      adminCreateStatement(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: problemStatementKeys.admin(),
      });
      await queryClient.invalidateQueries({
        queryKey: problemStatementKeys.feeds(),
      });
    },
    onError: (error: unknown) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to create statement" }),
      );
    },
  });
}

export function useAdminUpdateStatement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateStatementPayload;
    }) => adminUpdateStatement(id, payload),
    onSuccess: async (_data, { id }) => {
      await queryClient.invalidateQueries({
        queryKey: problemStatementKeys.adminDetail(id),
      });
      await queryClient.invalidateQueries({
        queryKey: problemStatementKeys.adminLists(),
      });
      await queryClient.invalidateQueries({
        queryKey: problemStatementKeys.feeds(),
      });
      await queryClient.invalidateQueries({
        queryKey: problemStatementKeys.detail(id, false),
      });
      await queryClient.invalidateQueries({
        queryKey: problemStatementKeys.detail(id, true),
      });
    },
    onError: (error: unknown) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to update statement" }),
      );
    },
  });
}

export function useAdminDeleteStatement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminDeleteStatement(id),
    onSuccess: async (_data, id) => {
      toast.success("Problem statement deleted.");
      await queryClient.invalidateQueries({
        queryKey: problemStatementKeys.admin(),
      });
      await queryClient.invalidateQueries({
        queryKey: problemStatementKeys.feeds(),
      });
      await queryClient.invalidateQueries({
        queryKey: problemStatementKeys.detail(id, false),
      });
      await queryClient.invalidateQueries({
        queryKey: problemStatementKeys.detail(id, true),
      });
    },
    onError: (error: unknown) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to delete statement" }),
      );
    },
  });
}

export function useAdminPublishStatement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminPublishStatement(id),
    onSuccess: async (_data, id) => {
      await queryClient.invalidateQueries({
        queryKey: problemStatementKeys.admin(),
      });
      await queryClient.invalidateQueries({
        queryKey: problemStatementKeys.feeds(),
      });
      await queryClient.invalidateQueries({
        queryKey: problemStatementKeys.detail(id, false),
      });
      await queryClient.invalidateQueries({
        queryKey: problemStatementKeys.detail(id, true),
      });
    },
    onError: (error: unknown) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to publish statement" }),
      );
    },
  });
}

export function useAdminUnpublishStatement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => adminUnpublishStatement(id),
    onSuccess: async (_data, id) => {
      await queryClient.invalidateQueries({
        queryKey: problemStatementKeys.admin(),
      });
      await queryClient.invalidateQueries({
        queryKey: problemStatementKeys.feeds(),
      });
      await queryClient.invalidateQueries({
        queryKey: problemStatementKeys.detail(id, false),
      });
      await queryClient.invalidateQueries({
        queryKey: problemStatementKeys.detail(id, true),
      });
    },
    onError: (error: unknown) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to unpublish statement",
        }),
      );
    },
  });
}

/** DELETE admin/<id>/interactions/<user_id>/ */
export function useAdminDeleteUserInteraction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      statementId,
      userId,
    }: {
      statementId: string;
      userId: string;
    }) => adminDeleteUserInteraction(statementId, userId),
    onSuccess: async () => {
      toast.success("Interaction removed.");
      await queryClient.invalidateQueries({
        queryKey: problemStatementKeys.admin(),
      });
    },
    onError: (error: unknown) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to remove interaction",
        }),
      );
    },
  });
}
