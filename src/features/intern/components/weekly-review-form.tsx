"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, ShieldAlert, Sparkles, Target, Zap } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useUserInfo } from "@/features/auth";
import {
  useInternOverview,
  useSubmitWeeklyReview,
  useWeeklyReviewCurrent,
} from "@/features/intern";
import { type WeeklyReviewFormValues, weeklyReviewSchema } from "../schemas";

function getISOWeekAndYear(date: Date = new Date()) {
  const target = new Date(date.valueOf());
  const dayNumber = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNumber + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay() + 7) % 7));
  }
  const week = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
  const year = new Date(firstThursday).getFullYear();
  return { week, year };
}

interface WeeklyReviewFormProps {
  onSuccess?: () => void;
}

export function WeeklyReviewForm({ onSuccess }: WeeklyReviewFormProps) {
  const { data: userData } = useUserInfo();
  const { data: currentReview, isLoading: isCurrentLoading } =
    useWeeklyReviewCurrent();
  const { data: overview, isLoading: isOverviewLoading } = useInternOverview();
  const submitMutation = useSubmitWeeklyReview();

  const isSubmitted = !!currentReview;
  const weekInfo = currentReview
    ? { week: currentReview.iso_week, year: currentReview.iso_year }
    : getISOWeekAndYear();

  const form = useForm<WeeklyReviewFormValues>({
    resolver: zodResolver(weeklyReviewSchema),
    defaultValues: {
      fullName: userData?.full_name || "",
      muid: userData?.muid || "",
      email: userData?.email || "",
      team: overview?.guild || "",
      isOnLeave: false,
      tasksAssigned: "",
      tasksCompleted: "",
      worksDone: "",
      hoursCommitted: "",
      blockers: "",
      leaveDays: "",
      rating: "",
      learnings: "",
      challengesFaced: "",
      nextWeekPlan: "",
      suggestions: "",
    },
  });

  const isOnLeave = form.watch("isOnLeave");

  useEffect(() => {
    if (userData || overview) {
      form.reset({
        fullName: userData?.full_name || "",
        muid: userData?.muid || "",
        email: userData?.email || "",
        team: overview?.guild || form.getValues("team") || "",
        isOnLeave: form.getValues("isOnLeave") || false,
        tasksAssigned: form.getValues("tasksAssigned") || "",
        tasksCompleted: form.getValues("tasksCompleted") || "",
        worksDone: form.getValues("worksDone") || "",
        hoursCommitted: form.getValues("hoursCommitted") || "",
        blockers: form.getValues("blockers") || "",
        leaveDays: form.getValues("leaveDays") || "",
        rating: form.getValues("rating") || "",
        learnings: form.getValues("learnings") || "",
        challengesFaced: form.getValues("challengesFaced") || "",
        nextWeekPlan: form.getValues("nextWeekPlan") || "",
        suggestions: form.getValues("suggestions") || "",
      });
    }
  }, [userData, overview, form]);

  const onSubmit = async (values: WeeklyReviewFormValues) => {
    submitMutation.mutate(
      {
        team: values.team,
        is_on_leave: values.isOnLeave,
        hours_committed: values.isOnLeave ? 0 : Number(values.hoursCommitted),
        tasks_assigned: values.isOnLeave ? "" : values.tasksAssigned,
        tasks_completed: values.isOnLeave ? "" : values.tasksCompleted,
        weekly_review: values.isOnLeave ? "" : values.worksDone,
        blockers: values.isOnLeave ? "" : values.blockers,
        leave_days: values.leaveDays ? Number(values.leaveDays) || 0 : 0,
        rating: values.rating ? Number(values.rating) : undefined,
        learnings: values.learnings || undefined,
        challenges_faced: values.challengesFaced || undefined,
        next_week_plan: values.nextWeekPlan || undefined,
        suggestions: values.suggestions || undefined,
      },
      {
        onSuccess: () => {
          form.reset();
          onSuccess?.();
        },
      },
    );
  };

  if (isCurrentLoading || isOverviewLoading) {
    return (
      <div className="flex justify-center p-12">
        <Spinner className="w-8 h-8 text-primary" />
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <Card className="border-border/40 bg-card/30 backdrop-blur-md shadow-2xl overflow-hidden relative py-4 md:py-6">
        <div className="absolute top-0 inset-x-0 h-1 bg-success/50" />
        <CardHeader className="text-xl md:text-2xl font-black uppercase tracking-tighter px-4 md:px-6">
          Weekly Review
        </CardHeader>
        <CardContent className="px-4 md:px-6">
          <Alert className="bg-success/10 text-success border-success/20 py-4 md:py-6 px-4 md:px-6 rounded-xl">
            <CheckCircle2 className="h-6 w-6" />
            <div className="ml-2">
              <AlertTitle className="text-base md:text-lg font-black uppercase tracking-tight">
                Weekly Review Logged
              </AlertTitle>
              <AlertDescription className="font-bold opacity-95 text-xs md:text-sm mt-1">
                Awesome job! Your review for this week has been successfully
                recorded. Keep up the excellent work and consistency!
              </AlertDescription>
            </div>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/40 bg-card/40 backdrop-blur-xl shadow-2xl overflow-hidden relative group py-4 md:py-6">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
          <Target className="w-64 h-64 text-primary" />
        </div>
        <CardHeader className="border-b border-border/20 bg-muted/20 px-4 md:px-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-brand-blue/10 text-brand-blue border-brand-blue/20 px-2 py-0.5 font-black text-[10px] uppercase tracking-widest">
                  Weekly Review
                </Badge>
              </div>
              <CardTitle className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
                Weekly Review
              </CardTitle>
              <CardDescription className="font-bold text-muted-foreground/60 uppercase text-[10px] tracking-widest mt-1">
                Reflect on your weekly achievements and future plans
              </CardDescription>
            </div>
            {weekInfo && (
              <div className="bg-brand-blue/20 border border-brand-blue/30 px-4 py-2 rounded-full text-xs font-black text-brand-blue uppercase tracking-widest tabular-nums shadow-[0_0_15px_rgba(46,133,254,0.2)]">
                Week {weekInfo.week} &bull; {weekInfo.year}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-6 md:pt-8 px-4 md:px-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 md:space-y-8"
            >
              {/* User Identity Section - Read Only with Game Style */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 p-4 md:p-6 rounded-2xl bg-muted/20 border border-border/40 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                  <Zap className="w-12 h-12 text-muted-foreground" />
                </div>
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Full Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          readOnly
                          className="bg-background/40 border-none font-bold text-foreground h-10 rounded-md cursor-not-allowed"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="muid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        MUID
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          readOnly
                          className="bg-background/40 border-none font-mono font-bold text-foreground h-10 rounded-md cursor-not-allowed"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="team"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        Guild
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          readOnly
                          className="bg-background/40 border-none font-bold text-foreground h-10 rounded-md cursor-not-allowed uppercase"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Status Section */}
              <FormField
                control={form.control}
                name="isOnLeave"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-4 space-y-0 rounded-2xl border border-brand-blue/30 p-4 md:p-6 bg-brand-blue/5 transition-all hover:bg-brand-blue/10">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1">
                      <FormLabel className="text-xs md:text-sm font-black uppercase tracking-tight text-foreground cursor-pointer flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-brand-blue" />
                        On Leave
                      </FormLabel>
                      <FormDescription className="text-[10px] font-bold text-muted-foreground/60 uppercase">
                        Select if you were on leave for this review period
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              {!isOnLeave && (
                <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="grid gap-6 md:gap-8 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="tasksAssigned"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                            Tasks Assigned
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Describe the tasks assigned to you this week..."
                              className="min-h-[120px] bg-background/50 border-border/50 font-bold focus:ring-brand-blue/30 rounded-md p-4 resize-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="tasksCompleted"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                            Tasks Completed
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Describe the tasks you completed this week..."
                              className="min-h-[120px] bg-background/50 border-border/50 font-bold focus:ring-success/30 rounded-md p-4 resize-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="worksDone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                          Weekly Review / Work Done
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Provide a detailed review of the work you performed..."
                            className="min-h-[120px] bg-background/50 border-border/50 font-bold focus:ring-brand-blue/30 rounded-md p-4 resize-none"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-6 md:gap-8 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="hoursCommitted"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                            <Sparkles className="w-3 h-3 text-warning" />
                            Hours Committed
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field}
                                type="number"
                                placeholder="Enter the total hours committed..."
                                className="bg-background/50 border-border/50 h-10 font-bold px-4 rounded-md focus:ring-brand-blue/30"
                                min="0"
                                step="0.25"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="blockers"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                            Blockers
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="List any blockers encountered (optional)..."
                              className="min-h-[80px] bg-background/50 border-border/50 font-bold focus:ring-destructive/30 rounded-md p-4 resize-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-6 md:gap-8 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="rating"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                            Weekly Rating (1-5)
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-background/50 border-border/50 h-10 font-bold rounded-md focus:ring-brand-blue/30">
                                <SelectValue placeholder="How was your week?" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-card font-bold border-border/60">
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

                    <FormField
                      control={form.control}
                      name="learnings"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                            Learnings
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Describe what you learned this week..."
                              className="min-h-[80px] bg-background/50 border-border/50 font-bold focus:ring-brand-blue/30 rounded-md p-4 resize-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-6 md:gap-8 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="challengesFaced"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                            Challenges Faced
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Describe any challenges you faced..."
                              className="min-h-[80px] bg-background/50 border-border/50 font-bold focus:ring-destructive/30 rounded-md p-4 resize-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="nextWeekPlan"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                            Next Week's Plan
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Outline your goals and plan for next week..."
                              className="min-h-[80px] bg-background/50 border-border/50 font-bold focus:ring-brand-blue/30 rounded-md p-4 resize-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="suggestions"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                          Feedback / Suggestions
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Any feedback or suggestions for improvement..."
                            className="min-h-[80px] bg-background/50 border-border/50 font-bold focus:ring-brand-blue/30 rounded-md p-4 resize-none"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {isOnLeave && (
                <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                  <FormField
                    control={form.control}
                    name="leaveDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                          Leave Days
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            placeholder="Number of leave days taken this week (e.g., 2). Enter 0 if none."
                            className="bg-background/50 border-border/50 h-10 font-bold px-4 rounded-md focus:ring-brand-blue/30"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <div className="flex flex-col items-center gap-4 md:gap-6 pt-4">
                <Button
                  type="submit"
                  className="w-full h-12 text-sm shadow-[0_8px_16px_rgba(46,133,254,0.25)] bg-brand-blue hover:bg-brand-blue/90 text-primary-foreground font-bold rounded-full transition-all duration-300"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Spinner className="mr-3 h-5 w-5" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Weekly Review"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
