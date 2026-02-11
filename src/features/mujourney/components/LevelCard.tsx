/**
 * Level Card Component
 *
 * 📍 src/features/mujourney/components/LevelCard.tsx
 *
 * Displays a level with its tasks
 */

"use client";

import { cn } from "@/lib/utils";
import type { Level, UserLevelData } from "../schemas";
import { TaskList } from "./TaskList";

interface LevelCardProps {
  level: Level | UserLevelData;
  isLocked?: boolean;
}

export function LevelCard({ level, isLocked = false }: LevelCardProps) {
  // Extract level number from name (e.g., "lvl1" -> 1)
  const levelNumber = level.name.match(/\d+/)?.[0] || "1";

  const levelNames = [
    "Foundation",
    "Explorer",
    "Intermediate",
    "Advanced",
    "Professional",
    "Expert",
    "Master",
  ];

  const levelName =
    levelNames[parseInt(levelNumber, 10) - 1] || `Level ${levelNumber}`;

  return (
    <div className={cn("space-y-6", isLocked && "opacity-60")}>
      {/* Level Header */}
      <div className="px-2 py-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            Level {levelNumber}
            {isLocked && " 🔒"}
          </h2>
          <p className="text-base text-muted-foreground mt-1">{levelName}</p>
        </div>
      </div>

      {/* Tasks Grid */}
      <TaskList tasks={level.tasks} isLocked={isLocked} />
    </div>
  );
}
