/**
 * Interest Group Card Component
 *
 * 📍 src/features/interest-groups/components/interest-group-card.tsx
 *
 * Beautiful card component for displaying interest groups with gradient backgrounds.
 */

"use client";

import { ArrowUpRight, Users } from "lucide-react";
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
      className="group relative h-[300px] w-full cursor-pointer overflow-hidden rounded-[2rem] border border-white/10 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
    >
      {/* Immersive Background Gradient */}
      <div
        className={`absolute inset-0 ${gradient} opacity-100 transition-transform duration-700 group-hover:scale-105`}
      />

      {/* Subtle overlay for depth */}
      <div className="absolute inset-0 bg-black/10 mix-blend-overlay transition-opacity duration-500 group-hover:opacity-0" />

      {/* Top Pills (Floating) */}
      <div className="absolute left-5 right-5 top-5 flex items-start justify-between z-10 transition-transform duration-500 group-hover:-translate-y-1">
        <div className="rounded-full bg-white/20 px-4 py-1.5 backdrop-blur-md ring-1 ring-white/30 shadow-lg">
          <p className="text-[10px] font-extrabold uppercase tracking-widest text-white drop-shadow-md">
            {group.category || "Interest Group"}
          </p>
        </div>
        {group.code && (
          <div className="rounded-full bg-white/20 px-3 py-1.5 backdrop-blur-md ring-1 ring-white/30 shadow-lg">
            <p className="font-mono text-xs font-bold tracking-widest text-white drop-shadow-md">
              {group.code}
            </p>
          </div>
        )}
      </div>

      {/* Frosted Glass Content Box (Bottom) */}
      <div className="absolute bottom-4 left-4 right-4 z-10 rounded-3xl bg-white/10 dark:bg-black/20 p-5 backdrop-blur-xl ring-1 ring-white/30 transition-all duration-500 group-hover:-translate-y-2 group-hover:bg-white/20 dark:group-hover:bg-black/30 shadow-2xl">
        <div className="flex flex-col gap-3 text-left">
          <h3 className="font-display text-2xl font-black leading-tight text-white drop-shadow-lg line-clamp-2 min-h-[60px]">
            {group.name}
          </h3>

          <div className="flex w-full items-center justify-between">
            {group.member_count !== undefined ? (
              <div className="flex items-center gap-2 text-white/90">
                <Users className="h-5 w-5 drop-shadow-md" />
                <span className="text-sm font-semibold tracking-wide drop-shadow-md">
                  {group.member_count.toLocaleString()} members
                </span>
              </div>
            ) : (
              <div />
            )}

            {/* Action Arrow (Revealed on hover desktop, always visible on mobile) */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-black shadow-xl transition-all duration-500 opacity-100 translate-y-0 sm:opacity-0 sm:translate-y-2 group-hover:translate-y-0 group-hover:opacity-100 sm:group-hover:rotate-12">
              <ArrowUpRight className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
