import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  fetchKarmaVouchers,
  type KarmaVoucherListParams,
} from "../api/karma-voucher.api";
import { karmaVoucherKeys } from "./query-keys";

export function getKarmaVouchersQueryOptions(params: KarmaVoucherListParams) {
  return {
    queryKey: karmaVoucherKeys.list(params),
    queryFn: () => fetchKarmaVouchers(params),
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  } as const;
}

export function useKarmaVouchers(params: KarmaVoucherListParams) {
  return useQuery(getKarmaVouchersQueryOptions(params));
}
