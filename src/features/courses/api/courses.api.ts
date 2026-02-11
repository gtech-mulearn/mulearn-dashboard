import { apiClient } from "@/api/client";
import { endpoints } from "@/api/endpoints";
import {
  EnrollmentResponseSchema,
  type IntegrationTokenResponse,
  IntegrationTokenSchema,
  OpenGradCoursesResponseSchema,
  WadhwaniCoursesResponseSchema,
} from "../schemas/courses.schemas";

// ==========================================
// Wadhwani API
// ==========================================

export const fetchWadhwaniToken =
  async (): Promise<IntegrationTokenResponse> => {
    return apiClient.post(
      endpoints.integrations.wadhwani.token,
      {},
      IntegrationTokenSchema,
    );
  };

export const fetchWadhwaniCourses = async (token: string) => {
  return apiClient.post(
    endpoints.integrations.wadhwani.courses,
    { token },
    WadhwaniCoursesResponseSchema,
  );
};

export const enrollWadhwaniUser = async (
  token: string,
  courseRootId: string,
) => {
  return apiClient.post(
    endpoints.integrations.wadhwani.enroll,
    { token, course_root_id: courseRootId },
    EnrollmentResponseSchema,
  );
};

// ==========================================
// OpenGrad API
// ==========================================

export const fetchOpenGradToken =
  async (): Promise<IntegrationTokenResponse> => {
    return apiClient.post(
      endpoints.integrations.openGrad.token,
      {},
      IntegrationTokenSchema,
    );
  };

export const fetchOpenGradCourses = async (token: string) => {
  return apiClient.post(
    endpoints.integrations.openGrad.courses,
    { token },
    OpenGradCoursesResponseSchema,
  );
};

export const enrollOpenGradUser = async (token: string, courseId: string) => {
  return apiClient.post(
    endpoints.integrations.openGrad.enroll,
    { token, course_id: courseId },
    EnrollmentResponseSchema,
  );
};
