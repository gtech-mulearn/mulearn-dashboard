type MentorVerificationSnapshot = {
  is_verified?: boolean;
};

// Enabler verification lives in role_verification[] returned by the user profile API.
// There is no top-level is_verified for Enabler — we read it from the array,
// mirroring how Mentor reads its own is_verified from the dedicated onboarding API.
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
  if (mentorApplication?.is_verified === true) return false;
  if (isLoading) return false;
  return true;
}

export function shouldShowEnablerPendingBanner({
  isLoading,
  userProfile,
}: EnablerPendingBannerInput): boolean {
  if (isLoading) return false;
  const is_verified = userProfile?.role_verification?.find(
    (v) => v.role === "Enabler",
  )?.is_verified;
  if (is_verified === true) return false;
  return true;
}
