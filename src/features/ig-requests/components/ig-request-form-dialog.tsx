"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { StepperHeader, type StepperStep } from "@/components/stepper-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCreateIGRequest } from "../hooks";
import {
  type CreateIGRequestForm,
  CreateIGRequestFormSchema,
  IG_CATEGORY_OPTIONS,
} from "../schemas";

const STEPS: StepperStep[] = [
  { id: "basic", label: "Basic Info", description: "Name, code & category" },
  { id: "details", label: "Details", description: "Optional information" },
  { id: "review", label: "Review", description: "Confirm & submit" },
];

// Fields validated before leaving Step 1.
const STEP1_FIELDS = ["name", "code", "category", "icon"] as const;

export function IGRequestFormDialog() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const { mutate: createRequest, isPending } = useCreateIGRequest();

  const form = useForm<CreateIGRequestForm>({
    resolver: zodResolver(CreateIGRequestFormSchema),
    defaultValues: {
      name: "",
      code: "",
      icon: "",
      about: "",
      prerequisites: "",
      career_opportunities: "",
      resource: "",
      top_blogs: "",
      people_to_follow: "",
      leads: "",
      mentors: "",
      thinktank: "",
      office_hours: "",
    },
  });

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setStep(0);
      form.reset();
    }
  };

  const goNext = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (step === 0) {
      const ok = await form.trigger([...STEP1_FIELDS]);
      if (!ok) return;
    }
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  const goBack = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setStep((s) => Math.max(0, s - 1));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < STEPS.length - 1) {
      goNext();
    } else {
      form.handleSubmit(onFinalSubmit)(e);
    }
  };

  const onFinalSubmit = (data: CreateIGRequestForm) => {
    if (step !== STEPS.length - 1) return;
    createRequest(data, {
      onSuccess: () => {
        handleOpenChange(false);
      },
    });
  };

  const values = form.watch();

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Request New IG
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>Request New Interest Group</DialogTitle>
        </DialogHeader>

        <div className="border-b border-border px-1 pb-4">
          <StepperHeader
            steps={STEPS}
            currentStepIndex={step}
            onStepClick={(index) => {
              // Allow going back via the header; going forward must use Next
              // so step-1 validation isn't skipped.
              if (index < step) setStep(index);
            }}
            ariaLabel="IG request progress"
          />
        </div>

        <Form {...form}>
          <form
            onSubmit={handleFormSubmit}
            className="flex flex-col flex-1 overflow-hidden"
          >
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-1 py-4">
              {/* Step 1 — Basic Info */}
              {step === 0 && (
                <div className="space-y-4 pb-2">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g. Web Development"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="code"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Code *</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. WEBDEV" {...field} />
                        </FormControl>
                        <FormDescription>
                          Short unique identifier, e.g., WEBDEV, AI, UIUX
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {IG_CATEGORY_OPTIONS.map((cat) => (
                              <SelectItem
                                key={cat}
                                value={cat}
                                className="capitalize"
                              >
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="icon"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Icon *</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 2 — Optional Details */}
              {step === 1 && (
                <div className="grid gap-4 pb-4">
                  <FormField
                    control={form.control}
                    name="about"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>About</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="prerequisites"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prerequisites</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="career_opportunities"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Career Opportunities</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="resource"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Resource Link</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="top_blogs"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Top Blogs</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="people_to_follow"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>People to Follow</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="leads"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Leads</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="mentors"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mentors</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="thinktank"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Thinktank Link</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="office_hours"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Office Hours</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 3 — Review */}
              {step === 2 && (
                <div className="space-y-3 pb-4 text-sm">
                  <p className="text-muted-foreground">
                    Review the details below, then submit your request.
                  </p>
                  <dl className="divide-y divide-border rounded-lg border border-border">
                    {(
                      [
                        ["Name", values.name],
                        ["Code", values.code],
                        ["Category", values.category],
                        ["Icon", values.icon],
                        ["About", values.about],
                        ["Prerequisites", values.prerequisites],
                        ["Career Opportunities", values.career_opportunities],
                        ["Resource Link", values.resource],
                        ["Top Blogs", values.top_blogs],
                        ["People to Follow", values.people_to_follow],
                        ["Leads", values.leads],
                        ["Mentors", values.mentors],
                        ["Thinktank Link", values.thinktank],
                        ["Office Hours", values.office_hours],
                      ] as const
                    )
                      .filter(([, value]) => value && String(value).trim())
                      .map(([label, value]) => (
                        <div
                          key={label}
                          className="grid grid-cols-3 gap-2 px-3 py-2"
                        >
                          <dt className="text-muted-foreground">{label}</dt>
                          <dd className="col-span-2 wrap-break-word">
                            {String(value)}
                          </dd>
                        </div>
                      ))}
                  </dl>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-2 border-t border-border px-1 pt-4">
              <Button
                key={`btn-back-step-${step}`}
                type="button"
                variant="ghost"
                onClick={goBack}
                disabled={step === 0}
              >
                Back
              </Button>
              {step < STEPS.length - 1 ? (
                <Button
                  key={`btn-next-step-${step}`}
                  type="button"
                  onClick={goNext}
                >
                  Next
                </Button>
              ) : (
                <Button
                  key="btn-submit-request"
                  type="submit"
                  disabled={isPending}
                >
                  {isPending ? "Submitting..." : "Submit Request"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
