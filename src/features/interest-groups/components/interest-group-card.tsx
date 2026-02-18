/**
 * Interest Group Card Component
 *
 * 📍 src/features/interest-groups/components/interest-group-card.tsx
 *
 * Beautiful card component for displaying interest groups with gradient backgrounds.
 */

"use client";

import { Users } from "lucide-react";
import { useRouter } from "next/navigation";
import type { InterestGroup } from "../schemas/interest-groups.schema";

type InterestGroupCardProps = {
  group: InterestGroup;
  gradient: string;
};

export function InterestGroupCard({ group, gradient }: InterestGroupCardProps) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => router.push(`/dashboard/ig/${group.id}`)}
      className="group relative h-[280px] cursor-pointer overflow-hidden rounded-3xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
    >
      {/* Gradient Background */}
      <div
        className={`absolute inset-0 ${gradient} opacity-90 transition-opacity duration-300 group-hover:opacity-100`}
      />

      {/* Animated Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      {/* Content */}
      <div className="relative flex h-full flex-col justify-between p-6">
        {/* Top Section */}
        <div className="flex items-start justify-between">
          <div className="rounded-xl bg-white/20 px-3 py-1.5 backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-white/90">
              {group.category || "Interest Group"}
            </p>
          </div>
          {group.code && (
            <div className="rounded-full bg-white/20 px-3 py-1 backdrop-blur-sm">
              <p className="text-xs font-medium text-white">{group.code}</p>
            </div>
          )}
        </div>

        {/* Bottom Section */}
        <div className="space-y-3">
          <h3 className="font-display text-2xl font-bold leading-tight text-white drop-shadow-lg">
            {group.name}
          </h3>

          {group.member_count !== undefined && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 backdrop-blur-sm">
                <Users className="h-4 w-4 text-white/90" />
                <span className="text-sm font-semibold text-white">
                  {group.member_count.toLocaleString()} members
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hover Shimmer Effect */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-all duration-700 group-hover:translate-x-full group-hover:opacity-100" />
    </button>
  );
}
