"use client";

import { Sparkles } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { MOCK_EXPERTISE_TAGS } from "../../constants/mock-mentor";

export function AvailabilityCard() {
  const [available, setAvailable] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(
    new Set(["React", "TypeScript", "Career Planning"]),
  );

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
      <CardHeader className="flex-row items-center gap-2.5 px-5 py-4">
        <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/10">
          <Sparkles className="size-4 text-amber-500" />
        </div>
        <CardTitle className="text-base font-bold text-foreground">
          Availability & Expertise
        </CardTitle>
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
              available ? "bg-emerald-500" : "bg-muted-foreground/30",
            )}
          >
            <span
              className={cn(
                "pointer-events-none inline-block size-5 rounded-full bg-white shadow-lg transition-transform",
                available ? "translate-x-5" : "translate-x-0",
              )}
            />
          </button>
        </div>

        <div>
          <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
            Expertise
          </p>
          <div className="flex flex-wrap gap-2">
            {MOCK_EXPERTISE_TAGS.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                  selected.has(tag)
                    ? "bg-indigo-500/20 text-indigo-600 dark:text-indigo-400"
                    : "bg-muted text-muted-foreground hover:bg-muted/80",
                )}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
