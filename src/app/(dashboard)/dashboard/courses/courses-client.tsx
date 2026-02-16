"use client";

import { Separator } from "@/components/ui/separator";
import {
  CourseSection,
  useOpenGradCourses,
  useWadhwaniCourses,
} from "@/features/courses";

export default function CoursesClient() {
  const wadhwani = useWadhwaniCourses();
  const openGrad = useOpenGradCourses();

  return (
    <div className="container mx-auto px-4 py-8 space-y-10 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Learning Hub</h1>
        <p className="text-muted-foreground text-lg">
          Explore curated courses from our partners to enhance your skills and
          career readiness.
        </p>
      </div>

      <CourseSection
        title="Wadhwani Foundation"
        description="Job-readiness and soft skills courses designed to boost your employability."
        courses={wadhwani.courses}
        isLoading={wadhwani.isLoading}
        isError={wadhwani.isError}
        refetch={wadhwani.refetch}
        onEnroll={wadhwani.enroll}
        isEnrolling={wadhwani.isEnrolling}
      />

      <Separator className="my-8" />

      <CourseSection
        title="OpenGrad"
        description="Waitlist and premium courses to master new technologies."
        courses={openGrad.courses}
        isLoading={openGrad.isLoading}
        isError={openGrad.isError}
        refetch={openGrad.refetch}
        onEnroll={openGrad.enroll}
        isEnrolling={openGrad.isEnrolling}
      />
    </div>
  );
}
