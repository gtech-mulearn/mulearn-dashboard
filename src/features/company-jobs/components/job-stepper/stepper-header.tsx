/**
 * StepperHeader (Create Job) — re-exports the shared stepper header so the
 * job creation flow uses the same component as other multi-step flows
 * (Issue #22). The job `StepDefinition` type is structurally compatible with
 * the shared `StepperStep` type.
 */

export { StepperHeader, type StepperStep } from "@/components/stepper-header";
