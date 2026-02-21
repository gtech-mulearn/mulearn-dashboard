export const karmaVoucherKeys = {
  all: ["karma-vouchers"] as const,
  lists: () => [...karmaVoucherKeys.all, "list"] as const,
  list: (params: {
    page: number;
    perPage: number;
    search?: string;
    sortBy?: string;
  }) => [...karmaVoucherKeys.lists(), params] as const,
};
