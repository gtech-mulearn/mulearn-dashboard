/**
 * Karma Distribution Chart Component
 *
 * 📍 src/features/profile/components/karma-distribution.tsx
 *
 * Clean horizontal bar chart showing karma breakdown.
 */

"use client";

import { useMemo } from "react";
import type { UserProfile } from "../schemas";
import { buildKarmaBreakdown } from "../utils/karma.utils";

interface KarmaDistributionProps {
  profile: UserProfile;
}

// TODO: karma distribution chart segment colors are a meaningful categorical palette — leave as-is
const COLORS = [
  { bg: "bg-blue-100", bar: "bg-blue-500", text: "text-blue-700" },
  { bg: "bg-emerald-100", bar: "bg-emerald-500", text: "text-emerald-700" },
  { bg: "bg-amber-100", bar: "bg-amber-500", text: "text-amber-700" },
  { bg: "bg-rose-100", bar: "bg-rose-500", text: "text-rose-700" },
  { bg: "bg-violet-100", bar: "bg-violet-500", text: "text-violet-700" },
  { bg: "bg-cyan-100", bar: "bg-cyan-500", text: "text-cyan-700" },
];

export function KarmaDistribution({ profile }: KarmaDistributionProps) {

  const { slices: distributionData, total } = useMemo(
    () => buildKarmaBreakdown(profile.karma ?? 0, profile.interest_groups),
    [profile.karma, profile.interest_groups],
  );

  if (total === 0) {
    return (
      <div className="text-center">
        <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
          Karma Distribution
        </h3>
        <div className="rounded-xl bg-muted p-6 text-sm text-muted-foreground">
          <p>No karma data to display yet.</p>
          <p className="mt-1 text-xs">Complete tasks to see your breakdown!</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Karma Distribution
      </h3>

      <div className="space-y-3">
        {distributionData.map((item, index) => {
          const percentage = Math.round((item.value / total) * 100);
          const color = COLORS[index % COLORS.length];

          return (
            <div key={item.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground truncate max-w-[60%]">
                  {item.name}
                </span>
                <span className={`font-semibold ${color.text}`}>
                  {item.value.toLocaleString()}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                  className={`h-full rounded-full ${color.bar} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Total */}
      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <span className="text-sm font-medium text-muted-foreground">
          Total Karma
        </span>
        <span className="text-lg font-bold text-foreground">
          {total.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
