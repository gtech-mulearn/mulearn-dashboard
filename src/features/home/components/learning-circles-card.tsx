"use client";

import { ArrowRight, Plus, Users, Users2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCircles } from "@/features/learning-circle";
import type { LearningCircle } from "@/features/learning-circle/schemas/circle.schema";

// TODO: per-circle accent colors are a meaningful categorical palette — leave as-is
const ACCENT_VARS = [
  { bg: "#EEF2FF", color: "#4F46E5" },
  { bg: "#F5F3FF", color: "#7C3AED" },
  { bg: "#ECFDF5", color: "#059669" },
  { bg: "#FFF7ED", color: "#EA580C" },
] as const;

type LearningCirclesCardProps = {
  userInterestGroups?: { id: string; name: string }[];
};

export function LearningCirclesCard({
  userInterestGroups,
}: LearningCirclesCardProps) {
  const { data: circles, isLoading } = useCircles();
  const igNames = new Set(
    (userInterestGroups ?? []).map((ig) => ig.name.toLowerCase()),
  );
  const filtered =
    igNames.size > 0
      ? (circles ?? []).filter((c) => igNames.has(c.ig.toLowerCase()))
      : (circles ?? []);
  const visible = filtered.slice(0, 4);
  const hasCircles = visible.length > 0;

  return (
    <Card className="h-full rounded-2xl border bg-card shadow-sm">
      <CardHeader className="flex-row items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-brand-purple/10">
            <Users2 className="size-4 text-brand-purple" />
          </div>
          <CardTitle className="text-base font-bold text-foreground">
            Learning Circles
          </CardTitle>
        </div>
        {hasCircles && (
          <Link
            href="/dashboard/learning-circle"
            className="group flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            View all
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </CardHeader>
      <CardContent className="px-5 pb-5 pt-0">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        ) : hasCircles ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              {visible.map((circle, i) => (
                <CircleCard
                  key={circle.id}
                  circle={circle}
                  accent={ACCENT_VARS[i % ACCENT_VARS.length]}
                />
              ))}
            </div>
            {filtered.length > 4 && (
              <Link
                href="/dashboard/learning-circle"
                className="mt-3 block text-center text-sm text-muted-foreground hover:text-foreground"
              >
                +{filtered.length - 4} more circles
              </Link>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 py-8 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-brand-purple/10">
              <Users className="size-5 text-brand-purple" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                No circles yet
              </p>
              <p className="text-xs text-muted-foreground">
                Join or create a learning circle to collaborate with peers.
              </p>
            </div>
            <Button asChild size="sm" className="gap-2">
              <Link href="/dashboard/learning-circle">
                <Plus className="size-3.5" />
                Create Circle
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CircleCard({
  circle,
  accent,
}: {
  circle: LearningCircle;
  accent: { bg: string; color: string };
}) {
  return (
    <Link
      href={`/dashboard/learning-circle/${circle.id}`}
      className="flex flex-col gap-3 rounded-xl border bg-card p-4 transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div
          className="flex size-9 items-center justify-center rounded-xl"
          style={{ backgroundColor: accent.bg }}
        >
          <Users className="size-4" style={{ color: accent.color }} />
        </div>
        <div
          className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
          style={{ backgroundColor: accent.bg, color: accent.color }}
        >
          <Users2 className="size-3" />
          <span>{circle.total_members}</span>
        </div>
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-bold text-foreground">
          {circle.title}
        </p>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {circle.ig}
        </p>
      </div>
    </Link>
  );
}
