import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PageHeaderProps {
  /** Main heading text. */
  title: ReactNode;
  /** Optional supporting copy shown beneath the title. */
  description?: ReactNode;
  /** Optional action (button, search input, etc.) aligned to the right. */
  action?: ReactNode;
  className?: string;
}

/**
 * Shared page/section header used across the dashboard so every section
 * renders its title and subtitle with the same typography.
 */
export function PageHeader({
  title,
  description,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
