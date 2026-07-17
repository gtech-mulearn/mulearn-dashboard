"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiResponseError } from "@/hooks/use-get-error";
import { campusManageApi } from "../api";
import type { CampusEventFilters, CampusLeaderboardFilters } from "../types";
import { campusManageKeys } from "./query-keys";

export function useCampusOverview() {
  return useQuery({
    queryKey: campusManageKeys.overview(),
    queryFn: () => campusManageApi.getOverview(),
  });
}

export function useCampusLeaderboard(filters: CampusLeaderboardFilters) {
  return useQuery({
    queryKey: campusManageKeys.leaderboard(
      filters.orgId ?? "",
      filters.page,
      filters.search,
      filters.ig,
      filters.category,
      filters.alumni,
    ),
    queryFn: () => campusManageApi.getLeaderboard(filters),
  });
}

export function useKarmaByCluster(orgId?: string) {
  const { data: overview } = useCampusOverview();

  return useQuery({
    queryKey: campusManageKeys.karmaByCluster(orgId || overview?.orgId),
    queryFn: async () => {
      const id = orgId || overview?.orgId;
      if (!id) return [];
      return campusManageApi.getKarmaByCluster(id);
    },
    enabled: !!(orgId || overview?.orgId),
    initialData:
      !orgId && overview?.clusterData ? overview.clusterData : undefined,
  });
}

export function useEventDistribution() {
  return useQuery({
    queryKey: campusManageKeys.eventDistribution(),
    queryFn: () => campusManageApi.getEventDistribution(),
  });
}

export function useCampusEvents(filters: CampusEventFilters) {
  return useQuery({
    queryKey: campusManageKeys.events(
      filters.page,
      filters.status,
      filters.type,
      filters.date,
    ),
    queryFn: () => campusManageApi.getEvents(filters),
  });
}

export function useStudentLevels() {
  return useQuery({
    queryKey: campusManageKeys.studentLevels(),
    queryFn: () => campusManageApi.getStudentLevels(),
  });
}

export function useExecomMembers() {
  return useQuery({
    queryKey: campusManageKeys.execom(),
    queryFn: () => campusManageApi.getExecomMembers(),
  });
}

export function useAddExecomMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { muid: string; roleTitle: string }) =>
      campusManageApi.addExecomMember(data),
    onSuccess: () => {
      void Promise.all([
        queryClient.invalidateQueries({
          queryKey: campusManageKeys.execom(),
        }),
        queryClient.invalidateQueries({
          queryKey: campusManageKeys.overview(),
        }),
      ]);
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to add execom member",
        }),
      );
    },
  });
}

export function useRemoveExecomMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roleLinkId: string) =>
      campusManageApi.removeExecomMember(roleLinkId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: campusManageKeys.execom(),
      });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to remove execom member",
        }),
      );
    },
  });
}

export function useTransferLeadRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (muid: string) => campusManageApi.transferLeadRole(muid),
    onSuccess: () => {
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: campusManageKeys.execom() }),
        queryClient.invalidateQueries({
          queryKey: campusManageKeys.overview(),
        }),
      ]);
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to transfer lead role",
        }),
      );
    },
  });
}

export function useTransferEnablerRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (muid: string) => campusManageApi.transferEnablerRole(muid),
    onSuccess: () => {
      void Promise.all([
        queryClient.invalidateQueries({ queryKey: campusManageKeys.execom() }),
        queryClient.invalidateQueries({
          queryKey: campusManageKeys.overview(),
        }),
      ]);
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to transfer enabler role",
        }),
      );
    },
  });
}

export function useIgCodes() {
  return useQuery({
    queryKey: campusManageKeys.igCodes(),
    queryFn: () => campusManageApi.getIgCodes(),
  });
}

export function useGlobalIgs() {
  return useQuery({
    queryKey: campusManageKeys.globalIgs(),
    queryFn: () => campusManageApi.getGlobalIgs(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useExecomRoles() {
  return useQuery({
    queryKey: campusManageKeys.execomRoles(),
    queryFn: () => campusManageApi.getExecomRoles(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useTransferIgRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ muid, igCode }: { muid: string; igCode: string }) =>
      campusManageApi.transferIgRole(muid, igCode),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: campusManageKeys.igChapters(),
      });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to transfer IG role",
        }),
      );
    },
  });
}

export function useDownloadStudentCsv() {
  return useMutation({
    mutationFn: (filters?: {
      alumni?: "all" | "alumni" | "student";
      ig?: string;
      category?: string;
    }) => campusManageApi.downloadStudentDetailsCsv(filters),
    onError: (error) => {
      toast.error(
        getApiResponseError(error, { fallback: "Failed to download CSV" }),
      );
    },
  });
}

export function useChangeStudentType() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      memberId,
      data,
    }: {
      memberId: string;
      data: Record<string, unknown>;
    }) => campusManageApi.changeStudentType(memberId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: campusManageKeys.leaderboards(),
      });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to change student type",
        }),
      );
    },
  });
}

export function useIgChapters() {
  return useQuery({
    queryKey: campusManageKeys.igChapters(),
    queryFn: () => campusManageApi.getIgChapters(),
  });
}

export function useCreateIgChapter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      ig: string;
      description?: string;
      icon_link?: string;
      lead?: string;
    }) => campusManageApi.createIgChapter(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: campusManageKeys.igChapters(),
      });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to create IG chapter",
        }),
      );
    },
  });
}

export function useUpdateIgChapter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      chapterId,
      data,
    }: {
      chapterId: string;
      data: {
        description?: string;
        icon_link?: string;
        lead?: string;
        is_active?: boolean;
      };
    }) => campusManageApi.updateIgChapter(chapterId, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: campusManageKeys.igChapters(),
      });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to update IG chapter",
        }),
      );
    },
  });
}

export function useDeleteIgChapter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (chapterId: string) =>
      campusManageApi.deleteIgChapter(chapterId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: campusManageKeys.igChapters(),
      });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to delete IG chapter",
        }),
      );
    },
  });
}

export function useUpsertSocialLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { platform: string; url: string }) =>
      campusManageApi.upsertSocialLink(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: campusManageKeys.overview(),
      });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to save social link",
        }),
      );
    },
  });
}

export function useDeleteSocialLink() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (linkId: string) => campusManageApi.deleteSocialLink(linkId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: campusManageKeys.overview(),
      });
    },
    onError: (error) => {
      toast.error(
        getApiResponseError(error, {
          fallback: "Failed to delete social link",
        }),
      );
    },
  });
}

export function useUserProfile(muid: string) {
  return useQuery({
    queryKey: ["user-profile", muid],
    queryFn: () => campusManageApi.getUserProfile(muid),
    enabled: !!muid && muid.includes("@"),
    retry: false,
  });
}
