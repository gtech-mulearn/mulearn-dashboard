// src/features/manage-users/hooks/use-manage-users.ts

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteManageUser,
  getAreasOfInterest,
  getCollegesByDistrict,
  getCommunities,
  getCountries,
  getDistricts,
  getManageUserById,
  getManageUsers,
  getManageUsersCsv,
  getRoles,
  getSchoolsByDistrict,
  getStates,
  searchLocations,
  updateManageUser,
} from "../api";
import { manageUsersKeys } from "./query-keys";

const STALE_TIME = 5 * 60 * 1000;

// Queries
export function useManageUsers(params?: {
  perPage?: number;
  pageIndex?: number;
  search?: string;
  sortBy?: string;
}) {
  return useQuery({
    queryKey: manageUsersKeys.list(params),
    queryFn: () => getManageUsers(params),
    staleTime: STALE_TIME,
  });
}

export function useManageUser(id: string, enabled = true) {
  return useQuery({
    queryKey: manageUsersKeys.detail(id),
    queryFn: () => getManageUserById(id),
    enabled: enabled && !!id,
    staleTime: STALE_TIME,
  });
}

export function useManageUsersCsv(enabled = false) {
  return useQuery({
    queryKey: manageUsersKeys.csv(),
    queryFn: getManageUsersCsv,
    enabled,
    staleTime: 0,
  });
}

export function useCommunities() {
  return useQuery({
    queryKey: manageUsersKeys.communities(),
    queryFn: getCommunities,
    staleTime: 10 * 60 * 1000,
  });
}

export function useRoles() {
  return useQuery({
    queryKey: manageUsersKeys.roles(),
    queryFn: getRoles,
    staleTime: 10 * 60 * 1000,
  });
}

export function useAreasOfInterest() {
  return useQuery({
    queryKey: manageUsersKeys.areasOfInterest(),
    queryFn: getAreasOfInterest,
    staleTime: 10 * 60 * 1000,
  });
}

export function useCountries() {
  return useQuery({
    queryKey: manageUsersKeys.countries(),
    queryFn: getCountries,
    staleTime: 10 * 60 * 1000,
  });
}

export function useStates(country: string, enabled = true) {
  return useQuery({
    queryKey: manageUsersKeys.states(country),
    queryFn: () => getStates(country),
    enabled: enabled && !!country,
    staleTime: STALE_TIME,
  });
}

export function useDistricts(state: string, enabled = true) {
  return useQuery({
    queryKey: manageUsersKeys.districts(state),
    queryFn: () => getDistricts(state),
    enabled: enabled && !!state,
    staleTime: STALE_TIME,
  });
}

export function useCollegesByDistrict(district: string, enabled = true) {
  return useQuery({
    queryKey: manageUsersKeys.collegesByDistrict(district),
    queryFn: () => getCollegesByDistrict(district),
    enabled: enabled && !!district,
    staleTime: STALE_TIME,
  });
}

export function useSchoolsByDistrict(district: string, enabled = true) {
  return useQuery({
    queryKey: manageUsersKeys.schoolsByDistrict(district),
    queryFn: () => getSchoolsByDistrict(district),
    enabled: enabled && !!district,
    staleTime: STALE_TIME,
  });
}

export function useLocationSearch(param: string, enabled = true) {
  return useQuery({
    queryKey: manageUsersKeys.locationSearch(param),
    queryFn: () => searchLocations(param),
    enabled: enabled && !!param,
    staleTime: 60 * 1000,
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
      payload: Record<string, unknown>;
    }) => updateManageUser(id, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: manageUsersKeys.all });
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
      queryClient.invalidateQueries({ queryKey: manageUsersKeys.all });
    },
  });
}
