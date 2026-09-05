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
  /**
   * Persisted profile view preference.
   * "mentor"  → show the mentor profile page (default for verified mentors)
   * "learner" → show the standard learner profile page
   */
  profileViewMode: "mentor" | "learner";
  setProfileViewMode: (mode: "mentor" | "learner") => void;
  resetUI: () => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isSidebarExpanded: true, // Default to expanded on desktop
      setSidebarExpanded: (expanded) => set({ isSidebarExpanded: expanded }),
      profileViewMode: "mentor",
      setProfileViewMode: (mode) => set({ profileViewMode: mode }),
      resetUI: () =>
        set({
          isSidebarExpanded: true,
          // Do NOT reset profileViewMode here — it should survive logout-level resets
          // only the user's explicit toggle should change it.
        }),
    }),
    {
      name: "ui-storage",
      partialize: (state) => ({
        isSidebarExpanded: state.isSidebarExpanded,
        profileViewMode: state.profileViewMode,
      }),
    },
  ),
);
