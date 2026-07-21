/**
 * Achievement Card Component
 *
 * 📍 src/features/profile/components/achievement-card.tsx
 *
 * Clean card matching the reference design:
 *   – Large circular icon centered at top
 *   – Title + description centred in the body
 *   – Issue VC / View VC button pinned to the footer
 */

"use client";

import { Award } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { resolveMediaUrl } from "@/lib/utils";
import type { UserAchievement } from "../schemas";
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

  const { achievement: achievementData, is_issued, vc_url } = achievement;

  const iconUrl = achievementData.icon_url || achievementData.icon || "";
  const resolvedImageSrc = resolveMediaUrl(iconUrl);

  return (
    <>
      <div className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
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
        {(isOwnProfile || (!isOwnProfile && is_issued && vc_url)) && (
          <div className="flex justify-center px-6 pb-6 pt-2">
            {isOwnProfile ? (
              <Button
                onClick={() => setShowModal(true)}
                aria-label={
                  is_issued
                    ? "View verifiable credential"
                    : "Issue verifiable credential"
                }
                className="h-10 w-full rounded-xl text-sm font-semibold bg-brand-blue text-primary-foreground hover:bg-brand-blue/90 shadow-xs border border-transparent transition-all duration-300"
              >
                {is_issued ? "View VC" : "Issue VC"}
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => setShowModal(true)}
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
    </>
  );
}
