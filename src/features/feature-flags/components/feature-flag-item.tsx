/**
 * One switch on System → Features.
 *
 * 📍 src/features/feature-flags/components/feature-flag-item.tsx
 */

"use client";

import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useFeatureFlag, useToggleFeatureFlag } from "../hooks";

interface FeatureFlagItemProps {
  /** The backend slug: /api/v1/dashboard/feature/<slug>/ */
  slug: string;
  title: string;
  description: string;
  icon: LucideIcon;
  /** Background and text colour of the icon tile. */
  accentClassName: string;
}

export function FeatureFlagItem({
  slug,
  title,
  description,
  icon: Icon,
  accentClassName,
}: FeatureFlagItemProps) {
  const { data, isLoading } = useFeatureFlag(slug);
  const toggle = useToggleFeatureFlag(slug, title);

  const isEnabled = data?.enabled ?? false;
  // Server settings (keys, URLs) are missing: it can't work, so it can't be switched on.
  const notConfigured = data?.configured === false;
  const isUpdating = toggle.isPending;

  return (
    <div className="flex items-center justify-between p-5 hover:bg-muted/20 transition-colors">
      <div className="flex items-start gap-4">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            accentClassName,
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{title}</span>
            {isLoading ? (
              <Spinner className="h-3.5 w-3.5 text-muted-foreground" />
            ) : notConfigured ? (
              <Badge
                variant="secondary"
                className="bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30"
              >
                Not configured
              </Badge>
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
            {description}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isUpdating && <Spinner className="h-4 w-4 text-muted-foreground" />}
        <Switch
          aria-label={title}
          checked={isEnabled}
          onCheckedChange={(checked) => toggle.mutate(checked)}
          // Switching off always works; switching on needs the configuration.
          disabled={isLoading || isUpdating || (notConfigured && !isEnabled)}
        />
      </div>
    </div>
  );
}
