"use client";

import { Sparkles, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useWeeklyReviewCurrent, WeeklyReviewForm } from "@/features/intern";

function getISOWeekAndYear(date: Date = new Date()) {
  const target = new Date(date.valueOf());
  const dayNumber = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNumber + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  const week = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  const year = new Date(firstThursday).getFullYear();
  return { week, year };
}

export default function WeeklyReviewPage() {
  const { data: currentReview } = useWeeklyReviewCurrent();

  const weekInfo = currentReview
    ? { week: currentReview.iso_week, year: currentReview.iso_year }
    : getISOWeekAndYear();
  const weekNum = weekInfo.week;
  const yearNum = weekInfo.year;

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 max-w-7xl mx-auto w-full bg-background/50">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-brand-purple/10 text-brand-purple border-brand-purple/20 px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-widest">
              Weekly Achievement
            </Badge>
          </div>
          <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase flex items-center gap-3">
            Weekly Chronicles
          </h2>
          <p className="text-muted-foreground mt-1 font-medium italic">
            Chronicle your week's triumphs. The archive seals at{" "}
            <strong className="text-foreground">Sunday 23:59 UTC</strong>.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-card/40 backdrop-blur-md border border-border/40 p-4 rounded-2xl shadow-xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-purple/10 rounded-xl">
              <Trophy className="w-6 h-6 text-brand-purple" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-black text-brand-purple uppercase tracking-widest">
                Week {weekNum} &bull; {yearNum}
              </span>
              <span className="text-[10px] font-bold text-muted-foreground uppercase">
                Status: {currentReview ? "Submitted" : "Open"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <WeeklyReviewForm />
      </div>

      <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/20 py-12">
        <Sparkles className="w-3 h-3" /> Integrity is your greatest skill{" "}
        <Sparkles className="w-3 h-3" />
      </div>
    </div>
  );
}
