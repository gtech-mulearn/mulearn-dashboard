"use client";

import {
  ClipboardCheck,
  Flame,
  Gamepad2,
  type LucideIcon,
  Plug,
} from "lucide-react";
import type { ReactNode } from "react";
import { FeatureFlagItem } from "@/features/feature-flags";

function FeatureGroup({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card overflow-hidden shadow-2xs">
      <div className="flex items-center justify-between px-5 py-4 border-b bg-muted/30">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-purple-500/15 text-purple-600 dark:text-purple-400">
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">{title}</h3>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
      </div>
      <div className="divide-y bg-card">{children}</div>
    </div>
  );
}

export function FeaturesClient() {
  return (
    <div className="w-full space-y-6">
      <FeatureGroup
        icon={Gamepad2}
        title="Gamification"
        description="Features related to user levels, grit, activity tracking, and rewards."
      >
        <FeatureFlagItem
          slug="grit-meter"
          title="Grit Meter"
          description="Automated daily activity tracking, HP decay, and level floor protection."
          icon={Flame}
          accentClassName="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
        />
      </FeatureGroup>

      <FeatureGroup
        icon={Plug}
        title="Integrations"
        description="Partner services connected to µLearn accounts."
      >
        <FeatureFlagItem
          slug="futuremug"
          title="Futuremug"
          description="Assessments and interviews for students, companies and colleges, through Futuremug."
          icon={ClipboardCheck}
          accentClassName="bg-sky-500/15 text-sky-600 dark:text-sky-400"
        />
      </FeatureGroup>
    </div>
  );
}
