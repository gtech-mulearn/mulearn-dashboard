/**
 * Mu Voyage Tab Component
 *
 * 📍 src/features/profile/components/mu-voyage.tsx
 *
 * Displays user's level progress with task checklist.
 * Uses accordion-style expandable levels matching old codebase.
 */

"use client";

import { Check, ChevronDown, Loader2, Target } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import type { UserLevelsData, UserLevel } from "../schemas";

interface MuVoyageProps {
  userLevels?: UserLevelsData;
  currentLevel: number;
  isLoading?: boolean;
}

// Level images - using public path
const LEVEL_IMAGES = [
  "/images/levels/level1.webp",
  "/images/levels/level2.webp",
  "/images/levels/level3.webp",
  "/images/levels/level4.webp",
  "/images/levels/level5.webp",
  "/images/levels/level6.webp",
  "/images/levels/level7.webp",
];

export function MuVoyage({
  userLevels,
  currentLevel,
  isLoading,
}: MuVoyageProps) {
  const [expandedLevels, setExpandedLevels] = useState<string[]>([]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!userLevels || userLevels.length === 0) {
    return (
      <div className="rounded-xl bg-gray-50 p-8 text-center text-gray-500">
        <p className="font-medium">No level data available</p>
        <p className="mt-1 text-sm">Start your journey by completing tasks!</p>
      </div>
    );
  }

  // Filter out levels without tasks
  const levelsWithTasks = userLevels.filter((level) => level.tasks.length > 0);

  // Get current level data
  const currentLevelData = levelsWithTasks.find(
    (_, index) => index + 1 === currentLevel,
  );

  // Calculate progress for current level
  const getProgressPercent = (level: UserLevel) => {
    if (!level.tasks.length) return 0;
    const completed = level.tasks.filter((t) => t.completed).length;
    return Math.round((completed / level.tasks.length) * 100);
  };

  const getCompletedKarma = (level: UserLevel) => {
    return level.tasks
      .filter((t) => t.completed)
      .reduce((sum, t) => sum + t.karma, 0);
  };

  const getTotalKarma = (level: UserLevel) => {
    return level.tasks.reduce((sum, t) => sum + t.karma, 0);
  };

  const toggleLevel = (levelName: string) => {
    setExpandedLevels((prev) =>
      prev.includes(levelName)
        ? prev.filter((l) => l !== levelName)
        : [...prev, levelName],
    );
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm sm:p-8">
      {/* Current Level Header */}
      {currentLevelData && (
        <div className="mb-6 space-y-4">
          <div className="flex items-center gap-4">
            {/* Level Image */}
            <div className="relative h-16 w-16 shrink-0">
              <Image
                src={LEVEL_IMAGES[currentLevel - 1] || LEVEL_IMAGES[0]}
                alt={`Level ${currentLevel}`}
                fill
                className="object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">
                {currentLevelData.name}
              </h3>
            </div>
          </div>

          {/* Progress Bar - only show if not level 4+ */}
          {currentLevel < 4 && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {getProgressPercent(currentLevelData)}% complete
                </span>
                <span className="text-gray-600">
                  {getCompletedKarma(currentLevelData)}/
                  {getTotalKarma(currentLevelData)} Karma
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-green-500 transition-all duration-500"
                  style={{ width: `${getProgressPercent(currentLevelData)}%` }}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Levels Accordion */}
      <div className="space-y-3">
        {levelsWithTasks.map((level) => {
          const isExpanded = expandedLevels.includes(level.name);
          const completedCount = level.tasks.filter((t) => t.completed).length;
          const allCompleted = completedCount === level.tasks.length;
          const karmaRemaining = Math.max(
            level.karma - getCompletedKarma(level),
            0,
          );

          return (
            <div
              key={level.name}
              className="overflow-hidden rounded-xl border-2 border-gray-200"
            >
              {/* Level Header - Clickable */}
              <button
                type="button"
                onClick={() => toggleLevel(level.name)}
                className="flex w-full items-center justify-between p-4 text-left hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900">
                    {level.name}
                  </span>
                  <span className="text-xs text-gray-400">
                    [{getCompletedKarma(level)}/
                    <span className="text-[#2E85FE]">
                      {getTotalKarma(level)}
                    </span>
                    ]
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {/* Progress Circle */}
                  <div className="relative h-5 w-5">
                    <svg
                      className="h-5 w-5 -rotate-90 transform"
                      viewBox="0 0 20 20"
                      role="img"
                      aria-label="Level progress"
                    >
                      <circle
                        cx="10"
                        cy="10"
                        r="8"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="3"
                      />
                      <circle
                        cx="10"
                        cy="10"
                        r="8"
                        fill="none"
                        stroke="#48bb78"
                        strokeWidth="3"
                        strokeDasharray={`${(completedCount / level.tasks.length) * 50.3} 50.3`}
                        strokeLinecap="round"
                      />
                    </svg>
                    {allCompleted && (
                      <Check className="absolute inset-0 m-auto h-3 w-3 text-green-500" />
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {level.tasks.length} Tasks
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                  />
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-gray-100">
                  {/* Goal Info */}
                  <div className="flex items-center justify-between bg-gray-50 px-4 py-2 text-xs text-gray-500">
                    <span>Mine Left: {karmaRemaining} Karma</span>
                    <span className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      Goal: {level.karma} Karma
                    </span>
                  </div>

                  {/* Tasks List */}
                  <ul className="max-h-96 overflow-y-auto">
                    {level.tasks.map((task, taskIndex) => (
                      <li
                        key={`${level.name}-${taskIndex}`}
                        className="flex items-center gap-3 px-4 py-3"
                      >
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={task.completed}
                          readOnly
                          className="h-4 w-4 rounded border-gray-300 text-green-500"
                        />
                        {/* Task Info */}
                        <div className="flex flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                          <span
                            className={`text-sm ${task.completed ? "text-gray-500" : "font-medium text-gray-700"}`}
                          >
                            {task.task_name}
                          </span>
                          {task.hashtag && (
                            <span className="flex items-center gap-1 rounded bg-blue-50 px-2 py-0.5 text-xs text-[#2E85FE]">
                              {task.hashtag}
                              {task.discord_link && (
                                <a
                                  href={task.discord_link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-1 inline-block"
                                >
                                  <Image
                                    src="/images/discord-icon.webp"
                                    alt="Discord"
                                    width={18}
                                    height={18}
                                    className="transition-transform hover:scale-110"
                                  />
                                </a>
                              )}
                            </span>
                          )}
                        </div>
                        {/* Karma */}
                        <span className="text-sm text-gray-400">
                          {task.karma} ϰ
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
