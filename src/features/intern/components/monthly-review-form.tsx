"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CalendarClock,
  CheckCircle2,
  ListChecks,
  Target,
  XCircle,
  Zap,
} from "lucide-react";
import { useEffect } from "react";
import { type FieldPath, useForm } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useUserInfo } from "@/features/auth";
import {
  getFieldErrors,
  useEditMonthlyReview,
  useInternOverview,
  useMonthlyReviewCurrent,
  useMonthlyReviewDetail,
  useMonthlyReviewPrefill,
  useSubmitMonthlyReview,
} from "../hooks/use-intern";
import {
  MONTHLY_REVIEW_FIELD_MAX,
  MONTHLY_REVIEW_TEXT_MAX,
  type MonthlyReviewFormValues,
  monthlyReviewSchema,
} from "../schemas";
import type {
  TMonthlyReview,
  TMonthlyReviewPayload,
  TMonthlyReviewWindow,
} from "../types";
import {
  formatDateOnly,
  formatReviewMonth,
  formatTaskStatus,
} from "../utils/intern-helpers";

const EMPTY_VALUES: MonthlyReviewFormValues = {
  monthlyReview: "",
  rating: "",
  learnings: "",
  challengesFaced: "",
  nextMonthPlan: "",
  blockers: "",
  suggestions: "",
};

/** Backend field name → form field name. */
const FIELD_MAP: Record<string, FieldPath<MonthlyReviewFormValues>> = {
  monthly_review: "monthlyReview",
  rating: "rating",
  learnings: "learnings",
  challenges_faced: "challengesFaced",
  next_month_plan: "nextMonthPlan",
  blockers: "blockers",
  suggestions: "suggestions",
};

function reviewToValues(review: TMonthlyReview): MonthlyReviewFormValues {
  return {
    monthlyReview: review.monthly_review || "",
    rating: review.task_remarks?.rating
      ? String(review.task_remarks.rating)
      : "",
    learnings: review.task_remarks?.learnings || "",
    challengesFaced: review.task_remarks?.challenges_faced || "",
    nextMonthPlan: review.task_remarks?.next_month_plan || "",
    blockers: review.blockers || "",
    suggestions: review.suggestions || "",
  };
}

function valuesToPayload(v: MonthlyReviewFormValues): TMonthlyReviewPayload {
  return {
    monthly_review: v.monthlyReview?.trim() || null,
    rating: v.rating ? Number(v.rating) : null,
    learnings: v.learnings?.trim() || null,
    challenges_faced: v.challengesFaced?.trim() || null,
    next_month_plan: v.nextMonthPlan?.trim() || null,
    blockers: v.blockers?.trim() || null,
    suggestions: v.suggestions?.trim() || null,
  };
}

function windowLabel(w: TMonthlyReviewWindow) {
  return `${formatDateOnly(w.opens_on)} – ${formatDateOnly(w.closes_on)}`;
}

/** Read-only summary of a saved review (approved, or last month's). */
function ReviewSummary({ review }: { review: TMonthlyReview }) {
  const remarks = review.task_remarks;
  const sections: Array<[string, string | null | undefined]> = [
    ["Learnings", remarks?.learnings],
    ["Challenges Faced", remarks?.challenges_faced],
    ["Next Month's Plan", remarks?.next_month_plan],
    ["Blockers", review.blockers],
    ["Suggestions", review.suggestions],
  ];
  return (
    <div className="space-y-4 text-sm">
      <div className="flex flex-wrap gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
        <span>Team: {review.team || "-"}</span>
        <span>Leave days: {review.leave_days}</span>
        {remarks?.rating ? <span>Rating: {remarks.rating} / 5</span> : null}
      </div>
      {review.monthly_review && (
        <div className="bg-muted/30 p-3 rounded-lg border border-border/20">
          <MarkdownRenderer
            content={review.monthly_review}
            className="text-xs"
          />
        </div>
      )}
      {sections
        .filter(([, value]) => value)
        .map(([label, value]) => (
          <div key={label} className="space-y-1">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              {label}
            </p>
            <p className="text-xs text-foreground leading-relaxed break-words">
              {value}
            </p>
          </div>
        ))}
      {review.review_note && (
        <div className="space-y-1 pt-2 border-t border-border/20">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
            Reviewer Note
          </p>
          <p className="text-xs text-foreground leading-relaxed break-words">
            {review.review_note}
          </p>
        </div>
      )}
    </div>
  );
}

interface MonthlyReviewFormProps {
  onSuccess?: () => void;
}

/**
 * Monthly review form. What it shows depends on the prefill:
 * - window closed → next window + last review (read-only)
 * - open, no review → empty form (POST)
 * - open, PENDING → prefilled form (PATCH)
 * - open, REJECTED → reviewer note + prefilled form (POST = resubmit)
 * - open, APPROVED → success card
 */
export function MonthlyReviewForm({ onSuccess }: MonthlyReviewFormProps) {
  const { data: userData } = useUserInfo();
  const { data: overview } = useInternOverview();
  const { data: prefill, isLoading: isPrefillLoading } =
    useMonthlyReviewPrefill();
  const existing = prefill?.existing_review ?? null;
  const isWindowOpen = !!prefill?.window_open;

  const { data: existingReview, isLoading: isExistingLoading } =
    useMonthlyReviewDetail(
      isWindowOpen && existing && existing.status !== "APPROVED"
        ? existing.id
        : undefined,
    );
  const { data: current } = useMonthlyReviewCurrent();

  const submitMutation = useSubmitMonthlyReview();
  const editMutation = useEditMonthlyReview();
  const isSaving = submitMutation.isPending || editMutation.isPending;

  const form = useForm<MonthlyReviewFormValues>({
    resolver: zodResolver(monthlyReviewSchema),
    defaultValues: EMPTY_VALUES,
  });

  // Prefill the form from the existing PENDING / REJECTED review.
  useEffect(() => {
    form.reset(existingReview ? reviewToValues(existingReview) : EMPTY_VALUES);
  }, [existingReview, form]);

  const applyFieldErrors = (error: unknown) => {
    const fieldErrors = getFieldErrors(error);
    if (!fieldErrors) return;
    for (const [field, messages] of Object.entries(fieldErrors)) {
      const name = FIELD_MAP[field];
      if (name) form.setError(name, { message: messages[0] });
    }
  };

  const onSubmit = (values: MonthlyReviewFormValues) => {
    const payload = valuesToPayload(values);
    const options = {
      onSuccess: () => onSuccess?.(),
      onError: applyFieldErrors,
    };
    if (existing?.status === "PENDING") {
      editMutation.mutate({ id: existing.id, payload }, options);
    } else {
      submitMutation.mutate(
        { payload, isResubmit: existing?.status === "REJECTED" },
        options,
      );
    }
  };

  if (isPrefillLoading || (isExistingLoading && !!existing)) {
    return (
      <div className="flex justify-center p-12">
        <Spinner className="w-8 h-8 text-primary" />
      </div>
    );
  }

  if (!prefill) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Couldn't load the monthly review</AlertTitle>
        <AlertDescription>
          Please refresh the page and try again.
        </AlertDescription>
      </Alert>
    );
  }

  // ── Window closed ──────────────────────────────────────────
  if (!isWindowOpen) {
    const lastReview = current?.review ?? null;
    return (
      <div className="space-y-6">
        <Card className="border-border/40 bg-card/30 backdrop-blur-md shadow-2xl py-4 md:py-6">
          <CardHeader className="px-4 md:px-6">
            <CardTitle className="text-xl md:text-2xl font-black uppercase tracking-tighter flex items-center gap-2">
              <CalendarClock className="w-5 h-5 text-brand-blue" />
              Submission window closed
            </CardTitle>
            <CardDescription className="font-bold text-xs">
              The {formatReviewMonth(prefill)} review opens on{" "}
              <strong className="text-foreground">
                {formatDateOnly(prefill.opens_on)}
              </strong>{" "}
              and closes on{" "}
              <strong className="text-foreground">
                {formatDateOnly(prefill.closes_on)}
              </strong>{" "}
              (IST).
            </CardDescription>
          </CardHeader>
        </Card>
        {current?.window && (
          <Card className="border-border/40 bg-card/30 backdrop-blur-md shadow-xl py-4 md:py-6">
            <CardHeader className="px-4 md:px-6">
              <CardTitle className="text-base font-black uppercase tracking-tight">
                Last review · {formatReviewMonth(current.window)}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 md:px-6">
              {lastReview ? (
                <ReviewSummary review={lastReview} />
              ) : (
                <p className="text-xs font-bold text-muted-foreground italic">
                  No review was submitted for{" "}
                  {formatReviewMonth(current.window)}.
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // ── Approved ───────────────────────────────────────────────
  if (existing?.status === "APPROVED") {
    return (
      <Card className="border-border/40 bg-card/30 backdrop-blur-md shadow-2xl overflow-hidden relative py-4 md:py-6">
        <div className="absolute top-0 inset-x-0 h-1 bg-success/50" />
        <CardContent className="px-4 md:px-6">
          <Alert className="bg-success/10 text-success border-success/20 py-4 md:py-6 px-4 md:px-6 rounded-xl">
            <CheckCircle2 className="h-6 w-6" />
            <div className="ml-2">
              <AlertTitle className="text-base md:text-lg font-black uppercase tracking-tight">
                {formatReviewMonth(prefill)} review approved
              </AlertTitle>
              <AlertDescription className="font-bold opacity-95 text-xs md:text-sm mt-1">
                {existing.review_note ||
                  "Great work this month. Your review has been approved."}
              </AlertDescription>
            </div>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const isPendingEdit = existing?.status === "PENDING";
  const isRejected = existing?.status === "REJECTED";

  const textField = (
    name: Exclude<FieldPath<MonthlyReviewFormValues>, "rating">,
    label: string,
    placeholder: string,
    max: number,
    minHeight = "min-h-[80px]",
  ) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            {label}
          </FormLabel>
          <FormControl>
            <Textarea
              {...field}
              value={field.value ?? ""}
              maxLength={max}
              placeholder={placeholder}
              className={`${minHeight} bg-background/50 border-border/50 font-bold focus:ring-brand-blue/30 rounded-md p-4 resize-none`}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <div className="space-y-6">
      {isRejected && (
        <Alert className="bg-destructive/10 text-destructive border-destructive/30">
          <XCircle className="h-4 w-4" />
          <AlertTitle className="font-black uppercase tracking-tight">
            Your review was rejected
          </AlertTitle>
          <AlertDescription className="font-bold text-xs">
            {existing?.review_note || "No note was left by the reviewer."} You
            can update and resubmit it until {formatDateOnly(prefill.closes_on)}
            .
          </AlertDescription>
        </Alert>
      )}

      <Card className="border-border/40 bg-card/40 backdrop-blur-xl shadow-2xl overflow-hidden relative group py-4 md:py-6">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
          <Target className="w-64 h-64 text-primary" />
        </div>
        <CardHeader className="border-b border-border/20 bg-muted/20 px-4 md:px-6">
          <CardTitle className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
            {isPendingEdit ? "Update Review" : "Monthly Review"}
          </CardTitle>
          <CardDescription className="font-bold text-muted-foreground/60 uppercase text-[10px] tracking-widest mt-1">
            {formatReviewMonth(prefill)} · open until{" "}
            {formatDateOnly(prefill.closes_on)} (IST)
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 md:pt-8 px-4 md:px-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 md:space-y-8"
            >
              {/* Identity strip (read-only) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 md:p-6 rounded-2xl bg-muted/20 border border-border/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                  <Zap className="w-12 h-12 text-muted-foreground" />
                </div>
                {[
                  ["Full Name", userData?.full_name],
                  ["MUID", userData?.muid],
                  ["Team", overview?.guild],
                  ["Leave days so far", String(prefill.leave_days)],
                ].map(([label, value]) => (
                  <div key={label} className="space-y-1 min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      {label}
                    </p>
                    <p className="text-sm font-bold text-foreground truncate">
                      {value || "-"}
                    </p>
                  </div>
                ))}
              </div>

              {/* Tasks this month (read-only) */}
              <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                  <ListChecks className="w-3 h-3" />
                  Tasks this month
                </p>
                {prefill.tasks.length === 0 ? (
                  <p className="text-xs font-bold text-muted-foreground/70 italic">
                    No tasks due this month.
                  </p>
                ) : (
                  <ul className="space-y-1.5">
                    {prefill.tasks.map((t) => (
                      <li
                        key={t.task_id}
                        className="flex items-center justify-between gap-2 rounded-lg border border-border/40 bg-background/30 px-3 py-2"
                      >
                        <span className="text-xs font-bold text-foreground truncate">
                          {t.title}
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-wider text-brand-blue shrink-0">
                          {formatTaskStatus(t.status)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="text-[10px] font-bold text-muted-foreground/70">
                  Completed / waiting-for-review tasks are attached
                  automatically.
                </p>
              </div>

              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem className="md:w-1/2">
                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                      Monthly Rating (1-5)
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-background/50 border-border/50 h-10 font-bold rounded-md focus:ring-brand-blue/30">
                          <SelectValue placeholder="How was your month?" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent
                        position="popper"
                        className="bg-card font-bold border-border/60"
                      >
                        {[
                          { val: 5, label: "Excellent" },
                          { val: 4, label: "Good" },
                          { val: 3, label: "Satisfactory" },
                          { val: 2, label: "Challenging" },
                          { val: 1, label: "Very Challenging" },
                        ].map(({ val, label }) => (
                          <SelectItem
                            key={val}
                            value={String(val)}
                            className="font-bold text-xs"
                          >
                            {val} - {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-6 md:gap-8 md:grid-cols-2">
                {textField(
                  "learnings",
                  "Learnings",
                  "What did you learn this month?",
                  MONTHLY_REVIEW_FIELD_MAX,
                )}
                {textField(
                  "challengesFaced",
                  "Challenges Faced",
                  "What challenges did you face?",
                  MONTHLY_REVIEW_FIELD_MAX,
                )}
              </div>

              {textField(
                "nextMonthPlan",
                "Next Month's Plan",
                "Outline your goals for next month...",
                MONTHLY_REVIEW_FIELD_MAX,
              )}

              <FormField
                control={form.control}
                name="monthlyReview"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                      Monthly Review
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ""}
                        maxLength={MONTHLY_REVIEW_TEXT_MAX}
                        placeholder="Summarise your month..."
                        className="min-h-[140px] bg-background/50 border-border/50 font-bold focus:ring-brand-blue/30 rounded-md p-4 resize-none"
                      />
                    </FormControl>
                    <FormDescription className="text-[10px] font-bold text-muted-foreground/60">
                      Optional if you filled in learnings, challenges or next
                      month's plan.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-6 md:gap-8 md:grid-cols-2">
                {textField(
                  "blockers",
                  "Blockers",
                  "Anything blocking you? (optional)",
                  MONTHLY_REVIEW_FIELD_MAX,
                )}
                {textField(
                  "suggestions",
                  "Feedback / Suggestions",
                  "Any suggestions for improvement? (optional)",
                  MONTHLY_REVIEW_FIELD_MAX,
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full text-sm shadow-[0_8px_16px_rgba(46,133,254,0.25)] font-bold rounded-full"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Spinner className="mr-3 h-5 w-5" />
                    Saving...
                  </>
                ) : isPendingEdit ? (
                  "Update Review"
                ) : isRejected ? (
                  "Resubmit Monthly Review"
                ) : (
                  "Submit Monthly Review"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
