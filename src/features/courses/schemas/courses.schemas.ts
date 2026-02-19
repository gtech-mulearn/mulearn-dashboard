import { z } from "zod";

// ==========================================
// Common Schemas
// ==========================================

// Base token shape
const TokenDataSchema = z.object({
  status: z.string().optional(),
  access_token: z.string().min(1, "Token is required"),
  message: z.string().optional(),
  statusCode: z.number().optional(),
});

/**
 * Handles both:
 * 1. Direct response: { access_token: "..." }
 * 2. Wrapped response: { response: { access_token: "..." } }
 */
export const IntegrationTokenSchema = z.union([
  TokenDataSchema,
  z.object({ response: TokenDataSchema }).transform((data) => data.response),
]);

export type IntegrationTokenResponse = z.infer<typeof IntegrationTokenSchema>;

export const EnrollmentResponseSchema = z.object({
  status: z.string().optional(),
  redirect_url: z.string().url().optional(),
  message: z.string().optional(),
});

// ==========================================
// Wadhwani Schemas
// ==========================================

export const WadhwaniCourseSchema = z.object({
  id: z.string().or(z.number()),
  title: z.string(),
  description: z.string().optional(),
  course_root_id: z.string().optional(),
  thumbnail: z.string().url().optional().or(z.literal("")).or(z.null()),
  language: z.string().optional(),
});

// Base shape for Wadhwani list
const WadhwaniListShape = z.object({
  status: z.string().optional(),
  // Support both "data: [...]" and "data: { courses: [...] }"
  data: z
    .array(WadhwaniCourseSchema)
    .or(z.object({ courses: z.array(WadhwaniCourseSchema) }))
    .or(z.null())
    .optional(),
  message: z.string().optional(),
});

export const WadhwaniCoursesResponseSchema = z.union([
  WadhwaniListShape,
  z.object({ response: WadhwaniListShape }).transform((val) => val.response),
]);

// ==========================================
// Wadhwani Sheet Schemas (Google Sheet)
// ==========================================

export const WadhwaniSheetCourseSchema = z.object({
  courseId: z.string().optional(),
  courseRootId: z.string().optional(),
  courseName: z.string(),
  thumbnail: z.string().optional(),
  description: z.string().optional(),
  CourseDuration: z.string().optional(),
  Karma: z.string().optional(),
  Hashtags: z.string().optional(),
});

export type WadhwaniSheetCourse = z.infer<typeof WadhwaniSheetCourseSchema>;

export const WadhwaniSheetResponseSchema = z.array(WadhwaniSheetCourseSchema);

// ==========================================
// OpenGrad Schemas
// ==========================================

export const OpenGradCourseSchema = z.object({
  id: z.string().or(z.number()),
  title: z.string(),
  description: z.string().optional(),
  website_url: z.string().url().optional(),
  lessons_count: z.number().optional(),
  image_url: z.string().url().optional().or(z.null()),
});

// Base shape for OpenGrad list
const OpenGradListShape = z.object({
  status: z.string().optional(),
  data: z
    .array(OpenGradCourseSchema)
    .or(z.object({ courses: z.array(OpenGradCourseSchema) }))
    .or(z.null())
    .optional(),
  message: z.string().optional(),
});

export const OpenGradCoursesResponseSchema = z.union([
  OpenGradListShape,
  z.object({ response: OpenGradListShape }).transform((val) => val.response),
]);

// ==========================================
// Domain Models (Unified)
// ==========================================

export const UnifiedCourseSchema = z.object({
  id: z.string(),
  source: z.enum(["wadhwani", "opengrad"]),
  title: z.string(),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  duration: z.string().optional(),
  karma: z.number().optional(),
  hashtags: z.array(z.string()).optional(),
  enrollmentId: z.string().optional(),
  lessonCount: z.number().optional(),
});

export type UnifiedCourse = z.infer<typeof UnifiedCourseSchema>;
