import { ArrowRight, Layers } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import type { InterestGroupListItem } from "../schemas";

type InterestGroupsCardProps = {
  groups: InterestGroupListItem[];
  isLoading?: boolean;
};

// TODO: per-interest-group dot colors are a meaningful categorical palette — leave as-is
const DOT_COLORS = [
  "#4F46E5",
  "#7C3AED",
  "#3B82F6",
  "#F59E0B",
  "#EC4899",
  "#06B6D4",
];

export function InterestGroupsCard({
  groups,
  isLoading,
}: InterestGroupsCardProps) {
  const visible = groups.slice(0, 6);
  return (
    <div className="h-full overflow-hidden rounded-2xl border bg-card shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
            <Layers className="size-4 text-primary" />
          </div>
          <span className="text-base font-bold text-foreground">
            Interest Groups
          </span>
        </div>
        <Link
          href="/dashboard/interest-groups"
          className="group flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          Browse
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
      {/* Content */}
      <div className="px-5 pb-5">
        {isLoading ? (
          <div className="space-y-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-9 w-full rounded-lg" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No interest groups available.
          </p>
        ) : (
          <div className="space-y-2">
            {visible.map((group, index) => {
              const dot = DOT_COLORS[index % DOT_COLORS.length];
              const num = String(index + 1).padStart(2, "0");
              return (
                <Link
                  key={group.id}
                  href={`/dashboard/interest-groups/${group.id}`}
                  className="-mx-1 flex items-center gap-3 rounded-lg border-b border-border px-1 py-3 last:border-b-0 transition-colors hover:bg-muted/40"
                >
                  <span className="w-5 shrink-0 text-xs font-medium text-muted-foreground">
                    {num}
                  </span>
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: dot }}
                  />
                  <span className="flex-1 truncate text-sm font-medium text-foreground">
                    {group.name}
                  </span>
                  {group.category ? (
                    <span className="shrink-0 rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {group.category}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
