"use client";

/**
 * useJobStepper — wizard state + validation for the job create/edit form
 *
 * 📍 src/features/company-jobs/hooks/use-job-stepper.ts
 *
 * Validation model
 * ────────────────
 * One resolver over the whole `JobFormSchema`, and a per-step *field list* used
 * to decide which subset RHF should validate when advancing. The field lists
 * are derived from the chosen job type, so a Full-Time listing is never blocked
 * (or silently invalidated) by a gig-only field it was never shown.
 *
 * Previously the advanced fields were absent from these lists entirely, so an
 * invalid value could survive to the Review step, fail `handleSubmit`, and
 * write its error onto an input that Review does not render — leaving the
 * submit button looking inert. `submitAll` now reports which step is at fault
 * so the caller can jump the user back to it.
 */

import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FieldErrors, UseFormReturn } from "react-hook-form";
import { useForm } from "react-hook-form";
import {
  COMPENSATION_FIELD,
  getJobTypeFieldModel,
  JOB_STEPPER_STEPS,
} from "../constants";
import { JobFormSchema, type JobFormValues } from "../schemas";
import type { Job, StepId } from "../types";

// ─── Default values ─────────────────────────────────────────

const DEFAULT_VALUES: JobFormValues = {
  title: "",
  job_type: "",
  location: "",
  salary_range: "",
  experience: "",
  job_description: "",

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
    salary_range: job.salary_range ?? "",
    experience: job.experience ?? "",
    job_description: job.job_description ?? "",

    duration_value: job.duration_value ?? undefined,
    duration_unit: job.duration_unit ?? undefined,
    hourly_rate: job.hourly_rate ?? "",
    deliverables: Array.isArray(job.deliverables)
      ? job.deliverables.map((d) =>
          typeof d === "string" ? d : JSON.stringify(d),
        )
      : typeof job.deliverables === "string"
        ? [job.deliverables]
        : typeof job.deliverables === "object" && job.deliverables !== null
          ? Object.entries(job.deliverables).map(([k, v]) => `${k}: ${v}`)
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
  /** Steps the user has already reached — safe to jump back to. */
  furthestStepReached: number;
  /** Fields that belong to each step, given the current job type. */
  fieldsByStep: Record<StepId, (keyof JobFormValues)[]>;
  /** Steps that currently hold at least one error, for the header indicator. */
  invalidSteps: Set<number>;
  goToStep: (index: number) => Promise<void>;
  nextStep: () => Promise<void>;
  prevStep: () => void;
  /**
   * Validates the entire form. Resolves `true` when the form may be submitted;
   * on failure it moves the user to the first step holding an error and
   * resolves `false`.
   */
  submitAll: () => Promise<boolean>;
  getFormValues: () => JobFormValues;
  isEditing: boolean;
}

export function useJobStepper(
  options?: UseJobStepperOptions,
): UseJobStepperReturn {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [furthestStepReached, setFurthestStepReached] = useState(0);
  const isEditing = !!options?.initialJob;

  const form = useForm<JobFormValues>({
    resolver: zodResolver(JobFormSchema),
    defaultValues: options?.initialJob
      ? jobToFormValues(options.initialJob)
      : DEFAULT_VALUES,
    // Validate on blur first, then live once a field has been corrected —
    // errors appear as the user works rather than all at once on submit.
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const currentStep = JOB_STEPPER_STEPS[currentStepIndex].id;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === JOB_STEPPER_STEPS.length - 1;

  const jobType = form.watch("job_type");
  const fieldModel = useMemo(() => getJobTypeFieldModel(jobType), [jobType]);

  /**
   * Field lists per step, narrowed to what this job type actually shows.
   * Validating a field the user was never shown would block them on an error
   * they cannot see.
   */
  const fieldsByStep = useMemo<Record<StepId, (keyof JobFormValues)[]>>(() => {
    const engagement: (keyof JobFormValues)[] = [];
    if (fieldModel.duration) engagement.push("duration_value", "duration_unit");
    if (fieldModel.deliverables) engagement.push("deliverables");
    if (fieldModel.certificate) engagement.push("certificate_provided");

    return {
      "basic-info": [
        "title",
        "job_type",
        "location",
        COMPENSATION_FIELD[fieldModel.compensation],
      ],
      requirements: ["experience", "job_description", ...engagement],
      // Rules are managed as local state and validated by the add-rule dialog.
      rules: [],
      // Review renders no inputs of its own.
      review: [],
    };
  }, [fieldModel]);

  /**
   * When the job type changes, drop values for fields that no longer apply.
   * Without this a salary typed before switching to Gig would linger in form
   * state as a ghost value.
   */
  const previousJobType = useRef(jobType);
  useEffect(() => {
    if (previousJobType.current === jobType) return;
    previousJobType.current = jobType;

    const model = getJobTypeFieldModel(jobType);
    const clears: [keyof JobFormValues, JobFormValues[keyof JobFormValues]][] =
      [];

    if (model.compensation !== "salary") clears.push(["salary_range", ""]);
    if (model.compensation !== "stipend") clears.push(["stipend", ""]);
    if (model.compensation !== "hourly") clears.push(["hourly_rate", ""]);
    if (!model.duration) {
      clears.push(["duration_value", undefined], ["duration_unit", undefined]);
    }
    if (!model.deliverables) clears.push(["deliverables", []]);
    if (!model.certificate) clears.push(["certificate_provided", false]);

    for (const [name, value] of clears) {
      form.setValue(name, value as never, {
        shouldDirty: false,
        shouldValidate: false,
      });
      form.clearErrors(name);
    }
  }, [jobType, form]);

  /** Validates the fields belonging to one step. */
  const validateStep = useCallback(
    async (index: number): Promise<boolean> => {
      const fields = fieldsByStep[JOB_STEPPER_STEPS[index].id];
      if (!fields || fields.length === 0) return true;
      return form.trigger(fields);
    },
    [fieldsByStep, form],
  );

  const goToIndex = useCallback((index: number) => {
    setCurrentStepIndex(index);
    setFurthestStepReached((prev) => Math.max(prev, index));
  }, []);

  const nextStep = useCallback(async () => {
    if (!(await validateStep(currentStepIndex))) return;
    if (currentStepIndex < JOB_STEPPER_STEPS.length - 1) {
      goToIndex(currentStepIndex + 1);
    }
  }, [currentStepIndex, validateStep, goToIndex]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) setCurrentStepIndex(currentStepIndex - 1);
  }, [currentStepIndex]);

  /**
   * Header navigation. Moving backwards is always allowed; moving forwards
   * validates every step in between and stops at the first one that fails,
   * so the header can never skip past an incomplete step.
   */
  const goToStep = useCallback(
    async (index: number) => {
      if (index < 0 || index >= JOB_STEPPER_STEPS.length) return;
      if (index <= currentStepIndex) {
        setCurrentStepIndex(index);
        return;
      }

      for (let step = currentStepIndex; step < index; step++) {
        if (!(await validateStep(step))) {
          setCurrentStepIndex(step);
          return;
        }
      }
      goToIndex(index);
    },
    [currentStepIndex, validateStep, goToIndex],
  );

  const submitAll = useCallback(async (): Promise<boolean> => {
    if (await form.trigger()) return true;

    // Land the user on the first step that actually holds an error, otherwise
    // the message is attached to an input the current step never renders.
    const errors = form.formState.errors as FieldErrors<JobFormValues>;
    const failingStep = JOB_STEPPER_STEPS.findIndex((step) =>
      fieldsByStep[step.id].some((field) => errors[field]),
    );
    if (failingStep >= 0) setCurrentStepIndex(failingStep);
    return false;
  }, [form, fieldsByStep]);

  /** Steps holding at least one error — drives the header's warning state. */
  const formErrors = form.formState.errors;
  const invalidSteps = useMemo(() => {
    const result = new Set<number>();
    JOB_STEPPER_STEPS.forEach((step, index) => {
      if (fieldsByStep[step.id].some((field) => formErrors[field])) {
        result.add(index);
      }
    });
    return result;
  }, [formErrors, fieldsByStep]);

  const getFormValues = useCallback(() => form.getValues(), [form]);

  return {
    form,
    currentStepIndex,
    currentStep,
    steps: JOB_STEPPER_STEPS,
    isFirstStep,
    isLastStep,
    furthestStepReached,
    fieldsByStep,
    invalidSteps,
    goToStep,
    nextStep,
    prevStep,
    submitAll,
    getFormValues,
    isEditing,
  };
}
