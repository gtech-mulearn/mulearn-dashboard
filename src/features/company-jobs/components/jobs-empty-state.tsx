import { Briefcase, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

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
      <div className="flex min-h-[300px] flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-card/50 p-8">
        <div className="rounded-full bg-muted p-4">
          <Briefcase className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">
          No matching jobs
        </h3>
        <p className="max-w-sm text-center text-sm text-muted-foreground">
          No jobs match your current search. Try adjusting your search terms.
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-6 rounded-xl border border-dashed border-border bg-card/50 p-8">
      <div className="rounded-full bg-primary/10 p-5">
        <Briefcase className="h-10 w-10 text-primary" />
      </div>
      <div className="text-center">
        <h3 className="text-xl font-semibold text-foreground">
          No jobs posted yet
        </h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Start attracting talent by creating your first job listing. It only
          takes a few minutes.
        </p>
      </div>
      <Button onClick={onCreateJob} size="lg" className="gap-2">
        <Plus className="h-4 w-4" />
        Create your first job
      </Button>
    </div>
  );
}
