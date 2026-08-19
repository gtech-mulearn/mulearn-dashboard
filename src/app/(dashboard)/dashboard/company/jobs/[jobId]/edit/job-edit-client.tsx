"use client";

/**
 * Edit Job Page Client
 *
 * Pre-fills the stepper with existing job data for editing.
 */

import { AlertTriangle, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  CompanyStatusGuard,
  JobDetailSkeleton,
  JobStepper,
} from "@/features/company-jobs/components";
import { useJobDetail, useUpdateJob } from "@/features/company-jobs/hooks";
import { buildUpdateJobPayload } from "@/features/company-jobs/lib";
import type { JobFormValues } from "@/features/company-jobs/schemas";
import type { JobRule } from "@/features/company-jobs/types";

interface EditJobPageClientProps {
  jobId: string;
}

export function EditJobPageClient({ jobId }: EditJobPageClientProps) {
  const router = useRouter();

  const { data: job, isLoading, isError, error } = useJobDetail(jobId);
  const updateJobMutation = useUpdateJob();

  const handleCancel = useCallback(() => {
    router.push(`/dashboard/company/jobs/${jobId}`);
  }, [router, jobId]);

  const handleSubmit = useCallback(
    async (values: JobFormValues, _rules: JobRule[]) => {
      try {
        await updateJobMutation.mutateAsync({
          jobId,
          payload: buildUpdateJobPayload(values),
        });

        router.push(`/dashboard/company/jobs/${jobId}`);
      } catch {
        // Error handled by mutation's onError
      }
    },
    [jobId, updateJobMutation, router],
  );

  return (
    <CompanyStatusGuard>
      <div className="space-y-6 p-1">
        {/* Loading */}
        {isLoading && <JobDetailSkeleton />}

        {/* Error */}
        {isError && !isLoading && (
          <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
            <div className="rounded-full bg-destructive/10 p-4">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">
              Unable to load job
            </h2>
            <p className="text-sm text-muted-foreground">
              {process.env.NODE_ENV === "development" && error instanceof Error
                ? error.message
                : "Please try again later."}
            </p>
            <Button variant="outline" onClick={handleCancel}>
              Go Back
            </Button>
          </div>
        )}

        {/* Edit stepper */}
        {!isLoading && !isError && job && (
          <>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                className="gap-1.5 text-muted-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Edit Job
                </h1>
                <p className="text-sm text-muted-foreground">
                  Update &ldquo;{job.title}&rdquo;
                </p>
              </div>
            </div>

            <JobStepper
              initialJob={job}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              isSubmitting={updateJobMutation.isPending}
            />
          </>
        )}
      </div>
    </CompanyStatusGuard>
  );
}
