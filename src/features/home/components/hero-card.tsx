import { TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MOCK_NEXT_MEETING, MOCK_STATS } from "../constants/mock-stats";
import { HomeStatsPanel } from "./home-stats-panel";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return "Good morning,";
  if (hour >= 12 && hour < 17) return "Good afternoon,";
  return "Good evening,";
}

type HeroCardProps = { name: string };

export function HeroCard({ name }: HeroCardProps) {
  const { karma } = MOCK_STATS;
  const { circleName, dateLabel } = MOCK_NEXT_MEETING;
  return (
    <Card className="overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div className="flex flex-col divide-y divide-border md:flex-row md:divide-x md:divide-y-0">
        {/* Left: Greeting */}
        <div className="flex flex-1 flex-col justify-center gap-5 p-6 lg:p-8">
          <div className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1">
            <span className="size-1.5 rounded-full bg-primary" />
            <span className="text-xs font-semibold text-primary">
              Active learner
            </span>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-foreground lg:text-4xl">
              {getGreeting()} <span className="text-primary">{name}.</span>
            </h1>
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
              You&apos;ve earned{" "}
              <strong className="font-semibold text-foreground">
                {karma.thisWeek} karma
              </strong>{" "}
              this week. Your{" "}
              <strong className="font-semibold text-foreground">
                {circleName}
              </strong>{" "}
              meets{" "}
              <strong className="font-semibold text-foreground">
                {dateLabel}
              </strong>
              .
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="gap-2">
              <Link href="/dashboard/mujourney">
                <TrendingUp className="size-4" />
                Continue learning
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/learning-circle">Explore groups</Link>
            </Button>
          </div>
        </div>
        {/* Right: Stats */}
        <div className="w-full p-6 md:w-72 lg:w-80">
          <HomeStatsPanel />
        </div>
      </div>
    </Card>
  );
}
