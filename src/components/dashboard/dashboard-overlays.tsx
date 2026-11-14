"use client";

/**
 * DashboardOverlays
 *
 * 📍 src/components/dashboard/dashboard-overlays.tsx
 *
 * Coordinates the two dashboard-wide overlays: What's New popup and the
 * onboarding tour. They must not fight for the screen on the same visit —
 * the tour stays gated until What's New has fully closed.
 */

import { useCallback, useState } from "react";
import { TourController, type TourCookiePayload } from "@/features/tour";
import type { ChangelogEntry } from "@/lib/whats-new";
import { WhatsNewPopup } from "./whats-new-popup";

interface DashboardOverlaysProps {
  entry: ChangelogEntry | null;
  whatsNewOpen: boolean;
  onWhatsNewSeen: (hash: string) => Promise<void>;
  onWhatsNewDismiss: (hash: string) => Promise<void>;
  tourInitialState: TourCookiePayload;
}

export function DashboardOverlays({
  entry,
  whatsNewOpen,
  onWhatsNewSeen,
  onWhatsNewDismiss,
  tourInitialState,
}: DashboardOverlaysProps) {
  const [isWhatsNewShowing, setIsWhatsNewShowing] = useState(whatsNewOpen);
  const handleVisibilityChange = useCallback((visible: boolean) => {
    setIsWhatsNewShowing(visible);
  }, []);

  return (
    <>
      <TourController
        initialState={tourInitialState}
        blocked={isWhatsNewShowing}
      />
      <WhatsNewPopup
        entry={entry}
        isOpen={whatsNewOpen}
        onSeen={onWhatsNewSeen}
        onDismiss={onWhatsNewDismiss}
        onVisibilityChange={handleVisibilityChange}
      />
    </>
  );
}
