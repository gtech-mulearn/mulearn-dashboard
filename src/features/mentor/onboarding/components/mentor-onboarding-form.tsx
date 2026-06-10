"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
import { Textarea } from "@/components/ui/textarea";
import { useInterestGroupsList } from "@/features/home/hooks";
import {
  useSubmitMentorApplication,
  useUpdateMentorApplication,
} from "../hooks/use-onboarding";
import type { MentorApplication } from "../schemas";
import { OnboardingFormSchema, type OnboardingFormValues } from "../schemas";

interface MentorOnboardingFormProps {
  existing?: MentorApplication;
  isEdit?: boolean;
}

export function MentorOnboardingForm({
  existing,
  isEdit = false,
}: MentorOnboardingFormProps) {
  const { data: igList = [] } = useInterestGroupsList();
  const { mutate: submit, isPending: isSubmitting } =
    useSubmitMentorApplication();
  const { mutate: update, isPending: isUpdating } =
    useUpdateMentorApplication();

  const isPending = isSubmitting || isUpdating;

  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(OnboardingFormSchema),
    defaultValues: {
      about: existing?.about ?? "",
      expertise:
        typeof existing?.expertise === "string"
          ? existing.expertise
          : Array.isArray(existing?.expertise)
            ? (existing.expertise as string[]).join(", ")
            : "",
      reason: existing?.reason ?? "",
      preferred_ig_ids: existing?.preferred_ig_ids ?? [],
    },
  });

  const igOptions = igList.map((ig) => ({ value: ig.id, label: ig.name }));

  function onSubmit(values: OnboardingFormValues) {
    if (isEdit) {
      update(values);
    } else {
      submit(values);
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Apply to Become a Mentor</CardTitle>
        <CardDescription>
          Tell us about your expertise and why you want to mentor learners.
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
                      (e.g. React, Python, Machine Learning)
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your areas of expertise…"
                      rows={2}
                      {...field}
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
                  <FormLabel>
                    Preferred Interest Groups{" "}
                    <span className="text-muted-foreground font-normal">
                      (optional)
                    </span>
                  </FormLabel>
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
