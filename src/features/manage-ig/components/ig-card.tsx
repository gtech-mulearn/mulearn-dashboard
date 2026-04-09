/**
 * Interest Group Card Component
 *
 * 📍 src/features/manage-ig/components/ig-card.tsx
 *
 * Beautiful card component for displaying interest groups with gradient backgrounds.
 */

"use client";

import { ArrowRight, Users } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { InterestGroup } from "@/features/interest-groups/schemas";

type InterestGroupCardProps = {
  group: InterestGroup;
};

export function InterestGroupCard({ group }: InterestGroupCardProps) {
  return (
    <Link
      href={`/dashboard/edit-ig/${group.id}`}
      className="group relative flex flex-col justify-between overflow-hidden rounded-xl border bg-card p-4 sm:p-6 shadow-sm transition-all hover:shadow-md hover:ring-2 hover:ring-primary/20"
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <Badge>
            <p className="text-xs font-semibold uppercase tracking-wider">
              {group.category || "Interest Group"}
            </p>
          </Badge>
          {group.code && (
            <Badge variant={"outline"}>
              <p className="text-xs font-medium">{group.code}</p>
            </Badge>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold tracking-tight">{group.name}</h3>

          {group.member_count !== undefined && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{group.member_count.toLocaleString()} members</span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center text-xs font-medium text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
        <span>View Group</span>
        <ArrowRight className="ml-1 h-3 w-3 transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
