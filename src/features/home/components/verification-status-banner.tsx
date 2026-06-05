"use client";

/**
 * Verification Status Banner
 *
 * 📍 src/features/home/components/verification-status-banner.tsx
 *
 * Shown on the dashboard home for unverified Company, Mentor, and Enabler users.
 * - Company: fetches live verification status from the onboarding-status API.
 * - Mentor: fetches the profile verification status.
 * - Enabler: fetches the profile verification status.
 */

import { AlertCircle, Clock, XCircle } from "lucide-react";
import { useCompanyOnboardingStatus } from "@/features/auth/hooks";
import { useUserProfile } from "@/features/auth/hooks/use-session";
import { useMentorApplication } from "@/features/mentor/onboarding/hooks/use-onboarding";
import { ROLES } from "@/lib/auth/roles";
import {
  shouldShowEnablerPendingBanner,
  shouldShowMentorPendingBanner,
} from "./verification-status-banner.logic";

interface VerificationStatusBannerProps {
  roles: string[];
}

export function VerificationStatusBanner({
  roles,
}: VerificationStatusBannerProps) {
  const isCompany = roles.includes(ROLES.COMPANY);
  const isMentor = roles.includes(ROLES.MENTOR);
  const isEnabler = roles.includes(ROLES.ENABLER);

  const { data: userProfile, isLoading: isUserProfileLoading } = useUserProfile(
    { enabled: isEnabler },
  );

  const companyStatus = useCompanyOnboardingStatus(isCompany);
  const mentorApplication = useMentorApplication(isMentor);

  // ── Company ─────────────────────────────────────────────────────
  if (isCompany) {
    if (companyStatus.isLoading) return null;

    const data = companyStatus.data;
    const verified = data?.is_verified ?? data?.verified;
    const status = data?.status?.toLowerCase();
    const rejectionReason = data?.rejection_reason;

    // Already verified — no banner needed
    if (verified === true || status === "approved" || status === "active")
      return null;

    if (status === "rejected") {
      return (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <div>
            <p className="font-semibold">Company profile rejected</p>
            {rejectionReason && (
              <p className="mt-0.5 text-destructive/80">{rejectionReason}</p>
            )}
            <p className="mt-1 text-destructive/80">
              Please update your profile and resubmit for verification.
            </p>
          </div>
        </div>
      );
    }

    // Default: pending / unknown
    return (
      <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
        <Clock className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
        <div>
          <p className="font-semibold">Verification pending</p>
          <p className="mt-0.5 text-warning/80">
            Your company profile is under review. You will receive an email once
            an admin approves your account. Some features may be limited until
            then.
          </p>
        </div>
      </div>
    );
  }

  // ── Mentor ──────────────────────────────────────────────────────
  // Hide while loading; suppress when the mentor profile is verified.
  if (isMentor) {
    const showPending = shouldShowMentorPendingBanner({
      isLoading: mentorApplication.isLoading,
      mentorApplication: mentorApplication.data,
    });

    if (showPending) {
      return (
        <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
          <div>
            <p className="font-semibold">Mentor account pending verification</p>
            <p className="mt-0.5 text-warning/80">
              Your mentor profile is awaiting admin approval. You will be
              notified once your account is verified.
            </p>
          </div>
        </div>
      );
    }
  }

  // ── Enabler ─────────────────────────────────────────────────────
  if (isEnabler) {
    const showPending = shouldShowEnablerPendingBanner({
      isLoading: isUserProfileLoading,
      userProfile,
    });

    if (!showPending) return null;

    return (
      <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 px-4 py-3 text-sm text-warning">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
        <div>
          <p className="font-semibold">Enabler account pending verification</p>
          <p className="mt-0.5 text-warning/80">
            Your enabler profile is awaiting admin approval. You will be
            notified once your account is verified.
          </p>
        </div>
      </div>
    );
  }

  return null;
}
