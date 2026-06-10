/**
 * Journey Header Component
 *
 * 📍 src/features/mujourney/components/JourneyHeader.tsx
 *
 * Header with title and metadata
 */

interface JourneyHeaderProps {
  title?: string;
  subtitle?: string;
}

export function JourneyHeader({
  title = "MuJourney",
  subtitle = "Your Learning Path",
}: JourneyHeaderProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
          {title}
        </h1>
        <p className="text-base sm:text-lg text-muted-foreground mt-2">
          {subtitle}
        </p>
      </div>
    </div>
  );
}
