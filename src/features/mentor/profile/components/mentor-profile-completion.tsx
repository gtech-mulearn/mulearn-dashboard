/**
 * Mentor Profile Completion Banner
 *
 * 📍 src/features/mentor/profile/components/mentor-profile-completion.tsx
 *
 * A card that shows the mentor's profile fill percentage as an animated
 * progress bar, plus per-field checklist chips and a CTA to the edit modal.
 *
 * Placement: between Header and Stats Row in mentor-profile-page.tsx.
 * Hidden automatically once percentage reaches 100%.
 */

"use client";

import { CheckCircle2, Pencil, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type {
  ProfileCompletionChecklist,
  ProfileCompletionData,
} from "../../api/mentor.api";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Human-readable labels for each checklist field */
const CHECKLIST_LABELS: Record<keyof ProfileCompletionChecklist, string> = {
  about: "Bio",
  expertise: "Expertise",
  hours: "Hours",
  linkedin: "LinkedIn",
  preferred_igs: "Interest Groups",
};

/** Returns a Tailwind class for the progress bar fill based on percentage */
function barColor(pct: number): string {
  if (pct >= 100) return "bg-emerald-500";
  if (pct >= 60) return "bg-amber-500";
  return "bg-rose-500";
}

/** Returns a Tailwind class for the percentage text badge */
function badgeColor(pct: number): string {
  if (pct >= 100) return "bg-emerald-500/15 text-emerald-500";
  if (pct >= 60) return "bg-amber-500/15 text-amber-500";
  return "bg-rose-500/15 text-rose-500";
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function MentorProfileCompletionSkeleton() {
  return (
    <Card className="rounded-2xl border-border/50 bg-card/80 backdrop-blur-sm">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-6 w-12 rounded-full" />
        </div>
        <Skeleton className="h-2.5 w-full rounded-full mb-4" />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-6 w-20 rounded-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface MentorProfileCompletionProps {
  data: ProfileCompletionData;
  onEdit: () => void;
}

export function MentorProfileCompletion({
  data,
  onEdit,
}: MentorProfileCompletionProps) {
  const { percentage, checklist } = data;

  // Animate the bar from 0 → actual value on mount
  const [displayPct, setDisplayPct] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setDisplayPct(percentage), 80);
    return () => clearTimeout(t);
  }, [percentage]);

  const checklistEntries = Object.entries(checklist) as [
    keyof ProfileCompletionChecklist,
    boolean,
  ][];
  const completedCount = checklistEntries.filter(([, v]) => v).length;
  const totalCount = checklistEntries.length;

  return (
    <Card className="rounded-2xl border-border/50 bg-card/80 backdrop-blur-sm">
      <CardContent className="p-4 sm:p-5">
        {/* Header row */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">
              Profile Completion
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {completedCount} of {totalCount} fields filled
            </p>
          </div>
          {/* Percentage badge */}
          <span
            className={cn(
              "shrink-0 rounded-full px-2.5 py-1 text-xs font-bold tabular-nums",
              badgeColor(percentage),
            )}
          >
            {percentage}%
          </span>
        </div>

        {/* Progress bar track */}
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted mb-4">
          <div
            className={cn(
              "h-full rounded-full transition-[width] duration-700 ease-out",
              barColor(percentage),
            )}
            style={{ width: `${Math.min(displayPct, 100)}%` }}
          />
        </div>

        {/* Checklist chips + CTA row */}
        <div className="flex flex-wrap items-center gap-2">
          {checklistEntries.map(([key, done]) => (
            <span
              key={key}
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
                done
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {done ? (
                <CheckCircle2 className="h-3 w-3 shrink-0" />
              ) : (
                <XCircle className="h-3 w-3 shrink-0" />
              )}
              {CHECKLIST_LABELS[key]}
            </span>
          ))}

          {/* CTA — only shown when profile is incomplete */}
          {percentage < 100 && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onEdit}
              className="ml-auto gap-1.5 rounded-full text-xs h-7 px-3"
            >
              <Pencil className="h-3 w-3" />
              Complete Profile
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
