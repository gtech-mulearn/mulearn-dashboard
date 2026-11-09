import type { PartnerAccountType, PartnerProvider } from "../providers/types";

export const partnerKeys = {
  all: ["partner-connection"] as const,
  connection: (provider: PartnerProvider, type: PartnerAccountType) =>
    [...partnerKeys.all, provider, type] as const,
};
