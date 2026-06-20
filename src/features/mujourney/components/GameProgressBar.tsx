"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useUserLevelFeed } from "../hooks/useUserLevelFeed";

export function GameProgressBar() {
  const { data: levelData, isLoading, error } = useUserLevelFeed();

  if (isLoading) {
    return (
      <div className="flex items-center select-none gap-2 pr-1">
        <Skeleton className="w-10 h-10 rounded-full shrink-0" />
        <div className="flex flex-col gap-1">
          <Skeleton className="w-14 h-3.5 rounded" />
          <Skeleton className="w-24 h-4 rounded-full" />
        </div>
      </div>
    );
  }

  if (error || !levelData) {
    return null;
  }

  const currentLevel = levelData.level_order || 1;
  const levelName = levelData.level_name || `Level ${currentLevel}`;
  const userKarma = levelData.user_karma || 0;
  const levelKarmaRequirement = levelData.level_karma || 0;

  // Level 7 is the max level
  const isMaxLevel = currentLevel >= 7;

  // Calculate progress percent
  const progressPercent = isMaxLevel
    ? 100
    : levelKarmaRequirement > 0
      ? Math.min((userKarma / levelKarmaRequirement) * 100, 100)
      : 0;

  const badgeSrc = `/images/levels/level${Math.min(Math.max(currentLevel, 1), 7)}.webp`;

  return (
    <div className="flex items-center select-none">
      {/* Level icon container */}
      <div className="relative z-20 flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-white bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 shadow-md dark:border-zinc-900">
        <Image
          src={badgeSrc}
          alt={levelName}
          width={28}
          height={28}
          className="object-contain"
          priority
        />
      </div>

      {/* Progress details container */}
      <div className="relative -ml-3 flex flex-col items-start justify-center">
        {/* Blue Level Badge */}
        <div className="z-10 rounded-tr rounded-bl bg-blue-500 px-3 py-0.5 text-[10px] font-bold text-white shadow-sm leading-none">
          {levelName}
        </div>

        {/* Progress Bar Capsule */}
        <div
          className={cn(
            "relative h-5 w-28 overflow-hidden rounded-tr-full rounded-br-full rounded-tl-full bg-slate-800/90 flex items-center shadow-inner border border-slate-700/50 dark:border-slate-800/85",
            isMaxLevel && "bg-green-600/20 border-green-500/30",
          )}
        >
          {/* Progress fill */}
          {isMaxLevel ? (
            <div className="h-full w-full bg-green-500 flex items-center justify-center text-[9px] font-bold text-white">
              Max Level Reached!
            </div>
          ) : (
            <>
              <motion.div
                key={progressPercent}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 rounded-tr-full rounded-br-full rounded-tl-full"
              />
              <div className="absolute inset-0 flex items-center justify-end pr-2 text-[9px] font-semibold text-white/95 drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
                {userKarma}/{levelKarmaRequirement}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
