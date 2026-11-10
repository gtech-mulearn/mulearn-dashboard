import type { ReactNode } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { StateDisplay } from "@/components/ui/state-display";
import type { ProblemStatement } from "../types/problem-statement.types";
import { ProblemStatementCardComponent } from "./problem-statement-card";

interface ProblemStatementsGridProps {
  statements: ProblemStatement[];
  isManageView?: boolean;
  onView: (statement: ProblemStatement) => void;
  emptyTitle: string;
  emptyDescription: string;
  emptyAction?: ReactNode;
}

export function ProblemStatementsGrid({
  statements,
  isManageView,
  onView,
  emptyTitle,
  emptyDescription,
  emptyAction,
}: ProblemStatementsGridProps) {
  if (statements.length === 0) {
    return (
      <StateDisplay
        variant="no-results"
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {statements.map((statement) => (
        <ProblemStatementCardComponent
          key={statement.id}
          statement={statement}
          isManageView={isManageView}
          onView={onView}
        />
      ))}
    </div>
  );
}

/** Loading placeholder shaped like the card / table it stands in for. */
export function ProblemStatementsListSkeleton({
  viewMode,
}: {
  viewMode: "board" | "table";
}) {
  const keys = ["s1", "s2", "s3", "s4", "s5", "s6"];
  if (viewMode === "table") {
    return (
      <div className="overflow-hidden rounded-2xl border border-border bg-card">
        {keys.map((key) => (
          <div
            key={key}
            className="flex items-center gap-4 border-b border-border px-4 py-3 last:border-0"
          >
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3 rounded" />
              <Skeleton className="h-3 w-1/4 rounded" />
            </div>
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {keys.map((key) => (
        <div
          key={key}
          className="space-y-3 rounded-2xl border border-border bg-card p-5"
        >
          <Skeleton className="h-4 w-1/3 rounded" />
          <Skeleton className="h-5 w-3/4 rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-3 w-full rounded" />
        </div>
      ))}
    </div>
  );
}
