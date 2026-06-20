/**
 * Interest Group Card Component
 *
 * 📍 src/features/interest-groups/components/interest-group-card.tsx
 *
 * Beautiful card component for displaying interest groups with gradient backgrounds.
 */

"use client";

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
      onClick={() => router.push(`/dashboard/interest-groups/${group.id}`)}
      className="group relative h-[250px] sm:h-[280px] md:h-[300px] w-full cursor-pointer overflow-hidden rounded-[2rem] border border-card/10 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
    >
      <div
        className={`absolute inset-0 ${gradient} opacity-100 transition-transform duration-700 group-hover:scale-105`}
      />

      <div className="absolute inset-0 bg-foreground/10 mix-blend-overlay transition-opacity duration-500 group-hover:opacity-0" />

      <div className="absolute left-4 right-4 top-4 sm:left-5 sm:right-5 sm:top-5 flex items-start justify-between gap-2 z-10 transition-transform duration-500 group-hover:-translate-y-1">
        <div className="min-w-0 rounded-full bg-muted/80 px-3 py-1 sm:px-4 sm:py-1.5 shadow-md">
          <p className="truncate text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest">
            {group.category}
          </p>
        </div>
        {group.code && (
          <div className="shrink-0 rounded-full bg-muted/80 px-2 py-1 sm:px-3 sm:py-1.5 shadow-md">
            <p className="text-[9px] sm:text-xs font-bold tracking-widest">
              {group.code}
            </p>
          </div>
        )}
      </div>

      <div className="absolute bottom-3 left-4 right-4 sm:bottom-4 sm:p-5 p-4 transition-all duration-500 group-hover:-translate-y-2">
        <div className="flex flex-col gap-2 sm:gap-3 text-left">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-black text-primary-foreground line-clamp-2">
            {group.name}
          </h3>
        </div>
      </div>
    </button>
  );
}
