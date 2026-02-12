/**
 * Karma Distribution Chart Component
 *
 * 📍 src/features/profile/components/karma-distribution.tsx
 *
 * Clean horizontal bar chart showing karma breakdown.
 */

"use client";

import type { UserProfile } from "../schemas";

interface KarmaDistributionProps {
  profile: UserProfile;
}

// Pastel colors for chart segments
const COLORS = [
  { bg: "bg-blue-100", bar: "bg-blue-500", text: "text-blue-700" },
  { bg: "bg-emerald-100", bar: "bg-emerald-500", text: "text-emerald-700" },
  { bg: "bg-amber-100", bar: "bg-amber-500", text: "text-amber-700" },
  { bg: "bg-rose-100", bar: "bg-rose-500", text: "text-rose-700" },
  { bg: "bg-violet-100", bar: "bg-violet-500", text: "text-violet-700" },
  { bg: "bg-cyan-100", bar: "bg-cyan-500", text: "text-cyan-700" },
];

export function KarmaDistribution({ profile }: KarmaDistributionProps) {
  // Combine karma distribution and interest groups data
  const distributionData = [
    ...profile.karma_distribution.map((item) => ({
      name: item.task_type,
      value: item.karma,
    })),
    ...profile.interest_groups
      .filter((ig) => ig.karma && ig.karma > 0)
      .map((ig) => ({
        name: ig.name,
        value: ig.karma as number,
      })),
  ]
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, 6); // Top 6 only

  const total = distributionData.reduce((sum, item) => sum + item.value, 0);

  if (total === 0) {
    return (
      <div className="text-center">
        <h3 className="mb-4 text-sm font-semibold text-gray-500 uppercase tracking-wide">
          Karma Distribution
        </h3>
        <div className="rounded-xl bg-gray-50 p-6 text-sm text-gray-500">
          <p>No karma data to display yet.</p>
          <p className="mt-1 text-xs">Complete tasks to see your breakdown!</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="mb-4 text-sm font-semibold text-gray-500 uppercase tracking-wide">
        Karma Distribution
      </h3>

      <div className="space-y-3">
        {distributionData.map((item, index) => {
          const percentage = Math.round((item.value / total) * 100);
          const color = COLORS[index % COLORS.length];

          return (
            <div key={item.name} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700 truncate max-w-[60%]">
                  {item.name}
                </span>
                <span className={`font-semibold ${color.text}`}>
                  {item.value.toLocaleString()}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-100">
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
      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
        <span className="text-sm font-medium text-gray-500">Total Karma</span>
        <span className="text-lg font-bold text-foreground">
          {total.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
