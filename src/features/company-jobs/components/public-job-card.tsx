/**
 * PublicJobCard
 *
 * 📍 src/features/company-jobs/components/public-job-card.tsx
 *
 * Card for a single public job in the learner's Browse Jobs tab.
 * Uses only CSS-variable-derived colours (no raw Tailwind palette).
 */

import { Briefcase, Calendar, MapPin, Sparkles, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { PublicJob } from "../types";

interface PublicJobCardProps {
  job: PublicJob;
  onView: (job: PublicJob) => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function PublicJobCard({ job, onView }: PublicJobCardProps) {
  return (
    <button
      type="button"
      onClick={() => onView(job)}
      className="group relative w-full rounded-2xl border border-border bg-card p-5 text-left transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
    >
      {/* Karma reward pill */}
      {job.karma_reward ? (
        <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
          <Sparkles className="h-3 w-3" />+{job.karma_reward}
        </div>
      ) : null}

      {/* Title + meta */}
      <div className="pr-20">
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
          {job.title}
        </h3>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1 capitalize">
            <Briefcase className="h-3 w-3" />
            {job.job_type.replace(/_/g, " ")}
          </span>
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {job.location}
          </span>
          {job.salary_range && (
            <span className="font-medium text-foreground">
              {job.salary_range}
            </span>
          )}
        </div>
      </div>

      {/* Requirement badges — uses semantic CSS variables only */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {/* Empty placeholder if no stipend or cert, since badges are optional now */}
        {job.stipend && (
          <Badge variant="outline" className="text-xs">
            Stipend: {job.stipend}
          </Badge>
        )}
        {job.certificate_provided && (
          <Badge variant="outline" className="gap-1 text-xs">
            <Star className="h-3 w-3" />
            Certificate
          </Badge>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {formatDate(job.created_at)}
        </span>
        <span className="text-xs font-medium text-primary group-hover:underline">
          View details →
        </span>
      </div>
    </button>
  );
}
