"use client";

/**
 * Create Job Page
 *
 * 📍 src/app/(dashboard)/dashboard/company/jobs/create/page.tsx
 *
 * 4-step stepper for creating a new job.
 * After creation, creates rules (if any) then redirects to detail page.
 */

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createJobRule } from "@/features/company-jobs/api";
import {
  CompanyStatusGuard,
  JobStepper,
} from "@/features/company-jobs/components";
import { useCreateJob } from "@/features/company-jobs/hooks";
import type { JobFormValues } from "@/features/company-jobs/schemas";
import type { JobRule } from "@/features/company-jobs/types";

export default function CreateJobPage() {
  const router = useRouter();
  const createJobMutation = useCreateJob();

  const handleCancel = useCallback(() => {
    router.push("/dashboard/company/jobs");
  }, [router]);

  const handleSubmit = useCallback(
    async (values: JobFormValues, rules: JobRule[]) => {
      try {
        const result = await createJobMutation.mutateAsync({
          title: values.title,
          experience: values.experience,
          job_description: values.job_description,
          location: values.location,
          salary_range: values.salary_range,
          job_type: values.job_type,
          min_karma: values.min_karma,
          min_level: values.min_level,
          // Advanced options — only include if set
          ...(values.karma_reward !== undefined && {
            karma_reward: values.karma_reward,
          }),
          ...(values.duration_value !== undefined && {
            duration_value: values.duration_value,
          }),
          ...(values.duration_unit && { duration_unit: values.duration_unit }),
          ...(values.hourly_rate && { hourly_rate: values.hourly_rate }),
          ...(values.deliverables && { deliverables: values.deliverables }),
          ...(values.stipend && { stipend: values.stipend }),
          ...(values.certificate_provided !== undefined &&
            values.certificate_provided !== false && {
              certificate_provided: values.certificate_provided,
            }),
        });

        const jobId = result.job.id;

        // Create rules sequentially (if any were added during creation)
        if (rules.length > 0) {
          for (const rule of rules) {
            try {
              await createJobRule(jobId, {
                rule_type: rule.rule_type,
                rule_type_id: rule.rule_type_id,
              });
            } catch {
              // Individual rule failure shouldn't block navigation
              toast.error(
                `Failed to add rule "${rule.rule_name}". You can add it from the job detail page.`,
              );
            }
          }
        }

        router.push(`/dashboard/company/jobs/${jobId}`);
      } catch {
        // Error is handled by the mutation's onError handler
      }
    },
    [createJobMutation, router],
  );

  return (
    <CompanyStatusGuard>
      <div className="space-y-6 px-1 py-1 sm:px-2">
        {/* Page title */}
        <div className="flex items-start gap-3 sm:items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="mt-0.5 shrink-0 gap-1.5 text-muted-foreground sm:mt-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
              Create Job
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Post a new job listing in 4 easy steps
            </p>
          </div>
        </div>

        {/* Stepper */}
        <JobStepper
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={createJobMutation.isPending}
        />
      </div>
    </CompanyStatusGuard>
  );
}
