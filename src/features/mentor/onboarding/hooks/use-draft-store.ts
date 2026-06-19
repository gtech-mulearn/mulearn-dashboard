import { create } from "zustand";
import type { OnboardingFormValues } from "../schemas";

interface DraftStore {
  draft: Partial<OnboardingFormValues> | null;
  setDraft: (draft: Partial<OnboardingFormValues>) => void;
  clearDraft: () => void;
}

export const useOnboardingDraftStore = create<DraftStore>((set) => ({
  draft: null,
  setDraft: (draft) => set({ draft }),
  clearDraft: () => set({ draft: null }),
}));
