/**
 * UI Store
 *
 * 📍 src/stores/ui-store.ts
 *
 * Global UI state management using Zustand.
 * Handles sidebar expansion/collapse state with persistence.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  isSidebarExpanded: boolean;
  toggleSidebar: () => void;
  setSidebarExpanded: (expanded: boolean) => void;
  expandSidebar: () => void;
  collapseSidebar: () => void;
  isConnectBannerDismissed: boolean;
  dismissConnectBanner: () => void;
  resetUI: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isSidebarExpanded: true, // Default to expanded on desktop
      toggleSidebar: () =>
        set((state) => ({ isSidebarExpanded: !state.isSidebarExpanded })),
      setSidebarExpanded: (expanded) => set({ isSidebarExpanded: expanded }),
      expandSidebar: () => set({ isSidebarExpanded: true }),
      collapseSidebar: () => set({ isSidebarExpanded: false }),
      isConnectBannerDismissed: false,
      dismissConnectBanner: () => set({ isConnectBannerDismissed: true }),
      resetUI: () =>
        set({
          isSidebarExpanded: true,
          isConnectBannerDismissed: false,
        }),
    }),
    {
      name: "ui-storage", // content of the store (isSidebarExpanded) will be stored in localStorage
    },
  ),
);
