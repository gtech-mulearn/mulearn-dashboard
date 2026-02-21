import { useQuery } from "@tanstack/react-query";
import { fetchKarmaVouchers } from "../api/karma-voucher.api";

export function useKarmaVouchers(
  token: string,
  page: number,
  perPage: number,
  search?: string,
  sortBy?: string,
) {
  return useQuery({
    queryKey: ["karma-vouchers", { page, perPage, search, sortBy }],
    queryFn: () => fetchKarmaVouchers(token, page, perPage, search, sortBy),
    placeholderData: (previousData) => previousData,
  });
}
