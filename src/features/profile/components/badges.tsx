"use client";

/**
 * Badges Component
 *
 * 📍 src/features/profile/components/badges.tsx
 *
 * Displays user badges/achievements as earned tasks.
 */

import { Award } from "lucide-react";
import { useBadges } from "../hooks";

interface BadgesProps {
  muid: string;
  isOwnProfile: boolean;
}

export function Badges({ muid, isOwnProfile }: BadgesProps) {
  const { data, isLoading, isError, refetch } = useBadges(muid);

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-card p-8 flex justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl bg-destructive/5 p-8 text-center">
        <p className="text-destructive">Failed to load badges</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="mt-2 text-sm text-primary hover:underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!data || data.completed_tasks.length === 0) {
    return (
      <div className="rounded-2xl bg-card p-8 text-center">
        <Award className="h-12 w-12 text-muted-foreground/40 mx-auto" />
        <p className="mt-3 text-muted-foreground">
          {isOwnProfile
            ? "No badges yet — complete tagged tasks to earn them."
            : "No badges yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-card p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">
        Badges ({data.completed_tasks.length})
      </h3>
      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {data.completed_tasks.map((title) => (
          <li
            key={title}
            className="flex items-center gap-3 rounded-xl border p-3"
          >
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Award className="h-5 w-5 text-primary" />
            </div>
            <p className="text-sm font-medium truncate">{title}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
