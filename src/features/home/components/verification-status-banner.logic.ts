// Updated to handle both old (is_verified boolean) and new (status string) shapes
type MentorVerificationSnapshot = {
  is_verified?: boolean;
  status?: "PENDING" | "APPROVED" | "REJECTED" | string;
};

interface MentorPendingBannerInput {
  isLoading: boolean;
  mentorApplication?: MentorVerificationSnapshot | null;
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
