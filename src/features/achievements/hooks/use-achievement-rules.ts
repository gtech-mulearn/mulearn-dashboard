"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchRules } from "../api";
import { ACHIEVEMENT_KEYS } from "./use-achievements";

// ==========================================
// useRules — thin wrapper exported from this file
// ==========================================

export function useRules() {
  return useQuery({
    queryKey: ACHIEVEMENT_KEYS.rules(),
    queryFn: fetchRules,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
}
