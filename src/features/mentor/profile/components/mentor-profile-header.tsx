/**
 * Mentor Profile Header
 *
 * 📍 src/features/mentor/profile/components/mentor-profile-header.tsx
 *
 * Covers the top section of the mentor profile:
 * - Cover photo + avatar (reuses same visual treatment as learner ProfileHeader)
 * - Mentor-type badge (IG / Platform / Company / Campus)
 * - Verified / Pending status chip
 * - Mentor-since date
 * - Edit, Share, and "Switch to Learner View" buttons
 */

"use client";

import {
  BookUser,
  Building2,
  CheckCircle2,
  Clock,
  Copy,
  GraduationCap,
  Pencil,
  RefreshCw,
  Share2,
  Users,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { MentorApplication } from "@/features/mentor/onboarding/schemas";
import type { UserProfile } from "@/features/profile/schemas";

const DEFAULT_COVER = "/images/profile-banner.png";

export type MentorType = "ig" | "platform" | "company" | "campus";

export function deriveMentorType(profile: MentorApplication): MentorType {
  const tier = (profile.mentor_tier ?? "").toLowerCase();
  if (tier.includes("company")) return "company";
  if (tier.includes("campus")) return "campus";
  if (tier.includes("platform") || tier.includes("global")) return "platform";
  // Fallback: if they have preferred IGs they're an IG mentor
  if ((profile.preferred_ig_ids ?? []).length > 0) return "ig";
  return "ig";
}

const MENTOR_TYPE_CONFIG: Record<
  MentorType,
  {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }
> = {
  ig: {
    label: "IG Mentor",
    icon: BookUser,
    color: "bg-violet-500/20 text-white ring-violet-500/30",
  },
  platform: {
    label: "Platform Mentor",
    icon: Users,
    color: "bg-blue-500/20 text-white ring-blue-500/30",
  },
  company: {
    label: "Company Mentor",
    icon: Building2,
    color: "bg-amber-500/20 text-white ring-amber-500/30",
  },
  campus: {
    label: "Campus Mentor",
    icon: GraduationCap,
    color: "bg-emerald-500/20 text-white ring-emerald-500/30",
  },
};

interface MentorProfileHeaderProps {
  userProfile: UserProfile;
  mentorProfile: MentorApplication;
  onEdit?: () => void;
  onShare?: () => void;
  onSwitchToLearner?: () => void;
}

export function MentorProfileHeader({
  userProfile,
  mentorProfile,
  onEdit,
  onShare,
  onSwitchToLearner,
}: MentorProfileHeaderProps) {
  const [imageError, setImageError] = useState(false);
  const [coverError, setCoverError] = useState(false);

  // Reset errors if the profile picture or cover changes
  // biome-ignore lint/correctness/useExhaustiveDependencies: We want to trigger a reset ONLY when the URL string changes.
  useEffect(() => {
    setImageError(false);
  }, [userProfile.profile_pic]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: We want to trigger a reset ONLY when the URL string changes.
  useEffect(() => {
    setCoverError(false);
  }, [userProfile.cover_pic]);

  const mentorType = deriveMentorType(mentorProfile);
  const typeConfig = MENTOR_TYPE_CONFIG[mentorType];
  const TypeIcon = typeConfig.icon;

  const isVerified = mentorProfile.status === "APPROVED";
  const mentorSince = mentorProfile.created_at
    ? new Date(mentorProfile.created_at).getFullYear()
    : null;

  const coverSrc = useMemo(() => {
    if (!userProfile.cover_pic || coverError) return DEFAULT_COVER;
    return userProfile.cover_pic;
  }, [userProfile.cover_pic, coverError]);

  const handleCopyMuid = () => {
    navigator.clipboard.writeText(userProfile.muid);
    toast.success("MUID copied to clipboard");
  };

  return (
    <div className="relative h-56 w-full overflow-hidden rounded-2xl border shadow-sm sm:h-64 md:h-72">
      {/* Cover image */}
      <Image
        src={coverSrc}
        alt="Mentor cover"
        fill
        className="object-cover"
        priority
        unoptimized={Boolean(userProfile.cover_pic)}
        onError={() => setCoverError(true)}
        sizes="100vw"
      />

      {/* Gradient overlay */}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/80 via-black/35 to-transparent" />

      {/* Top-right: Switch to Learner View */}
      <div className="absolute right-3 top-3 z-20 flex gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={onSwitchToLearner}
          className="gap-1.5 rounded-full border-white/20 bg-black/40 px-3 text-xs text-white backdrop-blur-sm hover:bg-black/60"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Learner View</span>
        </Button>
      </div>

      {/* Bottom overlay — avatar + identity + actions */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-3 p-4 sm:flex-row sm:items-end sm:justify-between sm:gap-4 sm:p-6">
        {/* Avatar + name/meta */}
        <div className="flex min-w-0 flex-1 items-end gap-3 sm:gap-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="h-16 w-16 overflow-hidden rounded-2xl border-2 border-white/90 bg-card shadow-lg sm:h-20 sm:w-20">
              {userProfile.profile_pic && !imageError ? (
                <Image
                  src={`${userProfile.profile_pic}?${Date.now()}`}
                  alt={userProfile.full_name}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary text-2xl font-bold text-primary-foreground">
                  {userProfile.full_name?.charAt(0) || "?"}
                </div>
              )}
            </div>
          </div>

          {/* Name + meta */}
          <div className="min-w-0 flex-1 space-y-1 pb-0.5">
            <h1 className="truncate text-lg font-bold text-white drop-shadow-md sm:text-xl md:text-2xl">
              {userProfile.full_name}
            </h1>

            {/* MUID copy button */}
            <button
              type="button"
              onClick={handleCopyMuid}
              className="group flex min-w-0 items-center gap-1.5 text-white/80 transition-colors hover:text-white"
            >
              <span className="truncate text-xs drop-shadow sm:text-sm">
                {userProfile.muid}
              </span>
              <Copy className="h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
            </button>

            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-1.5">
              {/* Mentor type badge */}
              <span
                className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ring-1 backdrop-blur-sm sm:text-xs ${typeConfig.color}`}
              >
                <TypeIcon className="h-3 w-3" />
                {typeConfig.label}
              </span>

              {/* Verified / Pending */}
              {isVerified ? (
                <span className="flex items-center gap-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-medium text-white ring-1 ring-emerald-500/30 backdrop-blur-sm sm:text-xs">
                  <CheckCircle2 className="h-3 w-3" />
                  Verified
                </span>
              ) : (
                <span className="flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-[10px] font-medium text-white ring-1 ring-amber-500/30 backdrop-blur-sm sm:text-xs">
                  <Clock className="h-3 w-3" />
                  Pending
                </span>
              )}

              {/* Mentor since */}
              {mentorSince && (
                <span className="text-[10px] text-white drop-shadow sm:text-xs">
                  Mentor since {mentorSince}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex shrink-0 gap-2 self-end">
          <Button
            variant="outline"
            size="sm"
            onClick={onShare}
            className="gap-1 rounded-full border-white/30 bg-white/15 px-3 text-xs text-white backdrop-blur-sm hover:bg-white/25 sm:gap-1.5 sm:text-sm"
          >
            <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Share</span>
          </Button>
          <Button
            size="sm"
            onClick={onEdit}
            className="gap-1 rounded-full px-3 text-xs sm:gap-1.5 sm:text-sm"
          >
            <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Edit Profile</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
