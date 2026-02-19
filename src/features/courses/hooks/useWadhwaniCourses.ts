import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  enrollWadhwaniUser,
  fetchWadhwaniCourses,
  fetchWadhwaniSheetData,
  fetchWadhwaniToken,
} from "../api/courses.api";
import type { UnifiedCourse } from "../schemas/courses.schemas";

export const useWadhwaniCourses = () => {
  const sheetQuery = useQuery({
    queryKey: ["wadhwani", "sheet"],
    queryFn: fetchWadhwaniSheetData,
    staleTime: 1000 * 60 * 15,
  });

  const tokenQuery = useQuery({
    queryKey: ["wadhwani", "token"],
    queryFn: fetchWadhwaniToken,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const coursesQuery = useQuery({
    queryKey: ["wadhwani", "courses", tokenQuery.data?.access_token],
    queryFn: () =>
      fetchWadhwaniCourses(tokenQuery.data?.access_token as string),
    enabled: !!tokenQuery.data?.access_token,
    staleTime: 1000 * 60 * 15,
    retry: 1,
  });

  const apiCourseMap = new Map<string, string>();
  const apiCourses = coursesQuery.data?.data;
  if (apiCourses) {
    const list = Array.isArray(apiCourses) ? apiCourses : apiCourses.courses;
    for (const c of list) {
      if (c.course_root_id) {
        apiCourseMap.set(c.title, c.course_root_id);
      }
    }
  }

  const courses: UnifiedCourse[] = (sheetQuery.data ?? []).map((sheet) => {
    const karma = sheet.Karma ? Number.parseInt(sheet.Karma, 10) : undefined;
    const hashtags = sheet.Hashtags
      ? sheet.Hashtags.split(",")
          .map((h) => h.trim())
          .filter(Boolean)
      : undefined;

    return {
      id: sheet.courseId || sheet.courseName,
      source: "wadhwani" as const,
      title: sheet.courseName,
      description: sheet.description,
      imageUrl: sheet.thumbnail || undefined,
      duration: sheet.CourseDuration || undefined,
      karma: Number.isNaN(karma) ? undefined : karma,
      hashtags,
      enrollmentId:
        apiCourseMap.get(sheet.courseName) || sheet.courseRootId || undefined,
    };
  });

  const enrollMutation = useMutation({
    mutationFn: async (courseRootId: string) => {
      if (!tokenQuery.data?.access_token) {
        const result = await tokenQuery.refetch();
        if (!result.data?.access_token) {
          throw new Error("Please log in to enroll in courses");
        }
        return enrollWadhwaniUser(result.data.access_token, courseRootId);
      }
      return enrollWadhwaniUser(tokenQuery.data.access_token, courseRootId);
    },
    onSuccess: (data) => {
      if (data.redirect_url) {
        window.open(data.redirect_url, "_blank");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to enroll. Please try again.");
    },
  });

  return {
    courses,
    isLoading: sheetQuery.isLoading,
    isError: sheetQuery.isError,
    error: sheetQuery.error,
    refetch: () => {
      sheetQuery.refetch();
      tokenQuery.refetch();
      coursesQuery.refetch();
    },
    enroll: enrollMutation.mutate,
    isEnrolling: enrollMutation.isPending,
  };
};
