import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function CourseSkeleton() {
  return (
    <Card className="h-full flex flex-col overflow-hidden rounded-2xl border-gray-100 shadow-sm">
      {/* Thumbnail Skeleton */}
      <div className="relative aspect-video w-full">
        <Skeleton className="h-full w-full rounded-none" />
      </div>

      <CardHeader className="space-y-3 pb-2">
        <div className="flex justify-between">
          <Skeleton className="h-5 w-20 rounded-lg" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-6 w-3/4 rounded-md" />
      </CardHeader>

      <CardContent className="flex-grow space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
        </div>

        <div className="flex gap-2 pt-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </CardContent>

      <CardFooter className="pt-2 pb-6">
        <Skeleton className="h-11 w-full rounded-xl" />
      </CardFooter>
    </Card>
  );
}
