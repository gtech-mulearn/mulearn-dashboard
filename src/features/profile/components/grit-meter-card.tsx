/**
 * Grit Meter Card
 *
 * 📍 src/features/profile/components/grit-meter-card.tsx
 *
 * Gamified 0-100 meter for the user's grit score. 100 means fully active,
 * 0 means inactive; the score rises or falls day to day based on activity,
 * so this is shown as a radial gauge with an activity tier badge rather
 * than a plain number.
 */

import { Flame, Snowflake, Zap } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface GritTier {
  label: string;
  color: string;
  icon: ReactNode;
}

function getGritTier(value: number): GritTier {
  if (value >= 70) {
    return {
      label: "On Fire",
      color: "var(--success)",
      icon: <Flame className="size-3.5" />,
    };
  }
  if (value >= 40) {
    return {
      label: "Charged Up",
      color: "var(--warning)",
      icon: <Zap className="size-3.5" />,
    };
  }
  return {
    label: "Needs a Spark",
    color: "var(--destructive)",
    icon: <Snowflake className="size-3.5" />,
  };
}

const GAUGE_SIZE = 72;
const STROKE_WIDTH = 7;
const RADIUS = (GAUGE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function GritGauge({ value, color }: { value: number; color: string }) {
  const offset = CIRCUMFERENCE * (1 - value / 100);

  return (
    <div className="relative size-16 shrink-0 sm:size-[72px]">
      <svg
        viewBox={`0 0 ${GAUGE_SIZE} ${GAUGE_SIZE}`}
        className="size-full -rotate-90"
        role="img"
        aria-label={`Grit meter at ${value} out of 100`}
      >
        <circle
          cx={GAUGE_SIZE / 2}
          cy={GAUGE_SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="var(--border)"
          strokeWidth={STROKE_WIDTH}
        />
        <circle
          cx={GAUGE_SIZE / 2}
          cy={GAUGE_SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={STROKE_WIDTH}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          className="transition-[stroke-dashoffset] duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-display text-sm font-bold text-foreground">
        {value}
      </div>
    </div>
  );
}

export function GritMeterCard({ grit }: { grit: number }) {
  const value = Math.min(100, Math.max(0, Math.round(grit)));
  const tier = getGritTier(value);

  return (
    <Card
      className={cn(
        "overflow-hidden rounded-2xl border-border/60 lc-card-shadow transition-shadow hover:shadow-md",
        value >= 70 && "ring-1 ring-success/30",
      )}
    >
      <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Grit Meter
          </p>
          <p className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground">
            {value}
            <span className="text-sm font-medium text-muted-foreground">
              /100
            </span>
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-bold"
              style={{
                backgroundColor: `color-mix(in srgb, ${tier.color} 14%, var(--background))`,
                color: tier.color,
              }}
            >
              {tier.icon}
              {tier.label}
            </span>
            <span className="text-xs text-muted-foreground">
              shifts daily with activity
            </span>
          </div>
        </div>
        <GritGauge value={value} color={tier.color} />
      </CardContent>
    </Card>
  );
}
