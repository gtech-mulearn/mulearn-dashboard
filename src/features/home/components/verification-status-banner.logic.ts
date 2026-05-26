type MentorVerificationSnapshot = {
  is_verified?: boolean;
};

interface MentorPendingBannerInput {
  isLoading: boolean;
  mentorApplication?: MentorVerificationSnapshot | null;
}

export function shouldShowMentorPendingBanner({
  isLoading,
  mentorApplication,
}: MentorPendingBannerInput): boolean {
  if (mentorApplication?.is_verified === true) return false;
  if (isLoading) return false;
  return true;
}
