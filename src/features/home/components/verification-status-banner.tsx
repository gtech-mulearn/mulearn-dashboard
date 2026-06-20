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

import { AlertCircle, CheckCircle, Clock, X, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompanyOnboardingStatus } from "@/features/auth/hooks";
import { useUserProfile } from "@/features/auth/hooks/use-session";
import { useMentorApplication } from "@/features/mentor/onboarding/hooks/use-onboarding";
import { ROLES } from "@/lib/auth/roles";
import { useCompanyBannerStore } from "@/stores/company-banner-store";
import { useMentorOverview } from "../hooks";
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
  const hasRole = (role: string) =>
    roles.some((r) => r.toLowerCase() === role.toLowerCase());

  const isCompany = hasRole(ROLES.COMPANY);
  const isMentor = hasRole(ROLES.MENTOR);
  const isEnabler = hasRole(ROLES.ENABLER);

  const { data: userProfile, isLoading: isUserProfileLoading } = useUserProfile(
    { enabled: isEnabler },
  );

  const companyStatus = useCompanyOnboardingStatus(isCompany);
  const mentorApplication = useMentorApplication(isMentor);
  const mentorOverview = useMentorOverview(isMentor);

  // Persisted dismiss state so the one-time "verified" banner shows only once
  // per company instead of on every dashboard load. Keyed by company id.
  const companyKey = String(
    (companyStatus.data as { id?: string; company_id?: string } | undefined)
      ?.id ??
      (companyStatus.data as { company_id?: string } | undefined)?.company_id ??
      "company",
  );
  const successDismissed = useCompanyBannerStore(
    (s) => s.dismissedVerifiedBanner[companyKey] ?? false,
  );
  const dismissVerifiedBanner = useCompanyBannerStore(
    (s) => s.dismissVerifiedBanner,
  );
  const handleDismissSuccess = () => dismissVerifiedBanner(companyKey);

  if (isCompany) {
    if (companyStatus.isLoading) return null;

    const data = companyStatus.data;
    const verified = data?.is_verified ?? data?.verified;
    const status = data?.status?.toLowerCase();
    const rejectionReason = data?.rejection_reason;

    const isSuccess =
      verified === true ||
      status === "approved" ||
      status === "active" ||
      status === "verified";

    if (isSuccess) {
      if (!successDismissed) {
        return (
          <div className="flex items-start gap-3 rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success">
            <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-success" />
            <div className="flex-1">
              <p className="font-semibold">Company verified successfully</p>
              <p className="mt-0.5 text-success/80">
                Your company profile has been approved. You now have full
                access.
              </p>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleDismissSuccess}
              className="text-success hover:text-success/80"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        );
      }
      return null;
    }

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
  // A mentor is considered verified if the overview API returns any active scopes
  // (same check used by the MentorHome dashboard). This is more reliable than
  // the /status/ endpoint, whose fallback defaults to "PENDING" on unexpected shapes.
  if (isMentor) {
    // If the overview is still loading, wait — don't flash the banner.
    if (mentorOverview.isLoading) return null;

    // If scopes exist the mentor is verified — no banner needed.
    const isVerifiedByScopes = (mentorOverview.data?.scopes.length ?? 0) > 0;
    if (isVerifiedByScopes) return null;

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
