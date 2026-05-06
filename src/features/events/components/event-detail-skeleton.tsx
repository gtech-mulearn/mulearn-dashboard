import { Skeleton } from "@/components/ui/skeleton";

export function EventDetailSkeleton() {
  return (
    <div className="space-y-5 lc-fade-in">
      {/* Banner */}
      <Skeleton className="aspect-[16/9] md:aspect-[21/8] w-full rounded-2xl" />
      {/* Identity bar */}
      <div className="flex flex-wrap gap-3 rounded-2xl border border-border bg-card px-5 py-3.5">
        <Skeleton className="h-5 w-36 rounded-full" />
        <Skeleton className="h-5 w-24 rounded-full" />
        <Skeleton className="h-5 w-32 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      {/* Grid */}
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <Skeleton className="h-52 w-full rounded-2xl" />
          <Skeleton className="h-36 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
        <div className="space-y-4">
          <Skeleton className="h-72 w-full rounded-2xl" />
          <Skeleton className="h-28 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
