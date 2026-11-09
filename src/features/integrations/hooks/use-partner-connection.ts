"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { disconnectPartner, getPartnerConnection } from "../api";
import type { PartnerAccountType, PartnerProvider } from "../providers/types";
import { partnerKeys } from "./query-keys";

export function usePartnerConnection(
  provider: PartnerProvider,
  type: PartnerAccountType,
) {
  return useQuery({
    queryKey: partnerKeys.connection(provider, type),
    queryFn: () => getPartnerConnection(provider, type),
    staleTime: 30_000,
  });
}

export function useDisconnectPartner(
  provider: PartnerProvider,
  type: PartnerAccountType,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => disconnectPartner(provider, type),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: partnerKeys.connection(provider, type),
      }),
  });
}
