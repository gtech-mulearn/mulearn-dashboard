import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { UnifiedCourse } from "../schemas/courses.schemas";
import { CourseCard } from "./CourseCard";
import { CourseSkeleton } from "./CourseSkeleton";

interface CourseSectionProps {
  title: string;
  description?: string;
  courses: UnifiedCourse[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  onEnroll: (id: string) => void;
  isEnrolling: boolean;
}

export function CourseSection({
  title,
  description,
  courses,
  isLoading,
  isError,
  refetch,
  onEnroll,
  isEnrolling,
}: CourseSectionProps) {
  return (
    <section className="space-y-6 py-4">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          {title}
        </h2>
        {description && (
          <p className="text-muted-foreground text-base">{description}</p>
        )}
      </div>

      {isError ? (
        <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-8 flex flex-col items-center justify-center gap-4 text-destructive">
          <div className="flex items-center gap-2 font-semibold">
            <AlertCircle className="w-5 h-5" />
            <span>Failed to load courses</span>
          </div>
          <p className="text-sm text-destructive/80 text-center max-w-md">
            We couldn't fetch the course list at this time. Please check your
            connection or try again.
          </p>
          <Button
            variant="outline"
            onClick={refetch}
            className="border-destructive/20 hover:bg-destructive/10 text-destructive bg-background rounded-xl"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: Static loading skeletons
            <CourseSkeleton key={i} />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-muted/50 p-12 text-center">
          <p className="text-muted-foreground font-medium">
            No courses available at the moment.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onEnroll={onEnroll}
              isEnrolling={isEnrolling}
            />
          ))}
        </div>
      )}
    </section>
  );
}
