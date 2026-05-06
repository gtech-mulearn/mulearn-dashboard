/**
 * Achievement Card Component
 *
 * 📍 src/features/profile/components/achievement-card.tsx
 *
 * Card displaying an achievement with pastel gradient.
 * Shows Issue VC or View button based on issuance status.
 */

"use client";

import { Award } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { UserAchievement } from "../schemas";
import { IssueVCModal } from "./issue-vc-modal";

// Pastel colors for random backgrounds
const PASTEL_COLORS = [
  "from-violet-100 to-purple-100",
  "from-blue-100 to-indigo-100",
  "from-emerald-100 to-teal-100",
  "from-pink-100 to-rose-100",
  "from-amber-100 to-orange-100",
  "from-cyan-100 to-sky-100",
];

// Level images (adjust paths as needed)
const LEVEL_IMAGES: Record<string, string> = {
  "Level 1": "/images/levels/Level1.webp",
  "Level 2": "/images/levels/Level2.webp",
  "Level 3": "/images/levels/Level3.webp",
  "Level 4": "/images/levels/Level4.webp",
  "Level 5": "/images/levels/Level5.webp",
  "Level 6": "/images/levels/Level6.webp",
  "Level 7": "/images/levels/Level7.webp",
};

function getRandomColor(id: string): string {
  // Use ID to get consistent color for the same card
  const index =
    id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0) %
    PASTEL_COLORS.length;
  return PASTEL_COLORS[index];
}

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
  const bgColor = getRandomColor(achievement.id);
  // Check if this is a level-based achievement by checking if level_id exists
  const isLevelBased = !!achievementData.level_id;
  const levelImage =
    LEVEL_IMAGES[achievementData.achievement_name] || LEVEL_IMAGES["Level 1"];

  const handleButtonClick = () => {
    setShowModal(true);
  };

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all hover:shadow-md">
        {/* Card Header with Icon */}
        <div
          className={`flex h-32 items-center justify-center bg-linear-to-br ${bgColor} p-4`}
        >
          <div className="relative h-20 w-20 overflow-hidden rounded-full bg-card/80 p-2 shadow-lg">
            {isLevelBased ? (
              <Image
                src={levelImage}
                alt={achievementData.achievement_name}
                fill
                className="object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Award className="h-10 w-10 text-warning" />
              </div>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4">
          <h4 className="mb-1 text-center text-sm font-semibold text-foreground line-clamp-2">
            {achievementData.achievement_name}
          </h4>
          {achievementData.description && (
            <p className="mb-3 text-center text-xs text-muted-foreground line-clamp-2">
              {achievementData.description}
            </p>
          )}

          {/* Tags */}
          {achievementData.tags.length > 0 && (
            <div className="mb-3 flex flex-wrap justify-center gap-1">
              {achievementData.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-brand-blue/10 px-2 py-0.5 text-xs text-brand-blue"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Action Button */}
          {isOwnProfile && (
            <div className="flex justify-center">
              <Button
                size="sm"
                onClick={handleButtonClick}
                className={
                  is_issued
                    ? "bg-success hover:bg-success/90"
                    : "bg-primary hover:bg-primary/90"
                }
              >
                {is_issued ? "View VC" : "Issue VC"}
              </Button>
            </div>
          )}

          {/* View-only for non-owners */}
          {!isOwnProfile && is_issued && vc_url && (
            <div className="flex justify-center">
              <Button size="sm" variant="outline" onClick={handleButtonClick}>
                View Credential
              </Button>
            </div>
          )}
        </div>
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
