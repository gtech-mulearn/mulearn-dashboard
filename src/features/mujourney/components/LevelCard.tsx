/**
 * Level Card Component
 *
 * 📍 src/features/mujourney/components/LevelCard.tsx
 *
 * Displays a level with its tasks
 */

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
  // Use level name or id as unique prefix for task keys
  const keyPrefix = level.name || `level-${levelNumber}`;

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
      <div className="flex items-center justify-between px-2">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 text-primary w-10 h-10 rounded-xl flex items-center justify-center font-black text-lg">
              {levelNumber}
            </div>
            <h2 className="text-2xl font-black text-foreground tracking-tight">
              {levelName}
              {isLocked && " 🔒"}
            </h2>
          </div>
        </div>
      </div>

      {/* Tasks Grid */}
      <TaskList tasks={level.tasks} isLocked={isLocked} keyPrefix={keyPrefix} />
    </div>
  );
}
