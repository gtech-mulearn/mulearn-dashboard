"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { isValid, parseISO } from "date-fns";
import { ApiError } from "@/api";
import type { CampusSessionListParams } from "../api/campus.api";
import {
  assignCampusMentor,
  campusService,
  createCampusSession,
  fetchCampusSessions,
} from "../api/campus.api";
import { campusKeys } from "./query-keys";
import type { CampusSessionCreateValues } from "../schemas";

// ─── campusKeys: info + weekly-karma ─────────────────────────────────────────
export const useCampusInfo = (id: string) => {
  return useQuery({
    queryKey: campusKeys.info(id),
    queryFn: () => campusService.getCampusInfo(id),
    enabled: !!id,
  });
};

export const useWeeklyKarma = (id: string) => {
  return useQuery({
    queryKey: campusKeys.weeklyKarma(id),
    enabled: !!id,
    queryFn: () => campusService.getWeeklyKarma(id),
    select: (data) => {
      if (!data || typeof data !== "object") return [];
      const source =
        "response" in data && data.response && typeof data.response === "object"
          ? (data.response as Record<string, unknown>)
          : (data as Record<string, unknown>);
      return Object.entries(source)
        .filter(([key]) => /^\d{4}-\d{2}-\d{2}$/.test(key))
        .map(([date, value]) => ({
          date,
          value: Number(value) || 0,
        }))
        .filter(({ date }) => isValid(parseISO(date)))
        .sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
        );
    },
  });
};

// ─── Campus Mentor & Sessions query keys ─────────────────────────────────────
export const campusMentorKeys = {
  all: ["campus-mentor"] as const,
  sessions: () => [...campusMentorKeys.all, "sessions"] as const,
  sessionList: (params: Record<string, unknown>) =>
    [...campusMentorKeys.sessions(), "list", params] as const,
};

// ─── Retry helper: skip retrying on 403 ──────────────────────────────────────
const no403Retry = (failureCount: number, error: unknown) => {
  if (
    error instanceof Error &&
    "status" in error &&
    (error as { status: number }).status === 403
  )
    return false;
  return failureCount < 2;
};

// ─── #3 GET sessions/list/ ────────────────────────────────────────────────────
export function useCampusSessions(params: CampusSessionListParams = {}) {
  return useQuery({
    queryKey: campusMentorKeys.sessionList(params as Record<string, unknown>),
    queryFn: () => fetchCampusSessions(params),
    retry: no403Retry,
    staleTime: 2 * 60 * 1000,
  });
}

// ─── #1 POST assign-mentor/ ──────────────────────────────────────────────────
export function useAssignCampusMentor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (muid: string) => assignCampusMentor(muid),
    onSuccess: () => {
      toast.success("Student successfully nominated as a Campus Mentor.");
      void qc.invalidateQueries({ queryKey: campusMentorKeys.all });
    },
    onError: (error) =>
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Failed to assign campus mentor",
      ),
  });
}

// ─── #2 POST sessions/create/ ─────────────────────────────────────────────────
export function useCreateCampusSession() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CampusSessionCreateValues) => createCampusSession(data),
    onSuccess: () => {
      toast.success(
        "Campus session created successfully and is pending approval.",
      );
      void qc.invalidateQueries({ queryKey: campusMentorKeys.sessions() });
    },
    onError: (error) =>
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Failed to create campus session",
      ),
  });
}
