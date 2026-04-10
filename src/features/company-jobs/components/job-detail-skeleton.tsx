import { Skeleton } from "@/components/ui/skeleton";

export function JobDetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Back button */}
      <Skeleton className="h-9 w-28" />

      {/* Header */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-20" />
          </div>
        </div>

        {/* Details grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-4 border-t border-border">
          {(["a", "b", "c", "d"] as const).map((k) => (
            <div key={k} className="space-y-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-32" />
            </div>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-3">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>

      {/* Rules */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-3">
        <Skeleton className="h-5 w-40" />
        <div className="space-y-2">
          {(["a", "b", "c"] as const).map((k) => (
            <Skeleton key={k} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
