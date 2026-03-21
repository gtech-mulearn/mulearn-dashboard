"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
      filters.cluster,
      filters.alumni,
    ),
    queryFn: () => campusManageApi.getLeaderboard(filters),
  });
}

export function useKarmaByCluster(orgId?: string) {
  return useQuery({
    queryKey: campusManageKeys.karmaByCluster(orgId),
    queryFn: () => campusManageApi.getKarmaByCluster(orgId),
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
    mutationFn: (muid: string) => campusManageApi.addExecomMember(muid),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: campusManageKeys.execom(),
      });
    },
  });
}

export function useRemoveExecomMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) =>
      campusManageApi.removeExecomMember(memberId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: campusManageKeys.execom(),
      });
    },
  });
}

export function useTransferLeadRole() {
  return useMutation({
    mutationFn: (muid: string) => campusManageApi.transferLeadRole(muid),
  });
}

export function useTransferEnablerRole() {
  return useMutation({
    mutationFn: (muid: string) => campusManageApi.transferEnablerRole(muid),
  });
}

export function useIgCodes() {
  return useQuery({
    queryKey: campusManageKeys.igCodes(),
    queryFn: () => campusManageApi.getIgCodes(),
  });
}

export function useTransferIgRole() {
  return useMutation({
    mutationFn: ({ muid, igCode }: { muid: string; igCode: string }) =>
      campusManageApi.transferIgRole(muid, igCode),
  });
}

export function useChangeStudentType() {
  return useMutation({
    mutationFn: ({
      memberId,
      data,
    }: {
      memberId: string;
      data: Record<string, unknown>;
    }) => campusManageApi.changeStudentType(memberId, data),
  });
}

export function useIgChapters(orgId?: string) {
  return useQuery({
    queryKey: campusManageKeys.igChapters(orgId),
    queryFn: () => campusManageApi.getIgChapters(orgId),
  });
}

export function useSocialLinks(orgId?: string) {
  return useQuery({
    queryKey: campusManageKeys.socialLinks(orgId),
    queryFn: () => campusManageApi.getSocialLinks(orgId),
  });
}
