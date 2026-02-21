/**
 * Dynamic Users Hook
 *
 * 📍 src/features/dynamic-type/hooks/use-dynamic-users.ts
 *
 * TanStack Query hook for fetching dynamic user-type mappings.
 * The raw nested response is flattened in the `select` option.
 */

"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchDynamicUsers } from "../api";
import { flattenDynamicUsers } from "../schemas";
import type { DynamicUserItem } from "../types";
import { dynamicTypeKeys } from "./query-keys";

/** Fetch all dynamic user-type mappings, flattened for table display. */
export function useDynamicUsers() {
  return useQuery({
    queryKey: dynamicTypeKeys.users(),
    queryFn: fetchDynamicUsers,
    select: (groups): DynamicUserItem[] => flattenDynamicUsers(groups),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
