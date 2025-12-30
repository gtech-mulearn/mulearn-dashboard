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
    <div className="relative overflow-hidden rounded-2xl shadow-sm">
      {/* Full Banner Background */}
      <div className="relative h-40 w-full sm:h-48">
        <Image
          src="/images/profile-banner.png"
          alt=""
          fill
          className="object-cover"
          priority
        />
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />

        {/* Profile Content - Overlaid on banner */}
        <div className="absolute inset-0 flex items-end px-6 pb-4 sm:items-center sm:pb-0">
          <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            {/* Left: Avatar and Info */}
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="relative">
                <div className="h-20 w-20 overflow-hidden rounded-xl border-3 border-white/90 bg-white shadow-lg sm:h-24 sm:w-24 sm:rounded-2xl">
                  {profile.profile_pic && !imageError ? (
                    <Image
                      src={`${profile.profile_pic}?${Date.now()}`}
                      alt={profile.full_name}
                      width={96}
                      height={96}
                      className="h-full w-full object-cover"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 text-2xl font-bold text-white sm:text-3xl">
                      {profile.full_name?.charAt(0) || "?"}
                    </div>
                  )}
                </div>
                {/* Level Badge */}
                <div className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-600 text-xs font-bold text-white shadow-lg ring-2 ring-white">
                  {level}
                </div>
              </div>

              {/* Name and Details */}
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-white drop-shadow-sm sm:text-2xl">
                    {profile.full_name}
                  </h1>
                  {profile.college_code && (
                    <span className="hidden rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm sm:inline">
                      {profile.college_code}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleCopyMuid}
                  className="group flex items-center gap-1.5 text-white/80 transition-colors hover:text-white"
                >
                  <span className="font-mono text-sm">{profile.muid}</span>
                  <Copy className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
                <div className="flex items-center gap-2 pt-0.5">
                  <span
                    className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium backdrop-blur-sm ${
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
                    <span className="text-xs text-white/60">
                      Member since {memberSince}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Action Buttons */}
            {isOwnProfile && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onShare}
                  className="gap-1.5 rounded-full border-white/30 bg-white/10 text-white backdrop-blur-sm hover:bg-white/20"
                >
                  <Share2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Share</span>
                </Button>
                <Button
                  size="sm"
                  onClick={onEdit}
                  className="gap-1.5 rounded-full bg-white text-gray-900 hover:bg-white/90"
                >
                  <Pencil className="h-4 w-4" />
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
