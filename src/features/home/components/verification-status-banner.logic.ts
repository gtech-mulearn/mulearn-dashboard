type MentorVerificationSnapshot = {
  is_verified?: boolean;
};

type EnablerVerificationSnapshot = {
  is_verified?: boolean;
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
  if (mentorApplication?.is_verified === true) return false;
  if (isLoading) return false;
  return true;
}

export function shouldShowEnablerPendingBanner({
  isLoading,
  userProfile,
}: EnablerPendingBannerInput): boolean {
  if (isLoading) return false;
  if (userProfile?.is_verified === true) return false;
  return true;
}
