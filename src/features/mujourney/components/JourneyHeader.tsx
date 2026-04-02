import { Sparkles, Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
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
    <Card className="relative overflow-hidden rounded-3xl border-none bg-card shadow-sm transition-all duration-300 hover:shadow-md">
      {/* Creative Background Elements */}
      <div className="absolute -top-24 -right-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl animate-pulse" />
      <div className="absolute top-1/2 -left-10 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-0 right-1/4 h-32 w-32 rounded-full bg-chart-5/10 blur-2xl" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:18px_18px] opacity-[0.15]" />

      <div className="relative p-6 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.5fr_0.5fr] items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-primary backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" />
              <span className="text-xs font-bold uppercase tracking-wider">
                Active Journey
              </span>
            </div>

            <div className="space-y-3">
              <h1 className="font-display text-4xl font-black tracking-tight text-foreground lg:text-5xl">
                {title}
              </h1>
              <p className="max-w-xl text-base sm:text-lg text-muted-foreground leading-relaxed">
                {subtitle}
              </p>
            </div>

            {showProgress &&
              currentLevel !== undefined &&
              totalKarma !== undefined && (
                <div className="max-w-md pt-2">
                  <LevelProgress
                    currentLevel={currentLevel}
                    totalKarma={totalKarma}
                  />
                </div>
              )}
          </div>

          <div className="relative hidden lg:flex h-48 w-full items-center justify-center">
            {/* Abstract Shapes behind image */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-40 w-40 rounded-full bg-linear-to-tr from-primary/20 to-chart-2/20 blur-2xl" />
            </div>
            <div className="relative z-10 flex flex-col items-center gap-2">
              <div className="bg-primary/10 p-4 rounded-3xl backdrop-blur-xl border border-primary/20 shadow-xl group hover:scale-105 transition-all duration-300">
                <Trophy className="h-20 w-20 text-primary drop-shadow-lg" />
              </div>
              <div className="bg-background/80 backdrop-blur-sm px-4 py-1.5 rounded-full border border-border shadow-sm">
                <span className="text-xs font-black uppercase tracking-widest text-foreground/70">
                  Level {currentLevel}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
