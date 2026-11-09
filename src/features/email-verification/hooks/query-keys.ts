export const emailVerificationKeys = {
  all: ["email-verification"] as const,
  status: () => [...emailVerificationKeys.all, "status"] as const,
};
