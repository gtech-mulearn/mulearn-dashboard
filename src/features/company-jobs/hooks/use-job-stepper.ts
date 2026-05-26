"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useMemo, useState } from "react";
import { type UseFormReturn, useForm } from "react-hook-form";
import { JOB_STEPPER_STEPS } from "../constants";
import {
  BasicInfoStepSchema,
  JobFormSchema,
  type JobFormValues,
  RequirementsStepSchema,
} from "../schemas";
import type { Job, StepId } from "../types";

// Per-step validation schemas
const STEP_SCHEMAS: Record<
  string,
  typeof BasicInfoStepSchema | typeof RequirementsStepSchema | null
> = {
  "basic-info": BasicInfoStepSchema,
  requirements: RequirementsStepSchema,
  rules: null, // Rules step has its own validation via the rule dialog
  review: null, // Review step just summarizes — no validation
};

// ─── Default values ─────────────────────────────────────────

const DEFAULT_VALUES: JobFormValues = {
  title: "",
  job_type: "",
  location: "",
  salary_range: "",
  experience: "",
  job_description: "",
  min_karma: 0,
  min_level: 1,
  karma_reward: undefined,
  duration_value: undefined,
  duration_unit: undefined,
  hourly_rate: "",
  deliverables: [],
  stipend: "",
  certificate_provided: false,
};

function jobToFormValues(job: Job): JobFormValues {
  return {
    title: job.title,
    job_type: job.job_type,
    location: job.location,
    salary_range: job.salary_range,
    experience: job.experience ?? "",
    job_description: job.job_description ?? "",
    min_karma: job.min_karma,
    min_level: job.min_level,
    karma_reward: job.karma_reward ?? undefined,
    duration_value: job.duration_value ?? undefined,
    duration_unit: job.duration_unit ?? undefined,
    hourly_rate: job.hourly_rate ?? "",
    deliverables: Array.isArray(job.deliverables)
      ? job.deliverables
      : job.deliverables
        ? [job.deliverables]
        : [],
    stipend: job.stipend ?? "",
    certificate_provided: job.certificate_provided ?? false,
  };
}

// ─── Hook ───────────────────────────────────────────────────

interface UseJobStepperOptions {
  /** Pass an existing job to prefill the form for editing */
  initialJob?: Job;
}

interface UseJobStepperReturn {
  form: UseFormReturn<JobFormValues>;
  currentStepIndex: number;
  currentStep: StepId;
  steps: typeof JOB_STEPPER_STEPS;
  isFirstStep: boolean;
  isLastStep: boolean;
  canGoNext: boolean;
  goToStep: (index: number) => Promise<void>;
  nextStep: () => Promise<void>;
  prevStep: () => void;
  getFormValues: () => JobFormValues;
  isEditing: boolean;
}

export function useJobStepper(
  options?: UseJobStepperOptions,
): UseJobStepperReturn {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const isEditing = !!options?.initialJob;

  const form = useForm<JobFormValues>({
    resolver: zodResolver(JobFormSchema),
    defaultValues: options?.initialJob
      ? jobToFormValues(options.initialJob)
      : DEFAULT_VALUES,
    mode: "onTouched", // validate on blur, not on every keystroke
  });

  const currentStep = JOB_STEPPER_STEPS[currentStepIndex].id;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === JOB_STEPPER_STEPS.length - 1;

  // Fields that belong to each step — used for partial validation
  const STEP_FIELDS: Record<string, (keyof JobFormValues)[]> = useMemo(
    () => ({
      "basic-info": ["title", "job_type", "location", "salary_range"],
      requirements: ["experience", "job_description", "min_karma", "min_level"],
      rules: [],
      review: [],
    }),
    [],
  );

  /**
   * Validate only the fields belonging to the current step.
   * Returns true if the step is valid.
   */
  const validateCurrentStep = useCallback(async (): Promise<boolean> => {
    const stepId = JOB_STEPPER_STEPS[currentStepIndex].id;
    const fields = STEP_FIELDS[stepId];

    if (!fields || fields.length === 0) return true;

    const result = await form.trigger(fields);
    return result;
  }, [currentStepIndex, form, STEP_FIELDS]);

  const nextStep = useCallback(async () => {
    const isValid = await validateCurrentStep();
    if (!isValid) return;

    if (currentStepIndex < JOB_STEPPER_STEPS.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    }
  }, [currentStepIndex, validateCurrentStep]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }, [currentStepIndex]);

  const goToStep = useCallback(
    async (index: number) => {
      if (index < 0 || index >= JOB_STEPPER_STEPS.length) return;

      // Can always go backwards without validation
      if (index < currentStepIndex) {
        setCurrentStepIndex(index);
        return;
      }

      // Going forward: validate all intermediate steps
      for (let i = currentStepIndex; i < index; i++) {
        const stepId = JOB_STEPPER_STEPS[i].id;
        const fields = STEP_FIELDS[stepId];
        if (fields && fields.length > 0) {
          const valid = await form.trigger(fields);
          if (!valid) {
            setCurrentStepIndex(i);
            return;
          }
        }
      }

      setCurrentStepIndex(index);
    },
    [currentStepIndex, form, STEP_FIELDS],
  );

  const getFormValues = useCallback(() => form.getValues(), [form]);

  // We use schema existence as a proxy for "can progress" — steps without
  // schemas (rules, review) always allow progression
  const canGoNext = !STEP_SCHEMAS[currentStep];

  return {
    form,
    currentStepIndex,
    currentStep,
    steps: JOB_STEPPER_STEPS,
    isFirstStep,
    isLastStep,
    canGoNext,
    goToStep,
    nextStep,
    prevStep,
    getFormValues,
    isEditing,
  };
}
