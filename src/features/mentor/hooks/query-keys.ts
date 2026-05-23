export const mentorKeys = {
  all: ["mentor"] as const,
  availability: () => [...mentorKeys.all, "availability"] as const,
};
