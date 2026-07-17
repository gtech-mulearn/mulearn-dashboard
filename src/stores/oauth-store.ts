import { create } from "zustand";

export interface GoogleTempTokenState {
  tempToken: string | null;
}

export interface GoogleTempTokenActions {
  setTempToken: (token: string | null) => void;
  clearTempToken: () => void;
}

export type GoogleTempTokenStore = GoogleTempTokenState &
  GoogleTempTokenActions;

export const useGoogleTempTokenStore = create<GoogleTempTokenStore>()(
  (set) => ({
    tempToken: null,
    setTempToken: (token) => set({ tempToken: token }),
    clearTempToken: () => set({ tempToken: null }),
  }),
);
