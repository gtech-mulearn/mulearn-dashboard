/**
 * Interest Group Card Component
 *
 * 📍 src/features/interest-groups/components/interest-group-card.tsx
 *
 * Gradient hero with glassmorphic overlays, matching the user/campus search cards.
 */
"use client";

import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import type { InterestGroup } from "../schemas/interest-groups.schema";

type InterestGroupCardProps = {
  group: InterestGroup;
  gradient: string;
};

export function InterestGroupCard({ group, gradient }: InterestGroupCardProps) {
  const router = useRouter();
  const firstLetter = group.name.charAt(0).toUpperCase();

  return (
    <button
      type="button"
      onClick={() => router.push(`/dashboard/interest-groups/${group.id}`)}
      className="group relative aspect-[8/5] w-full cursor-pointer overflow-hidden rounded-[2rem] text-left shadow-sm ring-1 ring-black/5 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/25 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 motion-reduce:transform-none motion-reduce:transition-none"
    >
      {/* Hero: passed-in gradient with a large monogram watermark */}
      <div
        className={`absolute inset-0 ${gradient} transition-transform duration-700 group-hover:scale-105`}
      >
        <span className="absolute -bottom-8 -right-2 select-none text-[8rem] font-black leading-none text-foreground/6">
          {firstLetter}
        </span>
      </div>

      {/* Top: name + code badge */}
      <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 p-3.5">
        <h3 className="font-display line-clamp-2 text-xl font-bold leading-tight text-foreground [text-wrap:balance]">
          {group.name}
        </h3>
        {group.code && (
          <div className="flex shrink-0 items-center gap-1 rounded-full border border-border/60 bg-background/60 px-2.5 py-1 backdrop-blur-md transition-colors group-hover:border-border">
            <span className="font-display text-xs font-bold tracking-wide text-foreground">
              {group.code}
            </span>
          </div>
        )}
      </div>

      {/* Bottom: glassmorphic detail bar */}
      <div className="absolute inset-x-0 bottom-0 z-10 p-3">
        <div className="flex items-center justify-between gap-3 rounded-[1.25rem] border border-border/60 bg-background/60 p-2 shadow-lg ring-1 ring-black/5 backdrop-blur-xl">
          <div className="flex min-w-0 items-center gap-2 pl-1">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-background/70 text-xs font-black text-foreground ring-1 ring-border/60">
              {firstLetter}
            </div>
            <span className="truncate text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {group.category}
            </span>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-background px-3 py-1.5 text-xs font-semibold text-foreground shadow-sm transition-colors group-hover:bg-background/90">
            View Group
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none" />
          </div>
        </div>
      </div>
    </button>
  );
}
