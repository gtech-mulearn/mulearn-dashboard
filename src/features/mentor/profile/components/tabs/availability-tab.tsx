/**
 * Availability Tab
 *
 * 📍 src/features/mentor/profile/components/tabs/availability-tab.tsx
 *
 * Read-only view of the mentor's weekly availability slots.
 * Edit is done via the existing Sessions area.
 */

"use client";

import { Clock, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAvailabilitySlots } from "@/features/mentor/hooks";

// Weekday mapping: the API uses 1=Mon … 7=Sun
const DAY_LABELS: Record<number, string> = {
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
  7: "Sunday",
};

function formatTime(t: string): string {
  const [hStr, mStr] = t.split(":");
  const h = Number(hStr);
  const m = mStr ?? "00";
  const period = h >= 12 ? "PM" : "AM";
  const displayH = h % 12 === 0 ? 12 : h % 12;
  return `${displayH}:${m} ${period}`;
}

export function AvailabilityTab() {
  const { data: schedule, isLoading } = useAvailabilitySlots();

  return (
    <Card className="rounded-2xl border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold">
          <Clock className="h-4 w-4 text-muted-foreground" />
          Weekly Availability
        </CardTitle>
        <Button asChild size="sm" variant="outline" className="gap-1.5 text-xs">
          <Link href="/dashboard#weekly-availability">
            Edit <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        ) : !schedule || schedule.length === 0 ? (
          <div className="flex min-h-[100px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-muted-foreground">
            <Clock className="h-8 w-8 opacity-30" />
            <p className="text-sm">No availability set.</p>
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard#weekly-availability">
                Set Availability
              </Link>
            </Button>
          </div>
        ) : (
          <ul className="space-y-2">
            {[...schedule]
              .sort((a, b) => a.day - b.day)
              .map((dayEntry) => (
                <li
                  key={dayEntry.day}
                  className="flex items-start gap-4 rounded-xl border border-border/50 bg-muted/30 px-4 py-3"
                >
                  <span className="w-24 shrink-0 text-sm font-medium">
                    {DAY_LABELS[dayEntry.day] ?? `Day ${dayEntry.day}`}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {dayEntry.slots.map((slot) => (
                      <span
                        key={`${slot.start}-${slot.end}`}
                        className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary ring-1 ring-primary/20"
                      >
                        {formatTime(slot.start)} – {formatTime(slot.end)}
                      </span>
                    ))}
                  </div>
                </li>
              ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
