/**
 * Auth Store
 *
 * 📍 src/stores/auth-store.ts
 *
 * Global auth state management using Zustand.
 * Handles user role and session state.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  role: string | null;
  setRole: (role: string | null) => void;
  resetAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      role: null,
      setRole: (role) => set({ role }),
      resetAuth: () => set({ role: null }),
    }),
    {
      name: "auth-storage",
    },
  ),
);
