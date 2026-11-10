"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Combobox } from "@/components/ui/combobox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TagInput } from "@/components/ui/tag-input";
import { Textarea } from "@/components/ui/textarea";
import { useInterestGroupsList } from "@/features/home/hooks";
import { useCompanies } from "@/features/onboarding/hooks";
import { MENTOR_HOURS_OPTIONS, toMentorHours } from "../../lib/hours";
import { useOnboardingDraftStore } from "../hooks/use-draft-store";
import {
  useSubmitMentorApplication,
  useUpdateMentorApplication,
} from "../hooks/use-onboarding";
import { buildMentorApplicationPayload } from "../lib/build-payload";
import type { MentorApplication } from "../schemas";
import { OnboardingFormSchema, type OnboardingFormValues } from "../schemas";

/** Select sentinel for "no hours picked" (Radix items can't use an empty value). */
const HOURS_UNSET = "__unset__";

interface MentorOnboardingFormProps {
  existing?: MentorApplication;
  isEdit?: boolean;
  isReapply?: boolean;
  isPendingEdit?: boolean;
  /**
   * Prefill data forwarded from the registration flow via URL params.
   * Replaces the old localStorage approach to satisfy the Husky no-localStorage rule.
   */
  prefillData?: {
    mentor_tier?: string;
    company?: string;
    org?: string;
  };
}

export function MentorOnboardingForm({
  existing,
  isEdit = false,
  isReapply = false,
  isPendingEdit = false,
  prefillData,
}: MentorOnboardingFormProps) {
  const { data: igList = [] } = useInterestGroupsList();
  const { data: companies = [] } = useCompanies();
  const { mutate: submit, isPending: isSubmitting } =
    useSubmitMentorApplication();
  const { mutate: update, isPending: isUpdating } =
    useUpdateMentorApplication();

  const isPending = isSubmitting || isUpdating;

  // Read mentor prefill data from the prop (forwarded via URL params from
  // register-client.tsx → interests-client.tsx → mentor-home.tsx).
  // The old localStorage approach was replaced to satisfy the Husky rule.
  const savedOnboardingTier = prefillData?.mentor_tier ?? null;
  const savedOnboardingCompany = prefillData?.company ?? null;
  const savedOnboardingOrgId = prefillData?.org ?? null;

  // Draft must be declared BEFORE defaultValues so it's in scope when used below.
  const {
    draft,
    setDraft,
    clearDraft,
    lastSubmitted,
    saveSnapshot,
    clearSnapshot,
  } = useOnboardingDraftStore();

  const rawDraftTier = draft?.mentor_tier || savedOnboardingTier;
  const normalizedTier =
    rawDraftTier === "IG Mentor"
      ? "IG_MENTOR"
      : rawDraftTier === "Company Mentor"
        ? "COMPANY_MENTOR"
        : rawDraftTier;

  // When reapplying or editing pending, the backend profile endpoint (/mentor/profile/) returns
  // 403 for rejected/pending users, so `existing` will be undefined. We fall back to
  // `lastSubmitted` — a persisted snapshot saved every time the user submits
  // the application — so every field is reliably prefilled.
  const fallbackSource =
    isReapply || isPendingEdit ? (lastSubmitted ?? undefined) : undefined;

  const existingExpertise =
    typeof existing?.expertise === "string"
      ? existing.expertise
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : Array.isArray(existing?.expertise)
        ? (existing.expertise as string[])
        : null;

  const defaultValues: OnboardingFormValues = {
    mentor_tier:
      existing?.mentor_tier ??
      fallbackSource?.mentor_tier ??
      normalizedTier ??
      "",
    // `company` is display-only (human-readable name shown in the form).
    company:
      existing?.company ??
      fallbackSource?.company ??
      (draft?.company || savedOnboardingCompany) ??
      "",
    // `org` is the UUID that actually gets sent to the API.
    org:
      existing?.org ??
      fallbackSource?.org ??
      (draft?.org || savedOnboardingOrgId) ??
      "",
    about: existing?.about ?? fallbackSource?.about ?? "",
    expertise: existingExpertise ?? fallbackSource?.expertise ?? [],
    linkedin_url:
      existing?.linkedin ??
      existing?.linkedin_url ??
      fallbackSource?.linkedin_url ??
      "",
    reason: existing?.reason ?? fallbackSource?.reason ?? "",
    hours:
      toMentorHours(existing?.hours) ?? toMentorHours(fallbackSource?.hours),
    preferred_ig_ids:
      existing?.preferred_ig_ids ?? fallbackSource?.preferred_ig_ids ?? [],
  };

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(OnboardingFormSchema),
    defaultValues: draft ? { ...defaultValues, ...draft } : defaultValues,
  });

  useEffect(() => {
    const subscription = form.watch((value) => {
      setDraft(value as Partial<OnboardingFormValues>);
    });
    return () => subscription.unsubscribe();
  }, [form, setDraft]);

  const igOptions = igList.map((ig) => ({ value: ig.id, label: ig.name }));
  const companyOptions = companies.map((c) => ({
    id: c.id,
    title: c.title,
  }));

  const handleSuccess = (submittedValues: OnboardingFormValues) => {
    // Save the submitted values as a persistent snapshot so the Reapply
    // form can prefill every field if this application gets rejected.
    saveSnapshot(submittedValues);
    clearDraft();
    // On a successful reapply the old snapshot is no longer needed.
    if (isReapply) clearSnapshot();
    // No localStorage cleanup needed — prefill data now travels via URL params.
  };

  function onSubmit(values: OnboardingFormValues) {
    const payload = buildMentorApplicationPayload(values, {
      existingId: existing?.id,
      isEdit,
      isReapply,
      isPendingEdit,
      companies,
    });

    // If it's purely an edit of an existing profile, use PATCH (update).
    // If it's a new application OR a reapplication, use POST (submit) as requested.
    if (isEdit && !isReapply) {
      update(payload, { onSuccess: () => handleSuccess(values) });
    } else {
      submit(payload, { onSuccess: () => handleSuccess(values) });
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          {isReapply
            ? "Reapply as Mentor"
            : isEdit
              ? "Update Your Application"
              : "Apply to Become a Mentor"}
        </CardTitle>
        <CardDescription>
          {isReapply
            ? "Update your application details and resubmit for admin review."
            : "Tell us about your expertise and why you want to mentor learners."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div
              className={
                (!isEdit && !isReapply) || isPendingEdit
                  ? "hidden"
                  : "space-y-6"
              }
            >
              <FormField
                control={form.control}
                name="mentor_tier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mentor Tier</FormLabel>
                    <Select
                      onValueChange={(val) => {
                        field.onChange(val);
                        if (val === "IG_MENTOR") {
                          form.setValue("org", "");
                          form.setValue("company", "");
                        }
                      }}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a mentor tier" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="IG_MENTOR">IG Mentor</SelectItem>
                        <SelectItem value="COMPANY_MENTOR">
                          Company Mentor
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Company field — visible if the user selected a company during registration 
                  OR if the mentor tier is explicitly set to COMPANY_MENTOR. */}
              {(!!form.watch("company") ||
                !!form.watch("org") ||
                form.watch("mentor_tier") === "COMPANY_MENTOR") && (
                <FormField
                  control={form.control}
                  name="org"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Company</FormLabel>
                      <FormControl>
                        <Combobox
                          options={companyOptions}
                          value={field.value ?? ""}
                          onValueChange={(val: string) => {
                            field.onChange(val);
                            const selected = companies.find(
                              (c) => c.id === val,
                            );
                            if (selected) {
                              form.setValue("company", selected.title);
                            } else {
                              form.setValue("company", "");
                            }
                          }}
                          placeholder="Select your company..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            <FormField
              control={form.control}
              name="about"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>About You</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your background and experience (min 50 characters)..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expertise"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Expertise{" "}
                    <span className="text-muted-foreground font-normal">
                      (at least 3, e.g. React, Python, Machine Learning)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <TagInput
                      value={field.value ?? []}
                      onChange={field.onChange}
                      placeholder="Type a skill and press Enter…"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Why do you want to mentor?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Share your motivation (min 30 characters)..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Weekly availability{" "}
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </FormLabel>
                  <Select
                    value={field.value ?? ""}
                    onValueChange={(value) =>
                      field.onChange(value === HOURS_UNSET ? undefined : value)
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="How much time can you give each week?" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value={HOURS_UNSET}>Not sure yet</SelectItem>
                      {MENTOR_HOURS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label} per week
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Helps learners and reviewers know what to expect. You can
                    change it later from your profile.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="linkedin_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>LinkedIn Profile URL</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://www.linkedin.com/in/your-username"
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preferred_ig_ids"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Interest Groups</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={igOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select IGs you want to mentor in..."
                      dropUp
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isPending} className="w-full">
              {isPending
                ? "Submitting..."
                : isReapply
                  ? "Resubmit Application"
                  : isEdit
                    ? "Update Application"
                    : "Submit Application"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
