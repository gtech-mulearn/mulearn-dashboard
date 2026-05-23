/**
 * ApplicationStatusBadge
 *
 * 📍 src/features/company-jobs/components/application-status-badge.tsx
 *
 * Reusable status badge for applicant/application statuses.
 * Colours come exclusively from CSS variables defined in globals.css.
 */

import { cn } from "@/lib/utils";
import type { AppStatus } from "../constants";
import { APP_STATUS_META } from "../constants";

interface ApplicationStatusBadgeProps {
  status: AppStatus;
  className?: string;
}

export function ApplicationStatusBadge({
  status,
  className,
}: ApplicationStatusBadgeProps) {
  const meta = APP_STATUS_META[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        meta.badgeClass,
        className,
      )}
    >
      {/* Status dot — colour from CSS variable */}
      <span
        className="h-1.5 w-1.5 rounded-full shrink-0"
        style={{ backgroundColor: meta.dotVar }}
      />
      {meta.label}
    </span>
  );
}
