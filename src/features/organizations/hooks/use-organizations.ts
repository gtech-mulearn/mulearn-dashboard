"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import {
  createOrganization,
  deleteOrganization,
  downloadOrgsCsv,
  editOrganization,
  fetchAffiliations,
  fetchCountriesDropdown,
  fetchDistrictsDropdown,
  fetchOrganizations,
  fetchStatesDropdown,
} from "../api/organizations.api";
import type { OrgFormValues } from "../schemas";
import { organizationsKeys } from "./query-keys";

// ─── List ─────────────────────────────────────────────────────────────────────

interface UseOrgsListParams {
  pageIndex: number;
  perPage: number;
  search: string;
  sortBy: string;
  org_type: string;
  enabled?: boolean;
}

export function useOrgsList(params: UseOrgsListParams) {
  return useQuery({
    queryKey: organizationsKeys.list(params),
    queryFn: () => fetchOrganizations(params),
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: params.enabled !== false,
  });
}

// ─── Create ───────────────────────────────────────────────────────────────────

export function useCreateOrg() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: OrgFormValues) => createOrganization(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationsKeys.lists() });
      toast.success("Organization created successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}

// ─── Edit ─────────────────────────────────────────────────────────────────────

export function useEditOrg() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ code, payload }: { code: string; payload: OrgFormValues }) =>
      editOrganization(code, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationsKeys.lists() });
      toast.success("Organization updated successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export function useDeleteOrg() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (code: string) => deleteOrganization(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationsKeys.lists() });
      toast.success("Organization deleted successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });
}

// ─── CSV Download ─────────────────────────────────────────────────────────────

export function useOrgsCsvDownload(orgType: string) {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadCsv = useCallback(async () => {
    setIsDownloading(true);
    try {
      await downloadOrgsCsv(orgType);
    } finally {
      setIsDownloading(false);
    }
  }, [orgType]);

  return { downloadCsv, isDownloading };
}

// ─── Affiliations dropdown ────────────────────────────────────────────────────

export function useAffiliations(enabled = true) {
  return useQuery({
    queryKey: organizationsKeys.affiliations(),
    queryFn: fetchAffiliations,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled,
  });
}

// ─── Location dropdowns ───────────────────────────────────────────────────────

export function useCountriesDropdown(enabled = true) {
  return useQuery({
    queryKey: organizationsKeys.countries(),
    queryFn: fetchCountriesDropdown,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled,
  });
}

export function useStatesDropdown(enabled = true) {
  return useQuery({
    queryKey: organizationsKeys.states(),
    queryFn: fetchStatesDropdown,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled,
  });
}

export function useDistrictsDropdown(stateId?: string, enabled = true) {
  return useQuery({
    queryKey: organizationsKeys.districts(stateId),
    queryFn: () => fetchDistrictsDropdown(stateId),
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: enabled && Boolean(stateId),
  });
}
