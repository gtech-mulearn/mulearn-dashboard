/**
 * Profile Header Component
 *
 * 📍 src/features/profile/components/profile-header.tsx
 *
 * Full-bleed cover image fills the entire card; avatar, name, meta, and
 * action buttons overlay the image. A bottom-anchored gradient keeps the
 * text readable across any cover photo.
 */

"use client";

import {
  Copy,
  Loader2,
  Pencil,
  PencilLine,
  RefreshCw,
  Share2,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useId, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { COVER_PIC_MAX_BYTES } from "../api";
import type { UserProfile } from "../schemas";

const DEFAULT_COVER_SRC = "/images/profile-banner.png";

interface ProfileHeaderProps {
  profile: UserProfile;
  isOwnProfile: boolean;
  onEdit?: () => void;
  onShare?: () => void;
  /** Upload handler — receives validated File. Must throw on failure. */
  onUploadCover?: (file: File) => Promise<unknown>;
  /** Delete handler — must throw on failure. */
  onDeleteCover?: () => Promise<unknown>;
  /** True while a cover mutation is in flight (disables controls + shows spinner). */
  isCoverPending?: boolean;
  onSwitchToMentor?: () => void;
}

export function ProfileHeader({
  profile,
  isOwnProfile,
  onEdit,
  onShare,
  onUploadCover,
  onDeleteCover,
  isCoverPending = false,
  onSwitchToMentor,
}: ProfileHeaderProps) {
  const [imageError, setImageError] = useState(false);
  const [coverError, setCoverError] = useState(false);
  const [coverVersion, setCoverVersion] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fileInputId = useId();

  const handleCopyMuid = () => {
    navigator.clipboard.writeText(profile.muid);
    toast.success("MUID copied to clipboard");
  };

  const level = profile.level ? profile.level.slice(3, 4) : "1";
  const memberSince = profile.joined?.slice(0, 4) || "";

  const coverSrc = useMemo(() => {
    if (!profile.cover_pic || coverError) return DEFAULT_COVER_SRC;
    return `${profile.cover_pic}?v=${coverVersion}`;
  }, [profile.cover_pic, coverError, coverVersion]);

  const hasCustomCover = Boolean(profile.cover_pic) && !coverError;
  const showCoverControls = isOwnProfile && Boolean(onUploadCover);

  const handlePickCover = () => {
    if (isCoverPending) return;
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file || !onUploadCover) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file (PNG, JPG, GIF, or WebP).");
      return;
    }
    if (file.size > COVER_PIC_MAX_BYTES) {
      toast.error("Cover image must be under 5 MB.");
      return;
    }

    try {
      await onUploadCover(file);
      setCoverError(false);
      setCoverVersion((v) => v + 1);
    } catch {
      // Mutation hook surfaces the toast.
    }
  };

  const handleDeleteCover = async () => {
    if (!onDeleteCover || isCoverPending) return;
    if (!window.confirm("Remove your cover photo?")) return;
    try {
      await onDeleteCover();
      setCoverVersion((v) => v + 1);
    } catch {
      // Mutation hook surfaces the toast.
    }
  };

  return (
    <div className="relative h-56 w-full max-w-full overflow-hidden rounded-2xl border shadow-sm sm:h-64 md:h-72">
      {/* ── Cover image (full bleed) ── */}
      <Image
        key={coverSrc}
        src={coverSrc}
        alt={hasCustomCover ? `${profile.full_name}'s cover photo` : ""}
        fill
        className="object-cover"
        priority
        onError={() => setCoverError(true)}
        sizes="100vw"
      />

      {/* Readability gradient — minute at top, deeper at bottom where text sits */}
      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/75 via-black/30 to-transparent" />

      {/* Top-left: Switch to Mentor View */}
      {onSwitchToMentor && (
        <div className="absolute left-3 top-3 z-20 flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={onSwitchToMentor}
            className="gap-1.5 rounded-full border-white/20 bg-black/40 px-3 text-xs text-white backdrop-blur-sm hover:bg-black/60"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Mentor View</span>
          </Button>
        </div>
      )}

      {/* Cover edit control — own profile only, floating top-right */}
      {showCoverControls && (
        <>
          <input
            ref={fileInputRef}
            id={fileInputId}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            aria-label="Upload cover photo"
            data-testid="cover-pic-input"
          />
          {hasCustomCover ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  disabled={isCoverPending}
                  aria-label="Edit cover photo"
                  className="absolute right-3 top-3 z-20 h-8 w-8 rounded-lg bg-background/90 text-foreground shadow-sm backdrop-blur-sm hover:bg-background"
                  data-testid="cover-pic-menu"
                >
                  {isCoverPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <PencilLine className="h-4 w-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem
                  onSelect={handlePickCover}
                  data-testid="cover-pic-change"
                >
                  <PencilLine className="mr-2 h-4 w-4" />
                  Change cover
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={handleDeleteCover}
                  className="text-destructive focus:text-destructive"
                  data-testid="cover-pic-remove"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Remove cover
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              type="button"
              size="icon"
              variant="secondary"
              onClick={handlePickCover}
              disabled={isCoverPending}
              aria-label="Add cover photo"
              className="absolute right-3 top-3 z-20 h-8 w-8 rounded-lg bg-background/90 text-foreground shadow-sm backdrop-blur-sm hover:bg-background"
              data-testid="cover-pic-add"
            >
              {isCoverPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <PencilLine className="h-4 w-4" />
              )}
            </Button>
          )}
        </>
      )}

      {/* ── Overlay content (avatar + identity + actions) ── */}
      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-3 p-4 sm:flex-row sm:items-end sm:justify-between sm:gap-4 sm:p-6">
        {/* Avatar + name */}
        <div className="flex min-w-0 flex-1 items-end gap-3 sm:gap-4">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="h-16 w-16 overflow-hidden rounded-2xl border-2 border-white/90 bg-card shadow-lg sm:h-20 sm:w-20 sm:border-3">
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
                <div className="flex h-full w-full items-center justify-center bg-primary text-2xl font-bold text-primary-foreground">
                  {profile.full_name?.charAt(0) || "?"}
                </div>
              )}
            </div>
            {/* Level badge */}
            <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-brand-purple text-[10px] font-bold text-primary-foreground shadow-md ring-2 ring-white sm:h-7 sm:w-7 sm:text-xs">
              {level}
            </div>
          </div>

          {/* Name + meta */}
          <div className="min-w-0 flex-1 space-y-0.5 pb-0.5">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <h1 className="truncate text-lg font-bold text-white drop-shadow-md sm:text-xl md:text-2xl">
                {profile.full_name}
              </h1>
              {profile.college_code && (
                <span className="hidden shrink-0 rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm sm:inline">
                  {profile.college_code}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleCopyMuid}
              className="group flex min-w-0 items-center gap-1.5 text-white/85 transition-colors hover:text-white"
            >
              <span className="truncate text-xs drop-shadow sm:text-sm">
                {profile.muid}
              </span>
              <Copy className="h-3 w-3 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 sm:h-3.5 sm:w-3.5" />
            </button>

            <div className="flex min-w-0 flex-wrap items-center gap-1.5 pt-0.5 sm:gap-2">
              <span
                className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm sm:text-xs ${
                  profile.is_public ? "bg-success/40" : "bg-warning/40"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    profile.is_public ? "bg-success" : "bg-warning"
                  }`}
                />
                {profile.is_public ? "Public" : "Private"}
              </span>
              {memberSince && (
                <span className="shrink-0 text-[10px] text-white/80 drop-shadow sm:text-xs">
                  Member since {memberSince}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        {isOwnProfile && (
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
              variant="default"
              className="gap-1 rounded-full px-3 text-xs sm:gap-1.5 sm:text-sm"
            >
              <Pencil className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Edit Profile</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
