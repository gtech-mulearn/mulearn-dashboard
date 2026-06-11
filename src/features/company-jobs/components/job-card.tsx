import { Briefcase, Calendar, MapPin, Wallet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { JOB_STATUS_CONFIG } from "../constants";
import type { Job } from "../types";

interface JobCardProps {
  job: Job;
  onView: (jobId: string) => void;
}

export function JobCard({ job, onView }: JobCardProps) {
  const statusConfig =
    JOB_STATUS_CONFIG[job.status as keyof typeof JOB_STATUS_CONFIG] ??
    JOB_STATUS_CONFIG.Active;

  const dateObj = job.created_at ? new Date(job.created_at) : null;
  const formattedDate =
    dateObj && !isNaN(dateObj.getTime())
      ? dateObj.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "N/A";

  return (
    <div className="group relative rounded-xl border border-border bg-card p-5 transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold text-foreground group-hover:text-primary transition-colors">
            {job.title}
          </h3>
          <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Briefcase className="h-3 w-3 shrink-0" />
            <span>{job.job_type}</span>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${statusConfig.bgColor} ${statusConfig.textColor}`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${statusConfig.dotColor}`}
          />
          {statusConfig.label}
        </span>
      </div>

      {/* Details */}
      <div className="mt-3 space-y-1.5">
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">{job.location}</span>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Wallet className="h-3.5 w-3.5 shrink-0" />
          <span>{job.salary_range}</span>
        </div>
      </div>

      {/* Tags */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {job.rules.length > 0 && (
          <Badge variant="outline" className="text-xs">
            {job.rules.length} rule{job.rules.length > 1 ? "s" : ""}
          </Badge>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{formattedDate}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onView(job.id)}
          className="text-xs hover:text-primary text-brand-blue"
        >
          View details →
        </Button>
      </div>
    </div>
  );
}
