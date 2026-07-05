import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StateDisplay } from "@/components/ui/state-display";

interface JobsEmptyStateProps {
  onCreateJob: () => void;
  hasSearchFilter?: boolean;
}

export function JobsEmptyState({
  onCreateJob,
  hasSearchFilter,
}: JobsEmptyStateProps) {
  if (hasSearchFilter) {
    return (
      <StateDisplay
        variant="no-results"
        size="sm"
        className="min-h-75 rounded-xl border border-dashed border-border bg-card/50"
        title="No matching jobs"
        description="No jobs match your current search. Try adjusting your search terms."
      />
    );
  }

  return (
    <StateDisplay
      variant="no-results"
      className="min-h-100 rounded-xl border border-dashed border-border bg-card/50"
      title="No jobs posted yet"
      description="Start attracting talent by creating your first job listing. It only takes a few minutes."
      action={
        <Button onClick={onCreateJob} size="lg" className="gap-2">
          <Plus className="h-4 w-4" />
          Create your first job
        </Button>
      }
    />
  );
}
