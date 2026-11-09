import type { ComponentType } from "react";
import { FuturemugLogo, FuturemugMark } from "./futuremug/futuremug-logo";
import type { PartnerProvider } from "./types";

export type { PartnerAccountType, PartnerProvider } from "./types";

export interface PartnerMeta {
  name: string;
  description: string;
  Logo: ComponentType<{ className?: string }>;
  Mark: ComponentType<{ className?: string }>;
  /** Hosts a login link may point to; checked server-side as well. */
  isAllowedHost: (host: string) => boolean;
}

export const PARTNERS: Record<PartnerProvider, PartnerMeta> = {
  futuremug: {
    name: "Futuremug",
    description: "Assessments, AI interviews and expert interviews.",
    Logo: FuturemugLogo,
    Mark: FuturemugMark,
    isAllowedHost: (host) =>
      host === "futuremug.com" || host.endsWith(".futuremug.com"),
  },
};
