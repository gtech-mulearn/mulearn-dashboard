import { useMutation, useQuery } from "@tanstack/react-query";
import { OPENGRAD_COURSE_METADATA } from "../api/constants";
import {
  enrollOpenGradUser,
  fetchOpenGradCourses,
  fetchOpenGradToken,
} from "../api/courses.api";
import type { UnifiedCourse } from "../schemas/courses.schemas";

export const useOpenGradCourses = () => {
  const tokenQuery = useQuery({
    queryKey: ["opengrad", "token"],
    queryFn: fetchOpenGradToken,
    staleTime: 1000 * 60 * 5,
  });

  const coursesQuery = useQuery({
    queryKey: ["opengrad", "courses", tokenQuery.data?.access_token],
    queryFn: () =>
      fetchOpenGradCourses(tokenQuery.data?.access_token as string),
    enabled: !!tokenQuery.data?.access_token,
    staleTime: 1000 * 60 * 15,
  });

  const courses: UnifiedCourse[] = coursesQuery.data?.data
    ? (Array.isArray(coursesQuery.data.data)
        ? coursesQuery.data.data
        : coursesQuery.data.data.courses
      ).map((course) => {
        const meta = OPENGRAD_COURSE_METADATA[String(course.id)] || {
          duration: "Flexible",
          karma: 0,
          hashtags: ["#opengrad"],
        };

        return {
          id: String(course.id),
          source: "opengrad",
          title: course.title,
          description: course.description,
          imageUrl: course.image_url || undefined,
          enrollmentId: String(course.id),
          lessonCount: course.lessons_count,
          duration: meta.duration,
          karma: meta.karma,
          hashtags: meta.hashtags,
        };
      })
    : [];

  const enrollMutation = useMutation({
    mutationFn: async (courseId: string) => {
      if (!tokenQuery.data?.access_token) throw new Error("No token available");
      return enrollOpenGradUser(tokenQuery.data.access_token, courseId);
    },
    onSuccess: (data) => {
      if (data.redirect_url) {
        window.open(data.redirect_url, "_blank");
      }
    },
  });

  return {
    courses,
    isLoading: tokenQuery.isLoading || coursesQuery.isLoading,
    isError: tokenQuery.isError || coursesQuery.isError,
    error: tokenQuery.error || coursesQuery.error,
    refetch: () => {
      tokenQuery.refetch();
      coursesQuery.refetch();
    },
    enroll: enrollMutation.mutate,
    isEnrolling: enrollMutation.isPending,
  };
};
