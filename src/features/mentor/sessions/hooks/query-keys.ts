export const STUDENT_REQUESTS_KEYS = {
  all: ["student-requests"] as const,
  my: () => [...STUDENT_REQUESTS_KEYS.all, "my"] as const,
  incoming: () => [...STUDENT_REQUESTS_KEYS.all, "incoming"] as const,
};
