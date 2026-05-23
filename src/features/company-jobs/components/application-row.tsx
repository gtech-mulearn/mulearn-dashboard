/**
 * ApplicationRow
 *
 * 📍 src/features/company-jobs/components/application-row.tsx
 *
 * A row in the learner's "My Applications" tab.
 */

import type { LearnerApplication } from "../types";
import { ApplicationStatusBadge } from "./application-status-badge";

interface ApplicationRowProps {
  application: LearnerApplication;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function ApplicationRow({ application }: ApplicationRowProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:bg-muted/30">
      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-medium text-foreground">
          {application.job_title}
        </p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
          <span className="capitalize">
            {application.job_type.replace(/_/g, " ")}
          </span>
          <span>·</span>
          <span>{application.company_name}</span>
          <span>·</span>
          <span>{formatDate(application.created_at)}</span>
        </div>
      </div>
      <ApplicationStatusBadge status={application.status} />
    </div>
  );
}
