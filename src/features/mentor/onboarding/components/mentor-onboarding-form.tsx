"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { TagInput } from "@/components/ui/tag-input";
import { Textarea } from "@/components/ui/textarea";
import { useInterestGroupsList } from "@/features/home/hooks";
import { useOnboardingDraftStore } from "../hooks/use-draft-store";
import {
  useSubmitMentorApplication,
  useUpdateMentorApplication,
} from "../hooks/use-onboarding";
import type { MentorApplication } from "../schemas";
import { OnboardingFormSchema, type OnboardingFormValues } from "../schemas";

interface MentorOnboardingFormProps {
  existing?: MentorApplication;
  isEdit?: boolean;
  isReapply?: boolean;
}

export function MentorOnboardingForm({
  existing,
  isEdit = false,
  isReapply = false,
}: MentorOnboardingFormProps) {
  const { data: igList = [] } = useInterestGroupsList();
  const { mutate: submit, isPending: isSubmitting } =
    useSubmitMentorApplication();
  const { mutate: update, isPending: isUpdating } =
    useUpdateMentorApplication();

  const isPending = isSubmitting || isUpdating;

  const defaultValues: OnboardingFormValues = {
    about: existing?.about ?? "",
    // Expertise is stored as a comma string on the backend; split into chips.
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
  };

  const { draft, setDraft, clearDraft } = useOnboardingDraftStore();

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

  function onSubmit(values: OnboardingFormValues) {
    // Join expertise chips into the comma string the backend stores.
    const payload = {
      ...values,
      expertise: (values.expertise ?? []).join(", "),
    };
    if (isEdit) {
      update(payload, { onSuccess: clearDraft });
    } else {
      submit(payload, { onSuccess: clearDraft });
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
                    />
                  </FormControl>
                  {field.value.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {igOptions
                        .filter((o) => field.value.includes(o.value))
                        .map((o) => (
                          <Badge
                            key={o.value}
                            variant="outline"
                            className="text-xs"
                          >
                            {o.label}
                          </Badge>
                        ))}
                    </div>
                  )}
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
