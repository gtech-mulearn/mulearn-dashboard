/**
 * Grit Meter Feature Item Component
 *
 * 📍 src/features/grit-meter/components/grit-meter-item.tsx
 */

"use client";

import { Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { useGritMeterStatus, useToggleGritMeter } from "../hooks";

export function GritMeterItem() {
  const { data, isLoading } = useGritMeterStatus();
  const toggleMutation = useToggleGritMeter();

  const isEnabled = data?.enabled ?? false;
  const isUpdating = toggleMutation.isPending;

  const handleToggle = (checked: boolean) => {
    toggleMutation.mutate(checked);
  };

  return (
    <div className="flex items-center justify-between p-5 hover:bg-muted/20 transition-colors">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
          <Flame className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">Grit Meter</span>
            {isLoading ? (
              <Spinner className="h-3.5 w-3.5 text-muted-foreground" />
            ) : (
              <Badge
                variant={isEnabled ? "default" : "secondary"}
                className={
                  isEnabled
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20"
                    : "bg-muted text-muted-foreground"
                }
              >
                {isEnabled ? "Enabled" : "Disabled"}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Automated daily activity tracking, HP decay, and level floor
            protection.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isUpdating && <Spinner className="h-4 w-4 text-muted-foreground" />}
        <Switch
          checked={isEnabled}
          onCheckedChange={handleToggle}
          disabled={isLoading || isUpdating}
        />
      </div>
    </div>
  );
}
