"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
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

export function useManageUsersList(params: UseManageUsersListParams) {
  return useQuery({
    queryKey: manageUsersKeys.list(params),
    queryFn: () => fetchManageUsers(params),
    placeholderData: keepPreviousData,
    staleTime: 30 * 1000,
  });
}

export function useManageUserDetail(userId: string | null, enabled = true) {
  return useQuery({
    queryKey: manageUsersKeys.detail(userId ?? ""),
    queryFn: () => fetchManageUserDetail(userId as string),
    enabled: Boolean(userId) && enabled,
  });
}

export function useManageUsersMeta() {
  return useQuery({
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
    staleTime: 5 * 60 * 1000,
  });
}

export function useLocationSearch(query: string) {
  return useQuery({
    queryKey: manageUsersKeys.locations(query),
    queryFn: () => searchLocations(query),
    enabled: query.length > 0,
    staleTime: 2 * 60 * 1000,
  });
}

export function useStates(countryId: string) {
  return useQuery({
    queryKey: manageUsersKeys.states(countryId),
    queryFn: () => fetchStates(countryId),
    enabled: Boolean(countryId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useDistricts(stateId: string) {
  return useQuery({
    queryKey: manageUsersKeys.districts(stateId),
    queryFn: () => fetchDistricts(stateId),
    enabled: Boolean(stateId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCollegeData(params: {
  countryId: string;
  stateId: string;
  districtId: string;
}) {
  return useQuery({
    queryKey: manageUsersKeys.collegeData(params),
    queryFn: () => fetchCollegesAndDepartments(params.districtId),
    staleTime: 5 * 60 * 1000,
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
