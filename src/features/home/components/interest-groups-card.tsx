import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Layers, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { InterestGroupListItem } from "../schemas";

type InterestGroupsCardProps = {
  groups: InterestGroupListItem[];
  isLoading?: boolean;
  category: string;
};

export function InterestGroupsCard({
  groups,
  isLoading,
  category,
}: InterestGroupsCardProps) {
  const visibleGroups = groups.slice(0, 5);

  return (
    <Card className="overflow-hidden rounded-2xl border-none bg-card shadow-sm">
      <CardHeader className="flex-row items-center justify-between border-b border-border/40  px-6 py-4">
        <div className="flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg font-bold">Interest Groups</CardTitle>
        </div>
        <Link
          className="group flex items-center gap-1.5 text-sm font-semibold text-primary transition-colors hover:text-primary/80"
          href="/dashboard/interestgroups"
        >
          View all
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </CardHeader>

      <CardContent className="p-6">
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            Curated for{" "}
            <span className="font-semibold text-foreground capitalize">
              {category}
            </span>{" "}
            track
          </p>
        </div>

        <div className="space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="flex gap-1">
                <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:-0.3s]" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40 [animation-delay:-0.15s]" />
                <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/40" />
              </div>
            </div>
          ) : null}

          {visibleGroups.length === 0 && !isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
              <div className="rounded-full bg-muted p-3">
                <Users className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                No interest groups available yet.
              </p>
            </div>
          ) : null}

          {visibleGroups.map((group) => (
            <Link
              className="group flex w-full items-center justify-between rounded-xl border border-transparent p-3 transition-all hover:shadow-sm"
              href={`/dashboard/interestgroups/${group.id}`}
              key={group.id}
            >
              <div className="flex items-center gap-4">
                <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-card shadow-sm ring-1 ring-foreground/5 transition-transform group-hover:scale-105">
                  <Image
                    alt={group.name}
                    className="h-full w-full object-cover p-1"
                    height={48}
                    width={48}
                    src="/Group.png"
                  />
                </div>
                <div className="space-y-0.5">
                  <p className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {group.name}
                  </p>
                  {group.category ? (
                    <p className="text-xs font-medium text-muted-foreground">
                      {group.category}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background text-muted-foreground opacity-0 shadow-sm transition-all group-hover:opacity-100">
                <ArrowRight className="h-4 w-4" />
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
