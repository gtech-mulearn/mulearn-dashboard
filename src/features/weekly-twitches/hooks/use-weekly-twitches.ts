"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";
import {
  createIs,
  createOfficeHours,
  createSmt,
  deleteIs,
  deleteOfficeHours,
  deleteSmt,
  fetchIsList,
  fetchOfficeHoursList,
  fetchSmtList,
  type ListParams,
  updateIs,
  updateOfficeHours,
  updateSmt,
} from "../api";
import type { CampusContentWrite, OfficeHoursWrite } from "../schemas";
import { weeklyTwitchesKeys } from "./query-keys";

// ─── Office Hours ─────────────────────────────────────────────

export function useOfficeHoursList(params: ListParams) {
  return useQuery({
    queryKey: weeklyTwitchesKeys.officeHoursList(params),
    queryFn: () => fetchOfficeHoursList(params),
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useOfficeHoursMutations() {
  const qc = useQueryClient();
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: weeklyTwitchesKeys.officeHours() });

  const create = useMutation({
    mutationFn: (payload: OfficeHoursWrite) => createOfficeHours(payload),
    onSuccess: () => {
      toast.success("Office Hours session created.");
      invalidate();
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to create Office Hours session.",
        }),
      );
    },
  });

  const update = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<OfficeHoursWrite>;
    }) => updateOfficeHours(id, data),
    onSuccess: () => {
      toast.success("Office Hours session updated.");
      invalidate();
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to update Office Hours session.",
        }),
      );
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteOfficeHours(id),
    onSuccess: () => {
      toast.success("Office Hours session deleted.");
      invalidate();
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to delete Office Hours session.",
        }),
      );
    },
  });

  return { create, update, remove };
}

// ─── Salt Mango Tree ──────────────────────────────────────────

export function useSmtList(params: ListParams, enabled = true) {
  return useQuery({
    queryKey: weeklyTwitchesKeys.smtList(params),
    queryFn: () => fetchSmtList(params),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useSmtMutations() {
  const qc = useQueryClient();
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: weeklyTwitchesKeys.smt() });

  const create = useMutation({
    mutationFn: (payload: CampusContentWrite) => createSmt(payload),
    onSuccess: () => {
      toast.success("Salt Mango Tree episode created.");
      invalidate();
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to create Salt Mango Tree episode.",
        }),
      );
    },
  });

  const update = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CampusContentWrite>;
    }) => updateSmt(id, data),
    onSuccess: () => {
      toast.success("Salt Mango Tree episode updated.");
      invalidate();
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to update Salt Mango Tree episode.",
        }),
      );
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteSmt(id),
    onSuccess: () => {
      toast.success("Salt Mango Tree episode deleted.");
      invalidate();
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to delete Salt Mango Tree episode.",
        }),
      );
    },
  });

  return { create, update, remove };
}

// ─── Inspiration Station ──────────────────────────────────────

export function useIsList(params: ListParams, enabled = true) {
  return useQuery({
    queryKey: weeklyTwitchesKeys.isList(params),
    queryFn: () => fetchIsList(params),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useIsMutations() {
  const qc = useQueryClient();
  const invalidate = () =>
    qc.invalidateQueries({ queryKey: weeklyTwitchesKeys.is() });

  const create = useMutation({
    mutationFn: (payload: CampusContentWrite) => createIs(payload),
    onSuccess: () => {
      toast.success("Inspiration Station episode created.");
      invalidate();
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to create Inspiration Station episode.",
        }),
      );
    },
  });

  const update = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<CampusContentWrite>;
    }) => updateIs(id, data),
    onSuccess: () => {
      toast.success("Inspiration Station episode updated.");
      invalidate();
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to update Inspiration Station episode.",
        }),
      );
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteIs(id),
    onSuccess: () => {
      toast.success("Inspiration Station episode deleted.");
      invalidate();
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to delete Inspiration Station episode.",
        }),
      );
    },
  });

  return { create, update, remove };
}
