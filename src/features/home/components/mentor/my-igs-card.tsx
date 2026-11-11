"use client";

import { Users } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useTaskIgDropdown } from "@/features/mentor/tasks/hooks/use-mentor-tasks";

const _no403Retry = (failureCount: number, error: unknown) => {
  if (
    error instanceof Error &&
    "status" in error &&
    (error as { status: number }).status === 403
  )
    return false;
  return failureCount < 2;
};

export function MyIgsCard() {
  const { data: igRoles, isLoading, isError } = useTaskIgDropdown();

  return (
    <Card className="rounded-2xl border bg-card shadow-sm">
      <CardHeader className="px-5 py-4">
        <div className="flex flex-row items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10">
            <Users className="size-4 text-primary" />
          </div>
          <CardTitle className="text-base font-bold text-foreground">
            My Interest Groups
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0">
        {isLoading ? (
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
        ) : isError ? (
          <p className="text-sm text-muted-foreground">Could not load IGs.</p>
        ) : !igRoles || igRoles.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No IGs linked yet.{" "}
            <Link
              href="/dashboard/mentor"
              className="underline hover:text-foreground transition-colors"
            >
              Update your preferred IGs.
            </Link>
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {igRoles.map((r) => (
              <Link
                key={r.id}
                href={`/dashboard/interest-groups/${r.id}`}
                className="inline-flex items-center justify-center rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer shadow-sm"
              >
                {r.name}
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
