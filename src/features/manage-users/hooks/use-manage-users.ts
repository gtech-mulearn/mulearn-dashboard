"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { endpoints } from "@/api/endpoints";
import { useCsvDownload } from "@/hooks/use-csv-download";
import { getApiResponseError } from "@/hooks/use-get-error";
import {
  assignUserRole,
  deleteManageUser,
  fetchCollegesAndDepartments,
  fetchCommunities,
  fetchCompanies,
  fetchCountries,
  fetchDistricts,
  fetchInterests,
  fetchManageUserDetail,
  fetchManageUsers,
  fetchRoles,
  fetchStates,
  searchLocations,
  UserRoles,
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
    enabled: Boolean(districtId),
    staleTime: 5 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

export function useResolveLocation() {
  return useQuery({
    queryKey: manageUsersKeys.resolveLocation(),
    queryFn: () => searchLocations("india"),
    staleTime: 24 * 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
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
      toast.success("User updated successfully");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to update user" }),
      );
    },
  });
}

export const UseRolesDropdown = (enabled = false) => {
  return useQuery({
    queryKey: manageUsersKeys.meta(),
    queryFn: fetchRoles,
    enabled,
    refetchOnWindowFocus: false,
  });
};

export function AddRoles() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: UserRoles,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Roles"], exact: false });
      queryClient.invalidateQueries({
        queryKey: ["Roles-dropdown"],
        exact: false,
      });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to assign role" }),
      );
    },
  });
}

export function useDeleteManageUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteManageUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: manageUsersKeys.lists() });
      toast.success("User deleted successfully");
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to delete user" }),
      );
    },
  });
}

export function useManageUsersCsvDownload(
  csvPath: string = endpoints.manageUsers.csv,
) {
  return useCsvDownload(csvPath, "manage-users.csv");
}

export function useAssignUserRole(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: assignUserRole,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: manageUsersKeys.detail(userId),
      });
      queryClient.invalidateQueries({ queryKey: manageUsersKeys.lists() });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to assign user role",
        }),
      );
    },
  });
}

export function useCompanies() {
  return useQuery({
    queryKey: ["companies"],
    queryFn: fetchCompanies,
    staleTime: 5 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
