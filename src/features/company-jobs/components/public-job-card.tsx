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
      {/* Title + meta */}
      <div className="pr-20">
        {job.company_name && (
          <div className="mb-1 text-xs font-medium text-muted-foreground flex items-center gap-1.5">
            {job.company_logo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={job.company_logo}
                alt={job.company_name}
                className="h-4 w-4 rounded object-cover"
              />
            ) : (
              <Briefcase className="h-3 w-3" />
            )}
            {job.company_name}
          </div>
        )}
        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
          {job.title}
        </h3>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          {job.job_type && (
            <span className="flex items-center gap-1 capitalize">
              <Briefcase className="h-3 w-3" />
              {job.job_type.replace(/_/g, " ")}
            </span>
          )}
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
        {job.created_at ? (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {formatDate(job.created_at)}
          </span>
        ) : (
          <span />
        )}
        <span className="text-xs font-medium text-primary group-hover:underline">
          View details →
        </span>
      </div>
    </button>
  );
}
