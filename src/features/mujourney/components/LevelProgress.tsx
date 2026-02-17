/**
 * Level Progress Component
 *
 * 📍 src/features/mujourney/components/LevelProgress.tsx
 *
 * Overall level progress bar
 */

interface LevelProgressProps {
  currentLevel: number;
  totalKarma: number;
  maxLevel?: number;
}

export function LevelProgress({
  currentLevel,
  totalKarma,
  maxLevel = 7,
}: LevelProgressProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-col justify-between text-sm">
        <span className="font-medium">
          Level {currentLevel} of {maxLevel}
        </span>
        <span className="text-muted-foreground">
          {totalKarma} Karma in Level {currentLevel}
        </span>
      </div>
    </div>
  );
}
