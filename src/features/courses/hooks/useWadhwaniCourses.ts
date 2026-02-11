import { useMutation, useQuery } from "@tanstack/react-query";
import { WADHWANI_COURSE_METADATA } from "../api/constants";
import {
  enrollWadhwaniUser,
  fetchWadhwaniCourses,
  fetchWadhwaniToken,
} from "../api/courses.api";
import type { UnifiedCourse } from "../schemas/courses.schemas";

export const useWadhwaniCourses = () => {
  const tokenQuery = useQuery({
    queryKey: ["wadhwani", "token"],
    queryFn: fetchWadhwaniToken,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const coursesQuery = useQuery({
    queryKey: ["wadhwani", "courses", tokenQuery.data?.access_token],
    queryFn: () =>
      fetchWadhwaniCourses(tokenQuery.data?.access_token as string),
    enabled: !!tokenQuery.data?.access_token,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });

  const courses: UnifiedCourse[] = coursesQuery.data?.data
    ? (Array.isArray(coursesQuery.data.data)
        ? coursesQuery.data.data
        : coursesQuery.data.data.courses
      ).map((course) => {
        const meta = WADHWANI_COURSE_METADATA[String(course.id)] || {
          duration: "Self-Paced",
          karma: 0,
          hashtags: ["#wadhwani"],
        };

        return {
          id: String(course.id),
          source: "wadhwani",
          title: course.title,
          description: course.description,
          imageUrl: course.thumbnail || undefined,
          duration: meta.duration,
          karma: meta.karma,
          hashtags: meta.hashtags,
          enrollmentId: course.course_root_id,
        };
      })
    : [];

  const enrollMutation = useMutation({
    mutationFn: async (courseRootId: string) => {
      if (!tokenQuery.data?.access_token) throw new Error("No token available");
      return enrollWadhwaniUser(tokenQuery.data.access_token, courseRootId);
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
