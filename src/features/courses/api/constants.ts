/**
 * Placeholder metadata for courses until a backend source or formal config is available.
 * Maps Course ID (or identifier) to additional display details.
 */

export interface CourseMetadata {
  duration: string;
  karma: number;
  hashtags: string[];
}

export const WADHWANI_COURSE_METADATA: Record<string, CourseMetadata> = {
  "english-communication": {
    duration: "4 Weeks",
    karma: 200,
    hashtags: ["#communication", "#softskills", "#wadhwani"],
  },
  "job-readiness": {
    duration: "6 Weeks",
    karma: 400,
    hashtags: ["#jobs", "#career", "#wadhwani"],
  },
};

export const OPENGRAD_COURSE_METADATA: Record<string, CourseMetadata> = {
  "marketing-101": {
    duration: "2 Weeks",
    karma: 100,
    hashtags: ["#marketing", "#opengrad"],
  },
};
