/**
 * Eligible Achievement Card
 *
 * 📍 src/features/profile/components/eligible-achievement-card.tsx
 *
 * Shows an achievement the user is currently eligible to claim.
 * Provides a "Claim Achievement" button that triggers the claim mutation.
 */

"use client";

import { Award, Loader2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  type Achievement,
  type EligibleAchievement,
  useClaimAchievement,
} from "@/features/achievements";
import { resolveMediaUrl } from "@/lib/utils";

function getProgressLabel(progress: EligibleAchievement["progress"]): string {
  if (!progress) return "Progress";
  if (progress.milestone_type) {
    return progress.milestone_type === "total_karma"
      ? "Total Karma"
      : "Total Tasks";
  }
  if (progress.streak_type) {
    return progress.streak_type === "daily_task"
      ? "Daily Task Streak"
      : "Login Streak";
  }
  if (progress.event_name) return "Event Attendance";
  if (progress.task_hashtag) return `Task: ${progress.task_hashtag}`;
  if (progress.ig_id) return "IG Karma";
  if (progress.skill_id) return "Skill Tasks";
  return "Progress";
}

interface EligibleAchievementCardProps {
  item: EligibleAchievement;
  /** Rich metadata merged from the master achievements list */
  meta?: Achievement;
  onClaimed?: () => void;
}

export function EligibleAchievementCard({
  item,
  meta,
  onClaimed,
}: EligibleAchievementCardProps) {
  const { mutate: claim, isPending } = useClaimAchievement();

  const iconUrl = meta?.icon_url || meta?.icon || "";
  const resolvedImageSrc = resolveMediaUrl(iconUrl);

  const handleClaim = () => {
    claim(item.achievement_id, {
      onSuccess: () => {
        onClaimed?.();
      },
    });
  };

  const progress = item.progress;
  const label = getProgressLabel(progress);

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
      {/* ── Body ─────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center px-6 pt-9 pb-6">
        {/* Circular icon */}
        <div className="mb-5 h-36 w-36 shrink-0 overflow-hidden rounded-full border-2 border-brand-blue/40 bg-muted shadow-sm ring-4 ring-brand-blue/10 transition-all duration-300 group-hover:ring-brand-blue/25 group-hover:shadow-md">
          {resolvedImageSrc ? (
            <div className="relative h-full w-full">
              <Image
                src={resolvedImageSrc}
                alt={item.achievement_name}
                fill
                className="object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <Award className="h-12 w-12 text-brand-blue/60" />
            </div>
          )}
        </div>

        {/* Title + description */}
        <div className="flex w-full flex-col items-center gap-2">
          <h2 className="text-center text-lg font-semibold leading-snug text-foreground line-clamp-2">
            {item.achievement_name}
          </h2>
          {meta?.description && (
            <p className="text-center text-sm text-muted-foreground line-clamp-3 leading-relaxed">
              {meta.description}
            </p>
          )}

          {/* Metric met — compact summary row */}
          {progress && (
            <div className="mt-2 flex items-center gap-1.5 rounded-full bg-success/10 border border-success/20 px-3 py-1 text-xs font-medium text-success">
              <span>{label}:</span>
              <span className="font-bold">
                {(progress.current ?? 0).toLocaleString()}
              </span>
              <span className="text-success/70">
                / {(progress.required ?? 0).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────────── */}
      <div className="flex justify-center px-6 pb-6 pt-2">
        <Button
          onClick={handleClaim}
          disabled={isPending}
          className="h-10 w-full rounded-xl text-sm font-semibold bg-brand-blue text-primary-foreground hover:bg-brand-blue/90 shadow-xs border border-transparent transition-all duration-300"
        >
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Claim Achievement
        </Button>
      </div>
    </div>
  );
}
