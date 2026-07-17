import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export interface GoogleTempTokenState {
  tempToken: string | null;
}

export interface GoogleTempTokenActions {
  setTempToken: (token: string | null) => void;
  clearTempToken: () => void;
}

export type GoogleTempTokenStore = GoogleTempTokenState &
  GoogleTempTokenActions;

/**
 * Zustand store to hold the temporary Google registration token in-memory.
 * This is more secure than localStorage or sessionStorage, avoiding storage vulnerability.
 */
export const useGoogleTempTokenStore = create<GoogleTempTokenStore>()(
  subscribeWithSelector((set) => ({
    tempToken: null,
    setTempToken: (token) => set({ tempToken: token }),
    clearTempToken: () => set({ tempToken: null }),
  })),
);
