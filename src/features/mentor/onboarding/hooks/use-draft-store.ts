import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { OnboardingFormValues } from "../schemas";

interface DraftStore {
  /** Live draft — saved on every keystroke while filling the form. */
  draft: Partial<OnboardingFormValues> | null;
  /**
   * Snapshot of the last successfully submitted application.
   * Persists through logout so the "Reapply" form can prefill
   * all fields the user entered originally.
   * Only wiped when a *new* reapply submission succeeds.
   */
  lastSubmitted: Partial<OnboardingFormValues> | null;
  setDraft: (draft: Partial<OnboardingFormValues>) => void;
  clearDraft: () => void;
  saveSnapshot: (values: Partial<OnboardingFormValues>) => void;
  clearSnapshot: () => void;
}

export const useOnboardingDraftStore = create<DraftStore>()(
  persist(
    (set) => ({
      draft: null,
      lastSubmitted: null,
      setDraft: (draft) => set({ draft }),
      clearDraft: () => set({ draft: null }),
      saveSnapshot: (values) => set({ lastSubmitted: values }),
      clearSnapshot: () => set({ lastSubmitted: null }),
    }),
    {
      name: "mentor-onboarding-draft",
    },
  ),
);
