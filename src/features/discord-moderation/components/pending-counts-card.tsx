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
import type React from "react";
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
    cardStyle: {
      borderColor: "color-mix(in srgb, var(--chart-1) 30%, transparent)",
    } as React.CSSProperties,
    barStyle: { backgroundColor: "var(--chart-1)" } as React.CSSProperties,
    iconStyle: {
      backgroundColor:
        "color-mix(in srgb, var(--chart-1) 14%, var(--background))",
      color: "var(--chart-1)",
    } as React.CSSProperties,
    valueStyle: { color: "var(--chart-1)" } as React.CSSProperties,
    badgeStyle: {
      backgroundColor: "var(--chart-1)",
      color: "var(--primary-foreground)",
      borderColor: "transparent",
    } as React.CSSProperties,
  },
  purple: {
    cardStyle: {
      borderColor: "color-mix(in srgb, var(--chart-2) 30%, transparent)",
    } as React.CSSProperties,
    barStyle: { backgroundColor: "var(--chart-2)" } as React.CSSProperties,
    iconStyle: {
      backgroundColor:
        "color-mix(in srgb, var(--chart-2) 14%, var(--background))",
      color: "var(--chart-2)",
    } as React.CSSProperties,
    valueStyle: { color: "var(--chart-2)" } as React.CSSProperties,
    badgeStyle: {
      backgroundColor: "var(--chart-2)",
      color: "var(--primary-foreground)",
      borderColor: "transparent",
    } as React.CSSProperties,
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
      className="relative overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-md"
      style={s.cardStyle}
    >
      {/* Coloured top bar */}
      <div className="absolute inset-x-0 top-0 h-1" style={s.barStyle} />

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
                  className="text-5xl font-extrabold leading-none tracking-tight"
                  style={s.valueStyle}
                >
                  {value ?? 0}
                </span>
                <span
                  className="mb-1 inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold"
                  style={s.badgeStyle}
                >
                  pending
                </span>
              </div>
            )}
          </div>

          {/* Right: icon */}
          <div className="shrink-0 rounded-xl p-2.5" style={s.iconStyle}>
            <Icon className="size-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
