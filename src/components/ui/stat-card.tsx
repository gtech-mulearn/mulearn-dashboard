import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type StatAccent =
  | "chart-1"
  | "chart-2"
  | "chart-3"
  | "chart-4"
  | "chart-5";

export interface StatCardProps {
  title: string;
  value: ReactNode;
  icon?: ReactNode;
  accent?: StatAccent;
  trend?: { value: string; direction: "up" | "down" };
  description?: string;
  gradient?: boolean;
  className?: string;
}

const ACCENT_VAR: Record<StatAccent, string> = {
  "chart-1": "var(--chart-1)",
  "chart-2": "var(--chart-2)",
  "chart-3": "var(--chart-3)",
  "chart-4": "var(--chart-4)",
  "chart-5": "var(--chart-5)",
};

const GRADIENT_CLASS: Record<StatAccent, string> = {
  "chart-1": "gradient-6",
  "chart-2": "gradient-2",
  "chart-3": "gradient-3",
  "chart-4": "gradient-4",
  "chart-5": "gradient-5",
};

export function StatCard({
  title,
  value,
  icon,
  accent = "chart-1",
  trend,
  description,
  gradient = false,
  className,
}: StatCardProps) {
  const accentColor = ACCENT_VAR[accent];
  return (
    <Card
      className={cn(
        "overflow-hidden rounded-2xl border-border/60 lc-card-shadow transition-shadow hover:shadow-md",
        gradient && GRADIENT_CLASS[accent],
        className,
      )}
    >
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {title}
          </p>
          <p className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground">
            {value}
          </p>
          {(description || trend) && (
            <div className="mt-2 flex items-center gap-2">
              {trend && (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[11px] font-bold",
                    trend.direction === "up"
                      ? "bg-success/12 text-success"
                      : "bg-destructive/12 text-destructive",
                  )}
                >
                  {trend.direction === "up" ? (
                    <ArrowUpRight className="size-3" />
                  ) : (
                    <ArrowDownRight className="size-3" />
                  )}
                  {trend.value}
                </span>
              )}
              {description && (
                <span className="truncate text-xs text-muted-foreground">
                  {description}
                </span>
              )}
            </div>
          )}
        </div>
        {icon && (
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-xl"
            style={{
              backgroundColor: `color-mix(in srgb, ${accentColor} 14%, var(--background))`,
              color: accentColor,
            }}
          >
            {icon}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
