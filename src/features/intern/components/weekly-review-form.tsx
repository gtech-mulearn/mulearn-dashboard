"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  CheckCircle2,
  Gem,
  Loader2,
  ShieldAlert,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
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
import { useUserInfo } from "@/features/auth";
import {
  useGuilds,
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

const DEFAULT_TEAMS = ["BACKEND", "FRONTEND", "DESIGN", "DEVOPS", "DATA", "QA"];

interface WeeklyReviewFormProps {
  onSuccess?: () => void;
}

export function WeeklyReviewForm({ onSuccess }: WeeklyReviewFormProps) {
  const { data: userData } = useUserInfo();
  const { data: guildsList } = useGuilds();
  const { data: currentReview, isLoading: isCurrentLoading } =
    useWeeklyReviewCurrent();
  const submitMutation = useSubmitWeeklyReview();

  const teams = guildsList || DEFAULT_TEAMS;
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
      team: "",
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
    if (userData) {
      form.reset({
        fullName: userData.full_name || "",
        muid: userData.muid || "",
        email: userData.email || "",
        team: form.getValues("team") || "",
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
  }, [userData, form]);

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

  if (isCurrentLoading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <Card className="border-border/40 bg-card/30 backdrop-blur-md shadow-2xl overflow-hidden relative py-4 md:py-6">
        <div className="absolute top-0 inset-x-0 h-1 bg-success/50" />
        <CardHeader className="text-xl md:text-2xl font-black uppercase tracking-tighter px-4 md:px-6">
          Weekly Chronicles
        </CardHeader>
        <CardContent className="px-4 md:px-6">
          <Alert className="bg-success/10 text-success border-success/20 py-4 md:py-6 px-4 md:px-6 rounded-2xl">
            <CheckCircle2 className="h-6 w-6" />
            <div className="ml-2">
              <AlertTitle className="text-base md:text-lg font-black uppercase">
                Archive Sealed
              </AlertTitle>
              <AlertDescription className="font-bold opacity-80 text-xs md:text-sm">
                You have already submitted your review for Week {weekInfo?.week}
                , {weekInfo?.year}. The next chronicle opens in 7 days.
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
                <Badge className="bg-brand-purple/10 text-brand-purple border-brand-purple/20 px-2 py-0.5 rounded-md font-black text-[10px] uppercase tracking-widest">
                  Weekly Boss Quest
                </Badge>
              </div>
              <CardTitle className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
                Weekly Review
              </CardTitle>
              <CardDescription className="font-bold text-muted-foreground/60 uppercase text-[10px] tracking-widest mt-1">
                Reflection earns you massive XP and rewards
              </CardDescription>
            </div>
            {weekInfo && (
              <div className="bg-brand-purple/20 border border-brand-purple/30 px-4 py-2 rounded-xl text-xs font-black text-brand-purple uppercase tracking-widest tabular-nums shadow-[0_0_15px_rgba(143,68,237,0.2)]">
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
                        Character Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          readOnly
                          className="bg-background/40 border-none font-bold text-foreground h-10 rounded-lg cursor-not-allowed"
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
                        ID Token (MUID)
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          readOnly
                          className="bg-background/40 border-none font-mono font-bold text-foreground h-10 rounded-lg cursor-not-allowed"
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
                        Alliance / Team
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                        required
                      >
                        <FormControl>
                          <SelectTrigger className="bg-background/60 border-border/50 h-10 font-bold rounded-lg focus:ring-brand-purple/30">
                            <SelectValue placeholder="Select Guild..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {teams.map((team) => (
                            <SelectItem
                              key={team}
                              value={team}
                              className="font-bold text-xs uppercase"
                            >
                              {team}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        className="h-6 w-6 rounded-md border-brand-blue/40 bg-background text-brand-blue focus:ring-brand-blue accent-brand-blue cursor-pointer data-[state=checked]:bg-brand-blue data-[state=checked]:text-white"
                      />
                    </FormControl>
                    <div className="space-y-1">
                      <FormLabel className="text-xs md:text-sm font-black uppercase tracking-tight text-foreground cursor-pointer flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-brand-blue" />
                        Character Inactive this week (On Leave)
                      </FormLabel>
                      <FormDescription className="text-[10px] font-bold text-muted-foreground/60 uppercase">
                        Skip reporting quests for this period
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
                            The Proclamation (Tasks Assigned)
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="What deeds were required of you?"
                              className="min-h-[120px] bg-background/50 border-border/50 font-bold focus:ring-brand-purple/30 rounded-2xl p-4 resize-none"
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
                            The Conquest (Tasks Completed)
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Which battles did you win?"
                              className="min-h-[120px] bg-background/50 border-border/50 font-bold focus:ring-success/30 rounded-2xl p-4 resize-none"
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
                          Chronicles of Work (Works Done)
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Detailed account of your legendary contributions..."
                            className="min-h-[120px] bg-background/50 border-border/50 font-bold focus:ring-brand-purple/30 rounded-2xl p-4 resize-none"
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
                            Energy Expended (Hours)
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field}
                                type="text"
                                placeholder="Total hours dedicated..."
                                className="bg-background/50 border-border/50 h-12 font-bold px-4 rounded-xl focus:ring-brand-purple/30"
                              />
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground/40 tracking-widest">
                                XP
                              </div>
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
                            Dark Shadows (Blockers)
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="Any monsters blocking your path?"
                              className="min-h-[80px] bg-background/50 border-border/50 font-bold focus:ring-destructive/30 rounded-2xl p-4 resize-none"
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
                            Rate Your Week (1-5)
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-background/50 border-border/50 h-12 font-bold rounded-xl focus:ring-brand-purple/30">
                                <SelectValue placeholder="How was your week?" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-card font-bold border-border/60">
                              {[1, 2, 3, 4, 5].map((val) => (
                                <SelectItem
                                  key={val}
                                  value={String(val)}
                                  className="font-bold text-xs"
                                >
                                  {val} -{" "}
                                  {val === 5
                                    ? "Excellent"
                                    : val === 1
                                      ? "Very Challenging"
                                      : `Tier ${val}`}
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
                            Aura of Wisdom (Learnings)
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="What new wisdom or skills did you acquire?"
                              className="min-h-[80px] bg-background/50 border-border/50 font-bold focus:ring-brand-purple/30 rounded-2xl p-4 resize-none"
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
                            Conquered Trials (Challenges Faced)
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="What obstacles did you face?"
                              className="min-h-[80px] bg-background/50 border-border/50 font-bold focus:ring-destructive/30 rounded-2xl p-4 resize-none"
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
                            Next Quest Plan
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              placeholder="What is your plan for the upcoming week?"
                              className="min-h-[80px] bg-background/50 border-border/50 font-bold focus:ring-brand-blue/30 rounded-2xl p-4 resize-none"
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
                            placeholder="Any suggestions for improvement or things you want the council to know?"
                            className="min-h-[80px] bg-background/50 border-border/50 font-bold focus:ring-brand-purple/30 rounded-2xl p-4 resize-none"
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
                          Rest Periods (Leave Days)
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="text"
                            placeholder="Number of leave days taken this week (e.g., 2). Enter 0 if none."
                            className="bg-background/50 border-border/50 h-12 font-bold px-4 rounded-xl focus:ring-brand-blue/30"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <div className="flex flex-col items-center gap-4 md:gap-6 pt-4">
                <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 md:p-6 bg-warning/5 border border-warning/20 rounded-2xl gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-warning/20 rounded-lg">
                      <Gem className="w-6 h-6 text-warning fill-warning" />
                    </div>
                    <div>
                      <p className="text-[10px] md:text-xs font-black uppercase text-warning tracking-widest">
                        Quest Reward
                      </p>
                      <p className="text-base md:text-lg font-black tabular-nums">
                        +50 GEMS
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-[10px] md:text-xs font-black uppercase text-muted-foreground tracking-widest">
                      Est. Experience
                    </p>
                    <p className="text-base md:text-lg font-black tabular-nums text-brand-blue">
                      +2500 XP
                    </p>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-14 md:h-16 bg-gradient-to-r from-brand-purple to-brand-blue hover:scale-[1.01] transition-all font-black uppercase tracking-[0.3em] text-xs md:text-sm shadow-[0_15px_30px_rgba(143,68,237,0.3)] rounded-2xl border-none"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                      Publishing Legend...
                    </>
                  ) : (
                    "Seal the Chronicles"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <p className="text-center text-[10px] font-bold text-muted-foreground/40 uppercase tracking-[0.4em] pb-12">
        Verified by the council &bull; No forgery allowed
      </p>
    </div>
  );
}
