"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  addOrganization,
  deleteOrganization,
  downloadOrganizationCsv,
  editOrganization,
  fetchAffiliations,
  fetchCountries,
  fetchDistricts,
  fetchOrganizations,
  fetchStates,
} from "../api/organizations.api";
import type { OrgFormData, OrgType } from "../schemas";
import { organizationsKeys } from "./query-keys";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UseOrganizationsParams {
  perPage: number;
  pageIndex: number;
  search: string;
  sortBy: string;
  org_type: OrgType;
}

// ─── List Query ───────────────────────────────────────────────────────────────

export function useOrganizations(params: UseOrganizationsParams) {
  return useQuery({
    queryKey: organizationsKeys.list(params),
    queryFn: () => fetchOrganizations(params),
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// ─── Affiliation Dropdown ─────────────────────────────────────────────────────

export function useAffiliations(enabled = true) {
  return useQuery({
    queryKey: organizationsKeys.affiliations(),
    queryFn: fetchAffiliations,
    enabled,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

// ─── Location Cascading ───────────────────────────────────────────────────────

export function useCountries(enabled = true) {
  return useQuery({
    queryKey: organizationsKeys.countries(),
    queryFn: fetchCountries,
    enabled,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
}

export function useStates(countryId: string | null, enabled = true) {
  return useQuery({
    queryKey: organizationsKeys.states(countryId ?? ""),
    queryFn: () => fetchStates(countryId ?? ""),
    enabled: enabled && !!countryId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

export function useDistricts(stateId: string | null, enabled = true) {
  return useQuery({
    queryKey: organizationsKeys.districts(stateId ?? ""),
    queryFn: () => fetchDistricts(stateId ?? ""),
    enabled: enabled && !!stateId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useAddOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: OrgFormData) => addOrganization(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationsKeys.lists() });
      toast.success("Organization created successfully.");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to create organization.");
    },
  });
}

export function useEditOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ code, data }: { code: string; data: OrgFormData }) =>
      editOrganization(code, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationsKeys.lists() });
      toast.success("Organization updated successfully.");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to update organization.");
    },
  });
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (code: string) => deleteOrganization(code),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationsKeys.lists() });
      toast.success("Organization deleted successfully.");
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to delete organization.");
    },
  });
}

export function useDownloadOrgCsv() {
  return useMutation({
    mutationFn: (orgType: OrgType) => downloadOrganizationCsv(orgType),
    onSuccess: (blob, orgType) => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `organizations-${orgType.toLowerCase()}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
    onError: (err: Error) => {
      toast.error(err.message ?? "Failed to download CSV.");
    },
  });
}
