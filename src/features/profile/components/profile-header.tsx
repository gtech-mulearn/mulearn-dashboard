/**
 * Profile Header Component
 *
 * 📍 src/features/profile/components/profile-header.tsx
 *
 * Premium profile header with illustration banner that fills container.
 * Profile info overlaid on the banner image.
 */

"use client";

import { Copy, Pencil, Share2 } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { UserProfile } from "../schemas";

interface ProfileHeaderProps {
  profile: UserProfile;
  isOwnProfile: boolean;
  onEdit?: () => void;
  onShare?: () => void;
}

export function ProfileHeader({
  profile,
  isOwnProfile,
  onEdit,
  onShare,
}: ProfileHeaderProps) {
  const [imageError, setImageError] = useState(false);

  const handleCopyMuid = () => {
    navigator.clipboard.writeText(profile.muid);
    toast.success("MUID copied to clipboard");
  };

  const level = profile.level ? profile.level.slice(3, 4) : "1";
  const memberSince = profile.joined?.slice(0, 4) || "";

  return (
    <div className="relative w-full max-w-full overflow-hidden rounded-2xl shadow-sm">
      {/* Full Banner Background */}
      <div className="relative h-48 w-full sm:h-52 md:h-56">
        <Image
          src="/images/profile-banner.png"
          alt=""
          fill
          className="object-cover"
          priority
        />
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-linear-to-r from-black/50 to-black/40" />

        {/* Profile Content - Overlaid on banner */}
        <div className="absolute inset-0 flex items-end p-4 sm:items-center sm:px-6">
          <div className="flex w-full max-w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
            {/* Left: Avatar and Info */}
            <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center sm:gap-4">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="h-16 w-16 overflow-hidden rounded-xl border-2 border-background/90 bg-card shadow-lg sm:h-20 sm:w-20 sm:rounded-2xl sm:border-3">
                  {profile.profile_pic && !imageError ? (
                    <Image
                      src={`${profile.profile_pic}?${Date.now()}`}
                      alt={profile.full_name}
                      width={80}
                      height={80}
                      className="h-full w-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-indigo-500 to-purple-600 text-xl font-bold text-white sm:text-2xl">
                      {profile.full_name?.charAt(0) || "?"}
                    </div>
                  )}
                </div>
                {/* Level Badge */}
                <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-linear-to-br from-violet-500 to-purple-600 text-[10px] font-bold text-white shadow-lg ring-2 ring-white sm:h-7 sm:w-7 sm:text-xs">
                  {level}
                </div>
              </div>

              {/* Name and Details */}
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex min-w-0 items-center gap-2">
                  <h1 className="truncate font-bold text-secondary drop-shadow-md sm:text-xl md:text-2xl">
                    {profile.full_name}
                  </h1>
                  {profile.college_code && (
                    <span className="hidden shrink-0 rounded-full bg-background/20 px-2 py-0.5 text-xs font-medium text-secondary backdrop-blur-sm sm:inline">
                      {profile.college_code}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleCopyMuid}
                  className="group flex min-w-0 items-center gap-1.5 text-primary-foreground/90 transition-colors hover:text-primary-foreground"
                >
                  <span className="truncate text-muted text-xs sm:text-sm">
                    {profile.muid}
                  </span>
                  <Copy className="h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 sm:h-3.5 sm:w-3.5" />
                </button>
                <div className="flex min-w-0 flex-wrap items-center gap-1.5 pt-0.5 sm:gap-2">
                  <span
                    className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium backdrop-blur-sm sm:text-xs ${
                      profile.is_public
                        ? "bg-emerald-500/20 text-emerald-100"
                        : "bg-amber-500/20 text-amber-100"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        profile.is_public ? "bg-emerald-400" : "bg-amber-400"
                      }`}
                    />
                    {profile.is_public ? "Public" : "Private"}
                  </span>
                  {memberSince && (
                    <span className="shrink-0 text-[10px] text-white/70 sm:text-xs">
                      Member since {memberSince}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Action Buttons */}
            {isOwnProfile && (
              <div className="flex shrink-0 gap-2 self-end sm:self-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onShare}
                  className="gap-1 rounded-full border-secondary/30 bg-secondary/10 px-3 text-xs text-secondary backdrop-blur-sm hover:bg-secondary/20 sm:gap-1.5 sm:text-sm"
                >
                  <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Share</span>
                </Button>
                <Button
                  size="sm"
                  onClick={onEdit}
                  className="gap-1 rounded-full bg-background px-3 text-xs text-foreground hover:bg-background/90 sm:gap-1.5 sm:text-sm"
                >
                  <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Edit Profile</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
