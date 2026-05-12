"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
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
    toast.loading("Submitting review...", { id: "submit-review" });

    // Simulate API call
    setTimeout(() => {
      toast.success("Review submitted successfully!", {
        id: "submit-review",
      });
      form.reset();
      onSuccess?.();
    }, 1000);
  };

  if (isSubmitted) {
    return (
      <Card>
        <CardHeader className="text-2xl font-semibold">
          Weekly Review Form
        </CardHeader>
        <CardContent>
          <Alert className="bg-chart-2/10 text-chart-2 border-chart-2/20">
            <AlertTitle>Already Submitted</AlertTitle>
            <AlertDescription>
              You have already submitted your review for Week {weekInfo?.week},{" "}
              {weekInfo?.year}. Next submission opens next week (7 days from
              now).
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Weekly Review Form</h2>
          {weekInfo && (
            <div className="bg-muted px-3 py-1 rounded-md text-sm font-medium">
              Week {weekInfo.week}, {weekInfo.year}
            </div>
          )}
        </div>
        <CardDescription>
          Submit your progress for the current ISO week.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        readOnly
                        className="bg-muted/50 cursor-not-allowed"
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
                    <FormLabel>MUID</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        readOnly
                        className="bg-muted/50 cursor-not-allowed"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        readOnly
                        className="bg-muted/50 cursor-not-allowed"
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
                    <FormLabel>Team</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your team" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {teams.map((team) => (
                          <SelectItem key={team} value={team}>
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

            <FormField
              control={form.control}
              name="isOnLeave"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow-sm">
                  <FormControl>
                    <Input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary mt-0.5"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>I was on leave this week</FormLabel>
                    <FormDescription>
                      Check this if you were on leave for the entire week and
                      have no tasks to report.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {!isOnLeave && (
              <>
                <FormField
                  control={form.control}
                  name="tasksAssigned"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tasks Assigned</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Enter tasks assigned..."
                          className="min-h-[80px] resize-none"
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
                      <FormLabel>Tasks Completed</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Enter tasks completed..."
                          className="min-h-[80px] resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="worksDone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Works Done</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Enter works done..."
                          className="min-h-[80px] resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hoursCommitted"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hours Committed</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          placeholder="Enter hours committed"
                        />
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
                      <FormLabel>Blockers</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Enter any blockers..."
                          className="min-h-[80px] resize-none"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <FormField
              control={form.control}
              name="leaveDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Leave Days</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Enter leave dates comma separated (e.g., 25/04/2026). If none, say 'No leaves taken'..."
                      className="min-h-[80px] resize-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Review"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
