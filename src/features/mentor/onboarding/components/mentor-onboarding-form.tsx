"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MultiSelect } from "@/components/ui/multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TagInput } from "@/components/ui/tag-input";
import { Textarea } from "@/components/ui/textarea";
import { useInterestGroupsList } from "@/features/home/hooks";
import { useCompanies } from "@/features/onboarding/hooks";
import { useOnboardingDraftStore } from "../hooks/use-draft-store";
import {
  useSubmitMentorApplication,
  useUpdateMentorApplication,
} from "../hooks/use-onboarding";
import type { MentorApplication } from "../schemas";
import { OnboardingFormSchema, type OnboardingFormValues } from "../schemas";

// ── Per-tab Zod schemas ───────────────────────────────────────────────────────
const IgFormSchema = OnboardingFormSchema;

// Company Mentor: `org` is required (it's the company/organisation UUID)
const CompanyFormSchema = OnboardingFormSchema.extend({
  org: z.string().min(1, "Please select a Company Affiliation"),
});

type MentorType = "ig" | "company";

interface MentorOnboardingFormProps {
  existing?: MentorApplication;
  isEdit?: boolean;
  isReapply?: boolean;
}

// ── SharedFields ──────────────────────────────────────────────────────────────
// Defined at MODULE SCOPE (not inside MentorOnboardingForm).
// Keeping it outside prevents React from seeing a new component reference on
// every parent render, which would unmount/remount the inputs and lose focus.
function SharedFields({
  form,
  igOptions,
}: {
  form: ReturnType<typeof useForm<OnboardingFormValues>>;
  igOptions: { value: string; label: string }[];
}) {
  return (
    <>
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
                maxSelections={5}
              />
            </FormControl>
            {field.value.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {igOptions
                  .filter((o) => field.value.includes(o.value))
                  .map((o) => (
                    <Badge key={o.value} variant="outline" className="text-xs">
                      {o.label}
                    </Badge>
                  ))}
              </div>
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}

// ── Main form component ───────────────────────────────────────────────────────
export function MentorOnboardingForm({
  existing,
  isEdit = false,
  isReapply = false,
}: MentorOnboardingFormProps) {
  const { data: igList = [] } = useInterestGroupsList();
  const { data: companiesList = [] } = useCompanies();

  const { mutate: submit, isPending: isSubmitting } =
    useSubmitMentorApplication();
  const { mutate: update, isPending: isUpdating } =
    useUpdateMentorApplication();

  const isPending = isSubmitting || isUpdating;

  const [mentorType, setMentorType] = useState<MentorType>("ig");

  const baseDefaults: OnboardingFormValues = {
    about: existing?.about ?? "",
    expertise:
      typeof existing?.expertise === "string"
        ? existing.expertise
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean)
        : Array.isArray(existing?.expertise)
          ? (existing.expertise as string[])
          : [],
    reason: existing?.reason ?? "",
    preferred_ig_ids: existing?.preferred_ig_ids ?? [],
    org: undefined,
  };

  const { draft, setDraft, clearDraft } = useOnboardingDraftStore();

  // ── IG Mentor form ────────────────────────────────────────────────────────
  const igForm = useForm<OnboardingFormValues>({
    resolver: zodResolver(IgFormSchema),
    defaultValues: draft
      ? { ...baseDefaults, ...draft, org: undefined }
      : baseDefaults,
  });

  // ── Company Mentor form ───────────────────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const companyForm = useForm<OnboardingFormValues>({
    resolver: zodResolver(CompanyFormSchema) as any, // superset schema; cast is safe
    defaultValues: draft ? { ...baseDefaults, ...draft } : baseDefaults,
  });

  // Persist draft from whichever tab is active
  useEffect(() => {
    const sub = igForm.watch((value) => {
      if (mentorType === "ig") setDraft(value as Partial<OnboardingFormValues>);
    });
    return () => sub.unsubscribe();
  }, [igForm, mentorType, setDraft]);

  useEffect(() => {
    const sub = companyForm.watch((value) => {
      if (mentorType === "company")
        setDraft(value as Partial<OnboardingFormValues>);
    });
    return () => sub.unsubscribe();
  }, [companyForm, mentorType, setDraft]);

  const igOptions = igList.map((ig) => ({ value: ig.id, label: ig.name }));

  function buildPayload(values: OnboardingFormValues) {
    return { ...values, expertise: (values.expertise ?? []).join(", ") };
  }

  function onSubmitIg(values: OnboardingFormValues) {
    const payload = buildPayload(values);
    // Strip `org` — IG Mentor submissions must not include it
    delete (payload as Record<string, unknown>).org;
    if (isEdit) {
      update(payload, { onSuccess: clearDraft });
    } else {
      submit(payload, { onSuccess: clearDraft });
    }
  }

  function onSubmitCompany(values: OnboardingFormValues) {
    const payload = buildPayload(values);
    // `org` is the company UUID; validated non-empty by CompanyFormSchema
    if (isEdit) {
      update(payload, { onSuccess: clearDraft });
    } else {
      submit(payload, { onSuccess: clearDraft });
    }
  }

  const cardTitle = isReapply
    ? "Reapply as Mentor"
    : isEdit
      ? "Update Your Application"
      : "Apply to Become a Mentor";

  const cardDesc = isReapply
    ? "Update your application details and resubmit for admin review."
    : "Tell us about your expertise and why you want to mentor learners.";

  const submitLabel = isPending
    ? "Submitting..."
    : isReapply
      ? "Resubmit Application"
      : isEdit
        ? "Update Application"
        : "Submit Application";

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{cardTitle}</CardTitle>
        <CardDescription>{cardDesc}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          value={mentorType}
          onValueChange={(v) => setMentorType(v as MentorType)}
          className="w-full"
        >
          <TabsList className="w-full mb-6">
            <TabsTrigger value="ig" className="flex-1">
              IG Mentor
            </TabsTrigger>
            <TabsTrigger value="company" className="flex-1">
              Company Mentor
            </TabsTrigger>
          </TabsList>

          {/* ── IG Mentor Tab ──────────────────────────────────────────── */}
          <TabsContent value="ig">
            <Form {...igForm}>
              <form
                onSubmit={igForm.handleSubmit(onSubmitIg)}
                className="space-y-6"
              >
                <SharedFields form={igForm} igOptions={igOptions} />
                <Button type="submit" disabled={isPending} className="w-full">
                  {submitLabel}
                </Button>
              </form>
            </Form>
          </TabsContent>

          {/* ── Company Mentor Tab ─────────────────────────────────────── */}
          <TabsContent value="company">
            <Form {...companyForm}>
              <form
                onSubmit={companyForm.handleSubmit(onSubmitCompany)}
                className="space-y-6"
              >
                <SharedFields form={companyForm} igOptions={igOptions} />

                {/* Company Affiliation — maps to the `org` field in the API */}
                <FormField
                  control={companyForm.control}
                  name="org"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Affiliation</FormLabel>
                      <Select
                        value={field.value ?? ""}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select your company…" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent
                          position="popper"
                          className="max-h-[300px]"
                        >
                          {companiesList.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                              {c.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isPending} className="w-full">
                  {submitLabel}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
