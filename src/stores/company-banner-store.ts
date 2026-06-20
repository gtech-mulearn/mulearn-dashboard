/**
 * Company Banner Store
 *
 * 📍 src/stores/company-banner-store.ts
 *
 * Persists the dismissed state of the one-time "company verified" success
 * banner so it is shown only once per company instead of on every dashboard
 * load. Keyed by company id so it behaves correctly if multiple company
 * accounts are used on the same browser.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CompanyBannerState {
  /** Map of companyKey → whether the verified banner has been dismissed. */
  dismissedVerifiedBanner: Record<string, boolean>;
  dismissVerifiedBanner: (companyKey: string) => void;
}

export const useCompanyBannerStore = create<CompanyBannerState>()(
  persist(
    (set) => ({
      dismissedVerifiedBanner: {},
      dismissVerifiedBanner: (companyKey) =>
        set((state) => ({
          dismissedVerifiedBanner: {
            ...state.dismissedVerifiedBanner,
            [companyKey]: true,
          },
        })),
    }),
    { name: "company-banner-store" },
  ),
);
