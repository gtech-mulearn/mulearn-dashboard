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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="space-y-4">
      {/* Date filter row */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <Label
            htmlFor="pending-date"
            className="text-xs font-medium text-muted-foreground"
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
            className="h-9 rounded-xl px-4"
            onClick={handleApply}
          >
            Apply
          </Button>
          {appliedDate && (
            <Button
              size="sm"
              variant="outline"
              className="h-9 rounded-xl px-4"
              onClick={handleClear}
            >
              Clear
            </Button>
          )}
        </div>
        {appliedDate && (
          <Badge
            variant="secondary"
            className="h-7 rounded-full text-xs font-medium"
          >
            {appliedDate}
          </Badge>
        )}
      </div>

      {/* Count cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <PendingStatCard
          icon={Users}
          label="Peer Pending"
          value={data?.peer_pending}
          colorClass="text-blue-500"
          bgClass="bg-blue-500/10"
          isLoading={isLoading}
          isError={isError}
        />
        <PendingStatCard
          icon={ClipboardCheck}
          label="Appraiser Pending"
          value={data?.appraise_pending}
          colorClass="text-purple-500"
          bgClass="bg-purple-500/10"
          isLoading={isLoading}
          isError={isError}
        />
      </div>
    </div>
  );
}

// ─── Inner stat card ──────────────────────────────────────────────────────────

interface PendingStatCardProps {
  icon: React.ElementType;
  label: string;
  value?: number;
  colorClass: string;
  bgClass: string;
  isLoading: boolean;
  isError: boolean;
}

function PendingStatCard({
  icon: Icon,
  label,
  value,
  colorClass,
  bgClass,
  isLoading,
  isError,
}: PendingStatCardProps) {
  return (
    <Card className="rounded-2xl border border-border bg-card shadow-sm">
      <CardHeader className="pb-2 pt-5 px-5">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {label}
          </CardTitle>
          <div className={`rounded-full p-2 ${bgClass}`}>
            <Icon className={`size-4 ${colorClass}`} />
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-5 pb-5">
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
            <span className="text-sm">Loading…</span>
          </div>
        ) : isError ? (
          <span className="text-sm text-destructive">Failed to load</span>
        ) : (
          <span className={`text-4xl font-bold tracking-tight ${colorClass}`}>
            {value ?? 0}
          </span>
        )}
      </CardContent>
    </Card>
  );
}
