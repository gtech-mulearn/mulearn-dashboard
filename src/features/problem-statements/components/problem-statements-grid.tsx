import { Button } from "@/components/ui/button";
import { StateDisplay } from "@/components/ui/state-display";
import type { ProblemStatement } from "../types/problem-statement.types";
import { ProblemStatementCardComponent } from "./problem-statement-card";

interface ProblemStatementsGridProps {
  statements: ProblemStatement[];
  isManageView?: boolean;
  onView?: (statement: ProblemStatement) => void;
  onCreateStatement?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function ProblemStatementsGrid({
  statements,
  isManageView,
  onView,
  onCreateStatement,
  emptyTitle,
  emptyDescription,
}: ProblemStatementsGridProps) {
  if (statements.length === 0) {
    return (
      <StateDisplay
        variant="no-results"
        className="rounded-2xl border border-dashed border-border bg-muted/40"
        title={
          emptyTitle ??
          (isManageView
            ? "No problem statements yet"
            : "No problem statements found")
        }
        description={
          emptyDescription ??
          (isManageView
            ? "Create your first problem statement to start connecting with learners."
            : "Check back soon or try adjusting your filters.")
        }
        action={
          isManageView && onCreateStatement ? (
            <Button
              variant="default"
              className="rounded-xl"
              onClick={onCreateStatement}
            >
              Create Problem Statement
            </Button>
          ) : null
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {statements.map((statement, index) => (
        <div
          key={statement.id}
          style={{ animationDelay: `${index * 50}ms` }}
          className="h-full"
        >
          <ProblemStatementCardComponent
            statement={statement}
            isManageView={isManageView}
            onView={onView}
          />
        </div>
      ))}
    </div>
  );
}
