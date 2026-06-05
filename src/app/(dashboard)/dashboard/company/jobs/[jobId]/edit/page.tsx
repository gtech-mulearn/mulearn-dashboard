"use client";

/**
 * Edit Job Page
 *
 * 📍 src/app/(dashboard)/dashboard/company/jobs/[jobId]/edit/page.tsx
 *
 * Pre-fills the stepper with existing job data for editing.
 */

import { AlertTriangle, ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  CompanyStatusGuard,
  JobDetailSkeleton,
  JobStepper,
} from "@/features/company-jobs/components";
import { useJobDetail, useUpdateJob } from "@/features/company-jobs/hooks";
import type { JobFormValues } from "@/features/company-jobs/schemas";
import type { JobRule } from "@/features/company-jobs/types";

export default function EditJobPage() {
  const params = useParams<{ jobId: string }>();
  const router = useRouter();
  const jobId = params.jobId;

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
          payload: {
            title: values.title,
            experience: values.experience,
            job_description: values.job_description,
            location: values.location,
            salary_range: values.salary_range,
            job_type: values.job_type,
            // Advanced options — always send to allow clearing values
            karma_reward: values.karma_reward,
            duration_value: values.duration_value,
            duration_unit: values.duration_unit,
            hourly_rate: values.hourly_rate || undefined,
            deliverables: values.deliverables || undefined,
            stipend: values.stipend || undefined,
            certificate_provided: values.certificate_provided,
          },
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
              {error instanceof Error
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
