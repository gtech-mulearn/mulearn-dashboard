/**
 * Journey Header Component
 *
 * 📍 src/features/mujourney/components/JourneyHeader.tsx
 *
 * Header with title and metadata
 */

import { LevelProgress } from "./LevelProgress";

interface JourneyHeaderProps {
  title?: string;
  subtitle?: string;
  currentLevel?: number;
  totalKarma?: number;
  showProgress?: boolean;
}

export function JourneyHeader({
  title = "MuJourney",
  subtitle = "Your Learning Path",
  currentLevel,
  totalKarma,
  showProgress = false,
}: JourneyHeaderProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">{title}</h1>
        <p className="text-lg text-muted-foreground mt-2">{subtitle}</p>
      </div>

      {showProgress &&
        currentLevel !== undefined &&
        totalKarma !== undefined && (
          <LevelProgress currentLevel={currentLevel} totalKarma={totalKarma} />
        )}
    </div>
  );
}
