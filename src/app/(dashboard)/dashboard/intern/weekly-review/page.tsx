import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { WeeklyReviewForm } from "@/features/intern";

export default function WeeklyReviewPage() {
  return (
    <div className="flex-1 space-y-8 p-8 pt-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Weekly Review
          </h2>
          <p className="text-muted-foreground mt-1">
            Submit your progress for the current week. Reviews lock at{" "}
            <strong>Sunday 23:59 UTC</strong>. Once locked, you cannot submit or
            edit your review for the week.
          </p>
        </div>
        <Badge
          variant="outline"
          className="px-3 py-1 bg-brand-purple/10 text-brand-purple border-brand-purple/30 text-sm gap-1.5"
        >
          <Sparkles className="w-4 h-4" />
          Week 13 Open
        </Badge>
      </div>

      <div className="space-y-6">
        <WeeklyReviewForm />
      </div>
    </div>
  );
}
