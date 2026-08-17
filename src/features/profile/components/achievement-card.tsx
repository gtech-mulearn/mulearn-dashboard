/**
 * Achievement Card Component
 *
 * 📍 src/features/profile/components/achievement-card.tsx
 *
 * Clean card matching the reference design:
 *   – Large circular icon centered at top
 *   – Title + description centred in the body
 *   – Issue VC / View VC button pinned to the footer
 *
 * The whole card is clickable and opens a detail modal — the VC modal for
 * QSeverse-linked achievements (same as the footer button), or a read-only
 * detail view (full description) for directly-issued, non-VC achievements.
 */

"use client";

import { Award } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { resolveMediaUrl } from "@/lib/utils";
import type { UserAchievement } from "../schemas";
import { AchievementDetailModal } from "./achievement-detail-modal";
import { IssueVCModal } from "./issue-vc-modal";

interface AchievementCardProps {
  achievement: UserAchievement;
  muid: string;
  userName: string;
  userEmail?: string;
  isOwnProfile: boolean;
  onAchievementUpdate?: () => void;
}

export function AchievementCard({
  achievement,
  muid,
  userName,
  userEmail,
  isOwnProfile,
  onAchievementUpdate,
}: AchievementCardProps) {
  const [showModal, setShowModal] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  const { achievement: achievementData, vc_url } = achievement;

  // Only QSeverse-linked achievements (i.e. created from a QSeverse credential
  // template) support Verifiable Credentials. Directly-issued achievements
  // have no VC to issue or view — show the badge only.
  const isQseverseLinked = !!achievementData.template_id;

  const iconUrl = achievementData.icon_url || achievementData.icon || "";
  const resolvedImageSrc = resolveMediaUrl(iconUrl);

  // A visitor viewing someone else's profile may only open the VC modal once
  // a credential actually exists (same rule as the footer button below) —
  // they should never be able to trigger someone else's VC issuance flow.
  const canOpenVcModal = isQseverseLinked && (isOwnProfile || !!vc_url);
  // Directly-issued (non-VC) achievements are just a read-only detail view —
  // safe to open for anyone.
  const canOpenDetailModal = !isQseverseLinked;
  const isClickable = canOpenVcModal || canOpenDetailModal;

  const handleCardClick = () => {
    if (canOpenVcModal) setShowModal(true);
    else if (canOpenDetailModal) setDetailOpen(true);
  };

  return (
    <>
      {/* biome-ignore lint/a11y/useAriaPropsSupportedByRole: role/aria-label are conditional on isClickable, resolved at runtime */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: interactivity is conditional on isClickable, resolved at runtime */}
      <div
        className={`group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${isClickable ? "cursor-pointer" : ""}`}
        role={isClickable ? "button" : undefined}
        tabIndex={isClickable ? 0 : undefined}
        onClick={isClickable ? handleCardClick : undefined}
        onKeyDown={
          isClickable
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleCardClick();
                }
              }
            : undefined
        }
        aria-label={
          isClickable
            ? `View details for ${achievementData.achievement_name}`
            : undefined
        }
      >
        {/* ── Body ─────────────────────────────────────────────── */}
        <div className="flex flex-1 flex-col items-center px-6 pt-9 pb-6">
          {/* Circular icon */}
          <div className="mb-5 h-36 w-36 shrink-0 overflow-hidden rounded-full border-2 border-border/60 bg-muted shadow-sm ring-4 ring-primary/5 transition-all duration-300 group-hover:ring-primary/15 group-hover:shadow-md">
            {resolvedImageSrc ? (
              <div className="relative h-full w-full">
                <Image
                  src={resolvedImageSrc}
                  alt={achievementData.achievement_name}
                  fill
                  className="object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <Award className="h-12 w-12 text-muted-foreground/60" />
              </div>
            )}
          </div>

          {/* Title + description */}
          <div className="flex w-full flex-col items-center gap-2">
            <h2 className="text-center text-lg font-semibold leading-snug text-foreground line-clamp-2">
              {achievementData.achievement_name}
            </h2>
            {achievementData.description && (
              <p className="text-center text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                {achievementData.description}
              </p>
            )}
          </div>
        </div>

        {/* ── Footer ───────────────────────────────────────────── */}
        {isQseverseLinked && (isOwnProfile || (!isOwnProfile && vc_url)) && (
          <div className="flex justify-center px-6 pb-6 pt-2">
            {isOwnProfile ? (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowModal(true);
                }}
                aria-label={
                  vc_url
                    ? "View verifiable credential"
                    : "Issue verifiable credential"
                }
                className="h-10 w-full rounded-xl text-sm font-semibold bg-brand-blue text-primary-foreground hover:bg-brand-blue/90 shadow-xs border border-transparent transition-all duration-300"
              >
                {vc_url ? "View VC" : "Issue VC"}
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowModal(true);
                }}
                aria-label="View credential"
                className="h-10 w-full rounded-xl text-sm font-semibold"
              >
                View Credential
              </Button>
            )}
          </div>
        )}
      </div>

      {/* VC Modal */}
      <IssueVCModal
        open={showModal}
        onOpenChange={setShowModal}
        achievement={achievement}
        muid={muid}
        userName={userName}
        userEmail={userEmail}
        isOwnProfile={isOwnProfile}
        onSuccess={() => {
          onAchievementUpdate?.();
          setShowModal(false);
        }}
      />

      {/* Read-only detail modal for directly-issued (non-VC) achievements */}
      <AchievementDetailModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        name={achievementData.achievement_name}
        description={achievementData.description}
        iconUrl={iconUrl}
        tags={achievementData.tags}
      />
    </>
  );
}
