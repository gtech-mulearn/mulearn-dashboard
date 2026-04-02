/**
 * Level Progress Component
 *
 * 📍 src/features/mujourney/components/LevelProgress.tsx
 *
 * Overall level progress bar
 */

import { Progress } from "@/components/ui/progress";

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
  const percentage = (currentLevel / maxLevel) * 100;

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <p className="text-xs font-black uppercase tracking-widest text-primary">
            Current Progress
          </p>
          <h2 className="text-2xl font-bold text-foreground">
            Level {currentLevel}{" "}
            <span className="text-muted-foreground/40 font-medium">
              / {maxLevel}
            </span>
          </h2>
        </div>
        <div className="text-right">
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
            Total Karma
          </p>
          <p className="text-xl font-bold text-foreground">
            {totalKarma.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="relative group">
        <Progress
          value={percentage}
          className="h-3 rounded-full bg-primary/10 border border-primary/5"
        />
        <div className="absolute inset-0 bg-linear-to-r from-primary/20 to-transparent blur-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>
    </div>
  );
}
