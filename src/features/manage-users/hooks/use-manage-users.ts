"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { endpoints } from "@/api/endpoints";
import { authStore } from "@/lib/auth";
import {
  deleteManageUser,
  fetchCollegesAndDepartments,
  fetchCommunities,
  fetchCountries,
  fetchDistricts,
  fetchInterests,
  fetchManageUserDetail,
  fetchManageUsers,
  fetchRoles,
  fetchStates,
  searchLocations,
  updateManageUser,
} from "../api";
import { manageUsersKeys } from "./query-keys";

interface UseManageUsersListParams {
  pageIndex: number;
  perPage: number;
  search: string;
  sortBy: string;
}

export function getManageUsersListQueryOptions(
  params: UseManageUsersListParams,
) {
  return {
    queryKey: manageUsersKeys.list(params),
    queryFn: () => fetchManageUsers(params),
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  } as const;
}

export function useManageUsersList(params: UseManageUsersListParams) {
  return useQuery(getManageUsersListQueryOptions(params));
}

export function getManageUserDetailQueryOptions(userId: string) {
  return {
    queryKey: manageUsersKeys.detail(userId),
    queryFn: () => fetchManageUserDetail(userId),
    staleTime: 5 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    refetchOnWindowFocus: false,
  } as const;
}

export function useManageUserDetail(userId: string | null, enabled = true) {
  const detailId = userId ?? "";

  return useQuery({
    ...getManageUserDetailQueryOptions(detailId),
    enabled: Boolean(detailId) && enabled,
  });
}

export function getManageUsersMetaQueryOptions() {
  return {
    queryKey: manageUsersKeys.meta(),
    queryFn: async () => {
      const [communities, roles, interests, countries] = await Promise.all([
        fetchCommunities(),
        fetchRoles(),
        fetchInterests(),
        fetchCountries(),
      ]);

      return {
        communities,
        roles,
        interests,
        countries,
      };
    },
    staleTime: 15 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
  } as const;
}

export function useManageUsersMeta(enabled = true) {
  return useQuery({
    ...getManageUsersMetaQueryOptions(),
    enabled,
  });
}

export function useLocationSearch(query: string) {
  return useQuery({
    queryKey: manageUsersKeys.locations(query),
    queryFn: () => searchLocations(query),
    enabled: query.length > 1,
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useStates(countryId: string) {
  return useQuery({
    queryKey: manageUsersKeys.states(countryId),
    queryFn: () => fetchStates(countryId),
    enabled: Boolean(countryId),
    staleTime: 5 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useDistricts(stateId: string) {
  return useQuery({
    queryKey: manageUsersKeys.districts(stateId),
    queryFn: () => fetchDistricts(stateId),
    enabled: Boolean(stateId),
    staleTime: 5 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useCollegeData(districtId: string) {
  return useQuery({
    queryKey: manageUsersKeys.collegeData(districtId),
    queryFn: () => fetchCollegesAndDepartments(districtId),
    staleTime: 5 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useUpdateManageUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Parameters<typeof updateManageUser>[1];
    }) => updateManageUser(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: manageUsersKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: manageUsersKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteManageUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteManageUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manageUsersKeys.lists() });
    },
  });
}

export function useManageUsersCsvDownload(
  csvPath: string = endpoints.manageUsers.csv,
) {
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadCsv = useCallback(async () => {
    const token = authStore.getAccessToken();
    if (!token) {
      throw new Error("Please login again to download CSV");
    }

    setIsDownloading(true);
    try {
      const base = process.env.NEXT_PUBLIC_DJANGO_API_URL;
      const response = await fetch(base ? `${base}${csvPath}` : csvPath, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to download CSV");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "manage-users.csv";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } finally {
      setIsDownloading(false);
    }
  }, [csvPath]);

  return {
    downloadCsv,
    isDownloading,
  };
}
