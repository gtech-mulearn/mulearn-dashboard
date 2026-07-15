import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchAuditLogs, fetchIssuedLogs } from "../api";
import { ACHIEVEMENT_KEYS } from "./use-achievements";

// ==========================================
// useAuditLogs — audit log for a specific MUID
// ==========================================

export function useAuditLogs(muid: string) {
  return useQuery({
    queryKey: ACHIEVEMENT_KEYS.auditLogs(muid),
    queryFn: () => fetchAuditLogs(muid),
    enabled: Boolean(muid.trim()),
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}

// ==========================================
// useIssuedLogs — server-paginated issued log
// ==========================================

export function useIssuedLogs(page: number, perPage: number, search?: string) {
  return useQuery({
    queryKey: ACHIEVEMENT_KEYS.issuedLogs(page, perPage, search),
    queryFn: () => fetchIssuedLogs(page, perPage, search),
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
