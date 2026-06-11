"use client";

import { AlertTriangle } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CompanyStatusGuard,
  JobDetailSkeleton,
  JobDetailView,
} from "@/features/company-jobs/components";
import {
  useCreateJobRule,
  useDeleteJob,
  useDeleteJobRule,
  useJobDetail,
} from "@/features/company-jobs/hooks";
import type { RuleFormValues } from "@/features/company-jobs/schemas";

export default function JobDetailPage() {
  const params = useParams<{ jobId: string }>();
  const router = useRouter();
  const jobId = params.jobId;

  const { data: job, isLoading, isError, error } = useJobDetail(jobId);
  const deleteJobMutation = useDeleteJob();
  const createRuleMutation = useCreateJobRule(jobId);
  const deleteRuleMutation = useDeleteJobRule(jobId);

  const [deletingRuleId, setDeletingRuleId] = useState<string | null>(null);

  const handleBack = useCallback(() => {
    router.push("/dashboard/company/jobs");
  }, [router]);

  const handleEdit = useCallback(
    (id: string) => {
      router.push(`/dashboard/company/jobs/${id}/edit`);
    },
    [router],
  );

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteJobMutation.mutateAsync(id);
        router.push("/dashboard/company/jobs");
      } catch {
        // Error handled by mutation's onError
      }
    },
    [deleteJobMutation, router],
  );

  const handleAddRule = useCallback(
    (values: RuleFormValues) => {
      createRuleMutation.mutate({
        rule_type: values.rule_type,
        rule_value: values.rule_value,
      });
    },
    [createRuleMutation],
  );

  const handleDeleteRule = useCallback(
    (ruleId: string) => {
      setDeletingRuleId(ruleId);
      deleteRuleMutation.mutate(ruleId, {
        onSettled: () => setDeletingRuleId(null),
      });
    },
    [deleteRuleMutation],
  );

  return (
    <CompanyStatusGuard>
      <div className="p-1">
        {/* Loading */}
        {isLoading && <JobDetailSkeleton />}

        {/* Error */}
        {isError && !isLoading && (
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
            <div className="rounded-full bg-destructive/10 p-4">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              Job not found
            </h2>
            <p className="max-w-md text-center text-sm text-muted-foreground">
              {error instanceof Error
                ? error.message
                : "The job you're looking for doesn't exist or has been deleted."}
            </p>
            <Button variant="outline" onClick={handleBack}>
              Back to Jobs
            </Button>
          </div>
        )}

        {/* Detail */}
        {!isLoading && !isError && job && (
          <JobDetailView
            job={job}
            onBack={handleBack}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onAddRule={handleAddRule}
            onDeleteRule={handleDeleteRule}
            isDeleting={deleteJobMutation.isPending}
            isAddingRule={createRuleMutation.isPending}
            deletingRuleId={deletingRuleId}
          />
        )}
      </div>
    </CompanyStatusGuard>
  );
}
