import type * as React from "react";

import { cn } from "@/lib/utils";

/**
 * DropdownEmpty — the one empty state every dropdown on the platform shows.
 *
 * 📍 src/components/ui/dropdown-empty.tsx
 *
 * Used by Select, Combobox, MultiSelect and CommandEmpty so an empty list
 * never opens as a blank panel and always reads the same. Pass children only
 * for a genuine prompt (e.g. "Type at least 2 characters"), never to reword
 * the no-results message per screen.
 */
export const NO_RESULTS_TEXT = "No results found.";

export const DROPDOWN_EMPTY_CLASS =
  "py-4 text-center text-sm text-muted-foreground";

export function DropdownEmpty({
  className,
  children = NO_RESULTS_TEXT,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dropdown-empty"
      className={cn(DROPDOWN_EMPTY_CLASS, className)}
      {...props}
    >
      {children}
    </div>
  );
}
