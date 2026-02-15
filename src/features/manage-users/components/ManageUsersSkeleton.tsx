"use client";

import { Skeleton } from "@/components/ui/skeleton";

export function ManageUsersSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-11 w-full" />
      <Skeleton className="h-11 w-full" />
      <Skeleton className="h-11 w-full" />
      <Skeleton className="h-11 w-full" />
      <Skeleton className="h-11 w-full" />
    </div>
  );
}
