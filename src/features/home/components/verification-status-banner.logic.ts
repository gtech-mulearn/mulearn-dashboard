import { ROLES } from "@/lib/auth/roles";

// Updated to handle both old (is_verified boolean) and new (status string) shapes
type MentorVerificationSnapshot = {
  is_verified?: boolean;
  status?: "PENDING" | "APPROVED" | "REJECTED" | string;
};

// Enabler verification lives in role_verification[] returned by the user profile API.
type EnablerVerificationSnapshot = {
  role_verification?: { role: string; is_verified: boolean }[];
};

interface MentorPendingBannerInput {
  isLoading: boolean;
  mentorApplication?: MentorVerificationSnapshot | null;
}

interface EnablerPendingBannerInput {
  isLoading: boolean;
  userProfile?: EnablerVerificationSnapshot | null;
}

export function shouldShowMentorPendingBanner({
  isLoading,
  mentorApplication,
}: MentorPendingBannerInput): boolean {
  // New doc shape: status string
  if (mentorApplication?.status === "APPROVED") return false;
  // Legacy shape: boolean
  if (mentorApplication?.is_verified === true) return false;
  // No application yet
  if (!mentorApplication) return false;
  if (isLoading) return false;
  return true;
}

export function shouldShowEnablerPendingBanner({
  isLoading,
  userProfile,
}: EnablerPendingBannerInput): boolean {
  if (isLoading) return false;
  const is_verified = userProfile?.role_verification?.find(
    (v) => v.role === ROLES.ENABLER,
  )?.is_verified;
  if (is_verified === true) return false;
  return true;
}
