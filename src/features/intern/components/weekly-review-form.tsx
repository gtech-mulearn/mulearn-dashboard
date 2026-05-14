"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  Gem,
  Sparkles,
  Target,
  Zap,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
import { type WeeklyReviewFormValues, weeklyReviewSchema } from "../schemas";
import { Badge } from "@/components/ui/badge";

const DEFAULT_TEAMS = [
  "Web Dev",
  "AI",
  "Devops",
  "Partner Engagement",
  "Tech Team",
];

interface WeeklyReviewFormProps {
  onSuccess?: () => void;
}

export function WeeklyReviewForm({ onSuccess }: WeeklyReviewFormProps) {
  const { data } = useUserInfo();
  const [teams] = useState<string[]>(DEFAULT_TEAMS);

  // Mock week info since API is removed
  const weekInfo = { week: 13, year: 2026 };
  const isSubmitted = false;

  const form = useForm<WeeklyReviewFormValues>({
    resolver: zodResolver(weeklyReviewSchema),
    defaultValues: {
      fullName: data?.full_name || "",
      muid: data?.muid || "",
      email: data?.email || "",
      team: "",
      isOnLeave: false,
      tasksAssigned: "",
      tasksCompleted: "",
      worksDone: "",
      hoursCommitted: "",
      blockers: "",
      leaveDays: "",
    },
  });

  const isOnLeave = form.watch("isOnLeave");

  const onSubmit = async (data: WeeklyReviewFormValues) => {
    toast.loading("Publishing your weekly legend...", { id: "submit-review" });

    // Simulate API call
    setTimeout(() => {
      toast.success("Epic Quest Complete! +50 Gems & Massive XP earned", {
        id: "submit-review",
        icon: <Sparkles className="w-4 h-4 text-warning" />,
      });
      form.reset();
      onSuccess?.();
    }, 1500);
  };

  if (isSubmitted) {
    return (
      <Card className="border-border/40 bg-card/30 backdrop-blur-md shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 inset-x-0 h-1 bg-success/50" />
        <CardHeader className="text-2xl font-black uppercase tracking-tighter">
          Weekly Chronicles
        </CardHeader>
        <CardContent>
          <Alert className="bg-success/10 text-success border-success/20 py-6 rounded-2xl">
            <CheckCircle2 className="h-6 w-6" />
            <div className="ml-2">
              <AlertTitle className="text-lg font-black uppercase">
                Archive Sealed
              </AlertTitle>
              <AlertDescription className="font-bold opacity-80">
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
      <Card className="border-border/40 bg-card/40 backdrop-blur-xl shadow-2xl overflow-hidden relative group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
          <Target className="w-64 h-64 text-primary" />
        </div>
        <CardHeader className="border-b border-border/20 bg-muted/20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge className="bg-brand-purple/10 text-brand-purple border-brand-purple/20 px-2 py-0.5 rounded-md font-black text-[10px] uppercase tracking-widest">
                  Weekly Boss Quest
                </Badge>
              </div>
              <CardTitle className="text-3xl font-black uppercase tracking-tighter">
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
        <CardContent className="pt-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              {/* User Identity Section - Read Only with Game Style */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-2xl bg-muted/20 border border-border/40 relative overflow-hidden">
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
                  <FormItem className="flex flex-row items-center space-x-4 space-y-0 rounded-2xl border border-brand-blue/30 p-6 bg-brand-blue/5 transition-all hover:bg-brand-blue/10">
                    <FormControl>
                      <input
                        type="checkbox"
                        className="h-6 w-6 rounded-md border-brand-blue/40 bg-background text-brand-blue focus:ring-brand-blue accent-brand-blue cursor-pointer"
                        checked={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1">
                      <FormLabel className="text-sm font-black uppercase tracking-tight text-foreground cursor-pointer flex items-center gap-2">
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
                <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="grid gap-8 md:grid-cols-2">
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

                  <div className="grid gap-8 md:grid-cols-2">
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
                </div>
              )}

              <FormField
                control={form.control}
                name="leaveDays"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                      Rest Periods (Leave Days)
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Dates of respite (e.g., 25/04/2026). If none, type 'None'..."
                        className="min-h-[80px] bg-background/50 border-border/50 font-bold focus:ring-brand-blue/30 rounded-2xl p-4 resize-none"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col items-center gap-6 pt-4">
                <div className="w-full flex items-center justify-between px-6 py-4 bg-warning/5 border border-warning/20 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-warning/20 rounded-lg">
                      <Gem className="w-6 h-6 text-warning fill-warning" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase text-warning tracking-widest">
                        Quest Reward
                      </p>
                      <p className="text-lg font-black tabular-nums">
                        +50 GEMS
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black uppercase text-muted-foreground tracking-widest">
                      Est. Experience
                    </p>
                    <p className="text-lg font-black tabular-nums text-brand-blue">
                      +2500 XP
                    </p>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-16 bg-gradient-to-r from-brand-purple to-brand-blue hover:scale-[1.01] transition-all font-black uppercase tracking-[0.3em] text-sm shadow-[0_15px_30px_rgba(143,68,237,0.3)] rounded-2xl border-none"
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
