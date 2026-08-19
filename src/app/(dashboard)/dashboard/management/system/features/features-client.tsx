"use client";

import { Gamepad2 } from "lucide-react";
import { GritMeterItem } from "@/features/grit-meter";

export function FeaturesClient() {
  return (
    <div className="w-full space-y-6">
      {/* Category Box: Gamification */}
      <div className="rounded-xl border bg-card overflow-hidden shadow-2xs">
        {/* Category Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-500/15 text-purple-600 dark:text-purple-400">
              <Gamepad2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Gamification
              </h3>
              <p className="text-xs text-muted-foreground">
                Features related to user levels, grit, activity tracking, and
                rewards.
              </p>
            </div>
          </div>
        </div>

        {/* Category Feature List */}
        <div className="divide-y bg-card">
          <GritMeterItem />
        </div>
      </div>
    </div>
  );
}
