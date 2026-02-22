import { ArrowRight, Plus, Users, Users2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useCircles } from "@/features/learning-circle";
import type { LearningCircle } from "@/features/learning-circle/schemas/circle.schema";

/**
 * Accent palette purely from globals.css CSS variables (chart-1 → chart-4)
 * Tailwind arbitrary values reference the CSS vars at runtime.
 */
const ACCENT_VARS = [
  "--chart-1",
  "--chart-2",
  "--chart-4",
  "--primary",
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
  const filteredCircles =
    igNames.size > 0
      ? (circles ?? []).filter((c) => igNames.has(c.ig.toLowerCase()))
      : (circles ?? []);

  /* ── Loading skeleton ─────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <Card className="card-bg-circles relative h-full gap-0 overflow-hidden rounded-2xl border-none pt-0 shadow-sm">
        <CardHeader className="flex-row items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div
              className="flex size-9 items-center justify-center rounded-xl shadow-sm"
              style={{
                background:
                  "color-mix(in srgb, var(--chart-2) 22%, var(--background))",
              }}
            >
              <Users2 className="h-5 w-5" style={{ color: "var(--chart-2)" }} />
            </div>
            <CardTitle className="text-base font-bold tracking-tight text-foreground">
              Learning Circles
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 p-5 pt-0">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              className="h-22 w-full rounded-2xl"
              style={{
                background:
                  "color-mix(in srgb, var(--chart-2) 12%, var(--background))",
              }}
            />
          ))}
        </CardContent>
      </Card>
    );
  }

  const hasCircles = filteredCircles.length > 0;

  return (
    <Card className="card-bg-circles relative h-full gap-0 overflow-hidden rounded-2xl border-none pt-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      {/* Decorative rings */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute top-0 right-0 h-full w-1/3 opacity-[0.09]"
        fill="none"
        viewBox="0 0 200 400"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="160"
          cy="60"
          r="80"
          stroke="var(--chart-2)"
          strokeWidth="2"
        />
        <circle
          cx="180"
          cy="300"
          r="120"
          stroke="var(--chart-3)"
          strokeWidth="1.5"
        />
        <circle
          cx="100"
          cy="180"
          r="40"
          stroke="var(--chart-2)"
          strokeWidth="1"
        />
      </svg>

      {/* Header */}
      <CardHeader className="relative z-10 flex-row items-center justify-between px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div
            className="flex size-9 items-center justify-center rounded-xl shadow-sm"
            style={{
              background:
                "color-mix(in srgb, var(--chart-2) 22%, var(--background))",
            }}
          >
            <Users2 className="h-5 w-5" style={{ color: "var(--chart-2)" }} />
          </div>
          <CardTitle className="text-base font-bold tracking-tight text-foreground">
            Learning Circles
          </CardTitle>
        </div>

        {hasCircles && (
          <Link
            className="group flex items-center gap-1.5 text-sm font-semibold text-foreground/70 transition-colors hover:text-foreground"
            href="/dashboard/learning-circle"
          >
            View all
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </CardHeader>

      {/* Circles grid */}
      {hasCircles ? (
        <CardContent className="relative z-10 p-4 pt-0">
          <div className="group/grid grid grid-cols-2 gap-3">
            {filteredCircles.slice(0, 4).map((circle, index) => (
              <CircleItem
                key={circle.id}
                circle={circle}
                accentVar={ACCENT_VARS[index % ACCENT_VARS.length]}
              />
            ))}
          </div>
          {filteredCircles.length > 4 && (
            <Link
              href="/dashboard/learning-circle"
              className="mt-3 block text-center text-sm font-medium text-foreground/60 transition-colors hover:text-foreground"
            >
              +{filteredCircles.length - 4} more circles
            </Link>
          )}
        </CardContent>
      ) : (
        /* Empty state */
        <CardContent className="relative z-10 grid gap-8 p-6 pt-2 md:grid-cols-[1.5fr_1fr] md:items-center">
          <div className="space-y-5">
            {/* Live badge */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1 backdrop-blur-sm"
              style={{
                background:
                  "color-mix(in srgb, var(--chart-2) 18%, var(--background))",
                color: "var(--chart-2)",
              }}
            >
              <span className="relative flex h-2 w-2">
                <span
                  className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                  style={{ background: "var(--chart-2)" }}
                />
                <span
                  className="relative inline-flex h-2 w-2 rounded-full"
                  style={{ background: "var(--chart-2)" }}
                />
              </span>
              <span className="text-xs font-semibold">Join the community</span>
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-bold text-foreground">
                No Learning Circle Found!
              </h3>
              <p className="text-sm leading-relaxed text-foreground/70">
                Collaborate with peers, share knowledge, and grow together.
                Learning circles keep you consistent and motivated.
              </p>
            </div>

            <Button
              asChild
              className="h-10 gap-2 rounded-xl px-5 text-sm font-semibold text-white shadow-md transition-all hover:scale-105"
              style={{ background: "var(--chart-2)" }}
              size="lg"
            >
              <Link href="/dashboard/learning-circle">
                <Plus className="h-4 w-4" />
                Create New Circle
              </Link>
            </Button>
          </div>

          <div className="relative flex items-center justify-center">
            <div
              className="absolute inset-0 scale-90 rounded-full blur-3xl"
              style={{
                background:
                  "color-mix(in srgb, var(--chart-2) 15%, transparent)",
              }}
            />
            <Image
              alt="Learning circle illustration"
              className="relative z-10 h-48 w-auto object-contain drop-shadow-lg transition-transform duration-500 hover:scale-105"
              height={200}
              width={240}
              src="/layout/Group.png"
            />
          </div>
        </CardContent>
      )}
    </Card>
  );
}

/* ── Individual circle card ────────────────────────────────────────────── */
function CircleItem({
  circle,
  accentVar,
}: {
  circle: LearningCircle;
  accentVar: string;
}) {
  const accentColor = `var(${accentVar})`;

  return (
    <Link
      href={`/dashboard/learning-circle/${circle.id}`}
      className="group/circle relative z-0 flex flex-col gap-3 overflow-hidden rounded-2xl border bg-white p-3.5 shadow-md
        transition-all duration-300
        group-has-[a:hover]/grid:opacity-40 group-has-[a:hover]/grid:scale-[0.97] group-has-[a:hover]/grid:blur-[0.5px]
        hover:opacity-100! hover:scale-[1.03]! hover:blur-0! hover:-translate-y-1.5 hover:z-10
        hover:shadow-[0_12px_40px_-6px_rgba(0,0,0,0.18)]"
      style={{
        borderColor: `color-mix(in srgb, ${accentColor} 35%, var(--border))`,
        boxShadow:
          "0 2px 8px -2px rgba(0,0,0,0.08), 0 0 0 1px color-mix(in srgb, " +
          accentColor +
          " 12%, transparent)",
      }}
    >
      {/* Accent glow ring — appears on hover */}
      <span
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover/circle:opacity-100"
        style={{
          boxShadow: `0 0 0 2px ${accentColor}, 0 8px 32px -4px color-mix(in srgb, ${accentColor} 35%, transparent)`,
        }}
      />

      {/* Soft accent fill on hover */}
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/circle:opacity-100"
        style={{
          background: `linear-gradient(135deg, color-mix(in srgb, ${accentColor} 7%, transparent), transparent 65%)`,
        }}
      />

      {/* Decorative corner dot cluster */}
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute -right-2 -bottom-2 size-16 opacity-[0.07] transition-transform duration-500 group-hover/circle:scale-110 group-hover/circle:rotate-12 group-hover/circle:opacity-[0.14]"
        fill="none"
        viewBox="0 0 60 60"
        xmlns="http://www.w3.org/2000/svg"
      >
        {[0, 1, 2].map((row) =>
          [0, 1, 2].map((col) => (
            <circle
              key={`${row}-${col}`}
              cx={12 + col * 18}
              cy={12 + row * 18}
              r="3"
              fill={accentColor}
            />
          )),
        )}
      </svg>

      {/* Icon row + member badge */}
      <div className="relative z-10 flex items-center gap-2">
        <div
          className="flex size-9 shrink-0 items-center justify-center rounded-xl shadow-sm transition-all duration-300 group-hover/circle:scale-110 group-hover/circle:shadow-md"
          style={{
            background: `color-mix(in srgb, ${accentColor} 18%, var(--background))`,
          }}
        >
          <Users
            className="size-4 transition-transform duration-300 group-hover/circle:scale-110"
            style={{ color: accentColor }}
          />
        </div>
        <div
          className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-bold transition-all duration-300 group-hover/circle:shadow-sm"
          style={{
            background: `color-mix(in srgb, ${accentColor} 14%, var(--background))`,
            color: accentColor,
          }}
        >
          <Users2 className="size-3" />
          <span>{circle.total_members}</span>
        </div>
      </div>

      {/* Circle title + IG name */}
      <div className="relative z-10 min-w-0">
        <p
          className={cn(
            "truncate text-sm font-bold text-foreground transition-colors duration-200",
            "group-hover/circle:text-primary",
          )}
        >
          {circle.title}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
          {circle.ig}
        </p>
      </div>

      {/* Bottom accent bar — slides in on hover */}
      <span
        className="pointer-events-none absolute bottom-0 left-0 h-0.5 w-0 rounded-full transition-all duration-500 group-hover/circle:w-full"
        style={{ background: accentColor }}
      />
    </Link>
  );
}
