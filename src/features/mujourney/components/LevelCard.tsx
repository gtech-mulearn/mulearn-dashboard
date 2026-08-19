/**
 * Level Card Component
 *
 * 📍 src/features/mujourney/components/LevelCard.tsx
 *
 * Displays a named level section with its tasks.
 * Formats level strings (like "lvl6") to friendly display titles (like "Level 6")
 * and adds the corresponding level sub-name (e.g., "Foundation", "Explorer").
 */

import { cn } from "@/lib/utils";
import type { TaskListPublic } from "../schemas";
import { TaskList } from "./TaskList";

interface LevelCardProps {
  /** Level display name from the API (e.g. "lvl1", "lvl2", or "Level 1") */
  name: string;
  tasks: TaskListPublic[];
  isLocked?: boolean;
}

export function LevelCard({ name, tasks, isLocked = false }: LevelCardProps) {
  // Extract number (e.g. "lvl6" -> "6")
  const levelNumberMatch = name.match(/\d+/);
  const levelNumber = levelNumberMatch ? levelNumberMatch[0] : null;

  // Format "lvl6" or "Lvl 6" to "Level 6"
  const displayName =
    levelNumber &&
    (name.toLowerCase().startsWith("lvl") ||
      name.toLowerCase().startsWith("lvl "))
      ? `Level ${levelNumber}`
      : name;

  const levelNames = [
    "Foundation",
    "Explorer",
    "Intermediate",
    "Advanced",
    "Professional",
    "Expert",
    "Master",
  ];

  const subName = levelNumber
    ? levelNames[parseInt(levelNumber, 10) - 1]
    : null;

  return (
    <div className={cn("space-y-6", isLocked && "opacity-60")}>
      {/* Level Header */}
      <div className="px-2 py-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            {displayName}
            {isLocked && " 🔒"}
          </h2>
          {subName && (
            <p className="text-base text-muted-foreground mt-1">{subName}</p>
          )}
        </div>
      </div>

      {/* Tasks Grid */}
      <TaskList tasks={tasks} isLocked={isLocked} keyPrefix={name} />
    </div>
  );
}
