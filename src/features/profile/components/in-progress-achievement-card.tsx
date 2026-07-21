/**
 * In-Progress Achievement Card
 *
 * 📍 src/features/profile/components/in-progress-achievement-card.tsx
 *
 * Shows an achievement the user is working towards, with a progress bar
 * and a disabled "Locked" button.
 */

"use client";

import { Award, Lock } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { Achievement, EligibleAchievement } from "@/features/achievements";
import { resolveMediaUrl } from "@/lib/utils";

function ProgressBar({ value }: { value: number }) {
  const clamped = Math.min(100, Math.max(0, value));
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted/70">
      <div
        className="h-full rounded-full bg-amber-500 transition-all duration-500 ease-out"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}

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
  if (progress.event_name) return `Event Attendance`;
  if (progress.task_hashtag) return `Task: ${progress.task_hashtag}`;
  if (progress.ig_id) return "IG Karma";
  if (progress.skill_id) return "Skill Tasks";
  return "Progress";
}

interface InProgressAchievementCardProps {
  item: EligibleAchievement;
  /** Rich metadata merged from the master achievements list */
  meta?: Achievement;
}

export function InProgressAchievementCard({
  item,
  meta,
}: InProgressAchievementCardProps) {
  const iconUrl = meta?.icon_url || meta?.icon || "";
  const resolvedImageSrc = resolveMediaUrl(iconUrl);

  const pct = item.progress?.percentage ?? 0;
  const current = item.progress?.current;
  const required = item.progress?.required;
  const label = getProgressLabel(item.progress);

  return (
    <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
      {/* ── Body ─────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center px-6 pt-9 pb-6">
        {/* Circular icon — slightly muted to indicate locked state */}
        <div className="mb-5 h-36 w-36 shrink-0 overflow-hidden rounded-full border-2 border-border/60 bg-muted shadow-sm ring-4 ring-primary/5 opacity-80 transition-all duration-300 group-hover:opacity-100 group-hover:ring-primary/10 group-hover:shadow-md">
          {resolvedImageSrc ? (
            <div className="relative h-full w-full grayscale group-hover:grayscale-0 transition-all duration-300">
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
              <Award className="h-12 w-12 text-muted-foreground/60" />
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

          {/* Progress section */}
          {item.progress && (
            <div className="w-full mt-4 space-y-1.5">
              {/* Metric label */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-muted-foreground">
                  {label}
                </span>
                <span className="font-semibold text-foreground">{pct}%</span>
              </div>
              <ProgressBar value={pct} />
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  <span className="font-semibold text-foreground">
                    {(current ?? 0).toLocaleString()}
                  </span>
                  {" / "}
                  {(required ?? 0).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Footer ───────────────────────────────────────────── */}
      <div className="flex justify-center px-6 pb-6 pt-2">
        <Button
          disabled
          variant="outline"
          className="h-10 w-full rounded-xl text-sm font-semibold cursor-not-allowed opacity-60 gap-2"
        >
          <Lock className="h-3.5 w-3.5" />
          Locked
        </Button>
      </div>
    </div>
  );
}
