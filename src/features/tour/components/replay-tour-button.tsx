"use client";

/**
 * ReplayTourButton
 *
 * 📍 src/features/tour/components/replay-tour-button.tsx
 *
 * Manual "Take a Tour" trigger (§6.3). Renders nothing for users with no
 * tour (Admin, Associate, unscoped roles).
 */

import { Compass } from "lucide-react";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { useReplayTour } from "../hooks/use-tour";

export function ReplayTourButton() {
  const { replay, canReplay } = useReplayTour();

  if (!canReplay) return null;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={replay}
        tooltip="Take a Tour"
        className="rounded-xl h-auto py-2.5 px-3 gap-3 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
      >
        <Compass className="w-5 h-5 shrink-0" />
        <span className="text-sm font-medium whitespace-nowrap">
          Take a Tour
        </span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
