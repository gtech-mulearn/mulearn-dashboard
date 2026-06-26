"use client";

import { Sparkles } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type Props = {
  expertise: string[];
  isLoading: boolean;
};

export function AvailabilityCard({ expertise, isLoading }: Props) {
  const [available, setAvailable] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set(expertise));

  function toggleTag(tag: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }

  return (
    <Card className="rounded-2xl border bg-card shadow-sm">
      <CardHeader className="px-5 py-4">
        <div className="flex flex-row items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-warning/10">
            <Sparkles className="size-4 text-warning" />
          </div>
          <CardTitle className="text-base font-bold text-foreground">
            Availability &amp; Expertise
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 px-5 pb-5 pt-0">
        <div className="flex items-center justify-between rounded-xl border bg-muted/40 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Available for mentoring
            </p>
            <p className="text-[11px] text-muted-foreground">
              {available ? "Accepting new mentees" : "Not accepting requests"}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={available}
            onClick={() => setAvailable((v) => !v)}
            className={cn(
              "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
              available ? "bg-success" : "bg-muted-foreground/30",
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block size-5 rounded-full bg-card shadow-lg transition-transform",
                available ? "translate-x-5" : "translate-x-0",
              )}
            />
          </button>
        </div>

        <div>
          <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Expertise
          </p>
          {isLoading ? (
            <div className="flex flex-wrap gap-2">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-6 w-20 rounded-full" />
              ))}
            </div>
          ) : expertise.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No expertise tags set.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {expertise.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                    selected.has(tag)
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 text-muted-foreground",
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
