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
  const progress = (currentLevel / maxLevel) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium">
          Level {currentLevel} of {maxLevel}
        </span>
        <span className="text-muted-foreground">{totalKarma} Total Karma</span>
      </div>

      <div className="relative h-3 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
