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
  setSidebarExpanded: (expanded: boolean) => void;
  resetUI: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isSidebarExpanded: true, // Default to expanded on desktop
      setSidebarExpanded: (expanded) => set({ isSidebarExpanded: expanded }),
      resetUI: () =>
        set({
          isSidebarExpanded: true,
        }),
    }),
    {
      name: "ui-storage",
      partialize: (state) => ({
        isSidebarExpanded: state.isSidebarExpanded,
      }),
    },
  ),
);
