"use client";

/**
 * ReplayPageTourButton
 *
 * 📍 src/features/tour/components/replay-page-tour-button.tsx
 *
 * Manual "Tour this page" trigger. Mounted globally (in `AppTopbar`) rather
 * than per-page — it reads the current route itself via `useReplayPageTour`
 * and renders nothing when that route has no page tour registered.
 */

import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useReplayPageTour } from "../hooks/use-tour";

export function ReplayPageTourButton() {
  const { replay, canReplay } = useReplayPageTour();

  if (!canReplay) return null;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={replay}
      title="Tour this page"
      aria-label="Tour this page"
      className="text-muted-foreground hover:text-accent-foreground"
    >
      <Compass className="w-5 h-5" />
    </Button>
  );
}
