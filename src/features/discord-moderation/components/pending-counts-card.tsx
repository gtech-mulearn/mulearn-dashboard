/**
 * Pending Counts Card
 *
 * 📍 src/features/discord-moderation/components/pending-counts-card.tsx
 *
 * Displays peer-pending and appraiser-pending approval counts.
 * Includes an optional date filter to narrow results.
 */

"use client";

import { CalendarDays, ClipboardCheck, Loader2, Users } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePendingCounts } from "../hooks";

export function PendingCountsCard() {
  const [date, setDate] = useState<string>("");
  const [appliedDate, setAppliedDate] = useState<string | undefined>(undefined);

  const { data, isLoading, isError } = usePendingCounts(appliedDate);

  function handleApply() {
    setAppliedDate(date || undefined);
  }

  function handleClear() {
    setDate("");
    setAppliedDate(undefined);
  }

  return (
    <div className="space-y-5">
      {/* Date filter row */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="pending-date"
            className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Filter by Date
          </Label>
          <div className="relative">
            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              id="pending-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="pl-9 w-44 h-9 rounded-xl text-sm"
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            className="h-9 rounded-xl px-5"
            onClick={handleApply}
          >
            Apply
          </Button>
          {appliedDate && (
            <Button
              size="sm"
              variant="outline"
              className="h-9 rounded-xl px-5"
              onClick={handleClear}
            >
              Clear
            </Button>
          )}
        </div>
        {appliedDate && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            <CalendarDays className="size-3" />
            {appliedDate}
          </span>
        )}
      </div>

      {/* Count cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <PendingStatCard
          icon={Users}
          label="Peer Pending"
          value={data?.peer_pending}
          accent="blue"
          isLoading={isLoading}
          isError={isError}
        />
        <PendingStatCard
          icon={ClipboardCheck}
          label="Appraiser Pending"
          value={data?.appraise_pending}
          accent="purple"
          isLoading={isLoading}
          isError={isError}
        />
      </div>
    </div>
  );
}

// ─── Inner stat card ──────────────────────────────────────────────────────────

const ACCENT_STYLES = {
  blue: {
    card: "border-blue-200/60 dark:border-blue-900/40",
    bar: "bg-blue-500",
    iconBg: "bg-blue-100 dark:bg-blue-800/60",
    iconColor: "text-blue-700 dark:text-blue-300",
    valueColor: "text-blue-600 dark:text-blue-400",
    badge: "bg-blue-500 text-white border-transparent",
  },
  purple: {
    card: "border-purple-200/60 dark:border-purple-900/40",
    bar: "bg-purple-500",
    iconBg: "bg-purple-100 dark:bg-purple-800/60",
    iconColor: "text-purple-700 dark:text-purple-300",
    valueColor: "text-purple-600 dark:text-purple-400",
    badge: "bg-purple-500 text-white border-transparent",
  },
} as const;

interface PendingStatCardProps {
  icon: React.ElementType;
  label: string;
  value?: number;
  accent: keyof typeof ACCENT_STYLES;
  isLoading: boolean;
  isError: boolean;
}

function PendingStatCard({
  icon: Icon,
  label,
  value,
  accent,
  isLoading,
  isError,
}: PendingStatCardProps) {
  const s = ACCENT_STYLES[accent];

  return (
    <Card
      className={`relative overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-md ${s.card}`}
    >
      {/* Coloured top bar */}
      <div className={`absolute inset-x-0 top-0 h-1 ${s.bar}`} />

      <CardContent className="px-5 pt-6 pb-5">
        <div className="flex items-start justify-between gap-3">
          {/* Left: label + value */}
          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium text-muted-foreground leading-none">
              {label}
            </span>
            {isLoading ? (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="size-5 animate-spin" />
                <span className="text-sm">Loading…</span>
              </div>
            ) : isError ? (
              <span className="text-sm text-destructive">Failed to load</span>
            ) : (
              <div className="flex items-end gap-2">
                <span
                  className={`text-5xl font-extrabold leading-none tracking-tight ${s.valueColor}`}
                >
                  {value ?? 0}
                </span>
                <span
                  className={`mb-1 inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${s.badge}`}
                >
                  pending
                </span>
              </div>
            )}
          </div>

          {/* Right: icon */}
          <div className={`shrink-0 rounded-xl p-2.5 ${s.iconBg}`}>
            <Icon className={`size-5 ${s.iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
