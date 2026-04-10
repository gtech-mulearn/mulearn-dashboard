/**
 * Company Section Loading State
 *
 * 📍 src/app/(dashboard)/dashboard/company/loading.tsx
 */

import { Skeleton } from "@/components/ui/skeleton";

export default function CompanyLoading() {
  return (
    <div className="space-y-6 p-1">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(["a", "b", "c", "d", "e", "f"] as const).map((k) => (
          <Skeleton key={k} className="h-48 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
