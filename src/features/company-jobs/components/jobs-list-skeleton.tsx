import { Skeleton } from "@/components/ui/skeleton";

export function JobsListSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {(["a", "b", "c", "d", "e", "f"] as const).map((k) => (
        <div
          key={k}
          className="rounded-xl border border-border bg-card p-5 space-y-4"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20 rounded-md" />
            <Skeleton className="h-6 w-20 rounded-md" />
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        </div>
      ))}
    </div>
  );
}
