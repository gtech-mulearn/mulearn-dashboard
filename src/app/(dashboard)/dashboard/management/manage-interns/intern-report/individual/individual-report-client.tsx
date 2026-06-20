"use client";

import { ArrowLeft, Clock, Sparkles } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { Spinner } from "@/components/ui/spinner";
import { useManageWeeklyReviews } from "@/features/intern";
import {
  formatTasksAssigned,
  formatTasksCompleted,
} from "@/features/intern/utils/intern-helpers";

export function IndividualReportPageClient() {
  const searchParams = useSearchParams();
  const muid = searchParams.get("muid") || "";

  const { data: reviewsResponse, isLoading } = useManageWeeklyReviews({
    search: muid || undefined,
    page: 1,
    perPage: 100,
  });

  const reviews = reviewsResponse?.data || [];
  const name = reviews[0]?.user_name || "Intern";

  // Compute metrics
  const totalHours = reviews.reduce(
    (acc, curr) => acc + (curr.hours_committed || 0),
    0,
  );
  const totalSubmissions = reviews.length;
  const leavesCount = reviews.filter((r) => r.is_on_leave).length;

  return (
    <div className="space-y-8 max-w-5xl mx-auto w-full">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/management/manage-interns/intern-report">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <Badge
            variant="outline"
            className="font-black text-[10px] uppercase tracking-widest"
          >
            Individual Scroll
          </Badge>
          <h2 className="text-3xl font-black tracking-tighter text-foreground uppercase mt-1">
            Report: {name}
          </h2>
          <p className="text-xs text-muted-foreground font-mono font-bold leading-none mt-1">
            Token: {muid}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Spinner className="w-8 h-8 text-primary" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid gap-6 sm:grid-cols-3">
            <Card className="border-border/40 bg-card/40 backdrop-blur-md shadow-lg">
              <CardHeader className="pb-2">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  Total Energy
                </span>
                <CardTitle className="text-2xl font-black text-brand-blue mt-1">
                  {totalHours} hrs
                </CardTitle>
              </CardHeader>
              <CardContent className="text-[10px] font-bold text-muted-foreground uppercase">
                Hours committed
              </CardContent>
            </Card>
            <Card className="border-border/40 bg-card/40 backdrop-blur-md shadow-lg">
              <CardHeader className="pb-2">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  Chronicles
                </span>
                <CardTitle className="text-2xl font-black text-brand-purple mt-1">
                  {totalSubmissions}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-[10px] font-bold text-muted-foreground uppercase">
                Weekly reviews submitted
              </CardContent>
            </Card>
            <Card className="border-border/40 bg-card/40 backdrop-blur-md shadow-lg">
              <CardHeader className="pb-2">
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                  Rest Periods
                </span>
                <CardTitle className="text-2xl font-black text-warning mt-1">
                  {leavesCount}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-[10px] font-bold text-muted-foreground uppercase">
                Weeks on leave
              </CardContent>
            </Card>
          </div>

          {/* Timeline */}
          <Card className="border-border/40 bg-card/30 backdrop-blur-md shadow-xl">
            <CardHeader>
              <CardTitle className="text-lg font-black uppercase tracking-widest">
                Review Chronicles Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative border-l border-border/60 pl-6 space-y-8">
                {reviews.map((review) => (
                  <div key={review.id} className="relative group">
                    <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 border-background bg-primary shadow-md flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-background" />
                    </div>
                    <div className="bg-card/40 border border-border/40 p-4 rounded-2xl space-y-3 shadow-md hover:border-brand-purple/40 transition-all">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <span className="text-sm font-black text-brand-purple uppercase tracking-widest">
                            Week {review.iso_week} &bull; {review.iso_year}
                          </span>
                          <span className="text-[10px] text-muted-foreground font-mono font-bold block mt-1">
                            Starts:{" "}
                            {new Date(
                              review.week_start_date,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className="font-bold text-[9px] uppercase tracking-widest"
                          >
                            {review.team}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`font-black tracking-widest text-[9px] uppercase ${
                              review.status === "APPROVED"
                                ? "bg-success/10 text-success border-success/30"
                                : review.status === "REJECTED"
                                  ? "bg-destructive/10 text-destructive border-destructive/30"
                                  : "bg-warning/10 text-warning border-warning/30"
                            }`}
                          >
                            {review.status}
                          </Badge>
                        </div>
                      </div>

                      {review.is_on_leave ? (
                        <p className="text-xs italic text-warning font-bold">
                          Intern was on leave this week.
                        </p>
                      ) : (
                        <>
                          <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1">
                              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider block">
                                Tasks Assigned
                              </span>
                              <div className="text-xs font-semibold text-foreground/80 leading-relaxed">
                                <MarkdownRenderer
                                  content={formatTasksAssigned(
                                    review.tasks_assigned,
                                  )}
                                />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider block">
                                Tasks Completed
                              </span>
                              <div className="text-xs font-semibold text-foreground/80 leading-relaxed">
                                <MarkdownRenderer
                                  content={formatTasksCompleted(
                                    review.tasks_completed,
                                  )}
                                />
                              </div>
                            </div>
                          </div>

                          {review.weekly_review && (
                            <div className="space-y-1 pt-1 border-t border-border/10">
                              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-wider block">
                                Achievements Summary
                              </span>
                              <div className="text-xs text-muted-foreground leading-relaxed italic">
                                <MarkdownRenderer
                                  content={review.weekly_review}
                                />
                              </div>
                            </div>
                          )}

                          <div className="flex flex-wrap items-center gap-4 text-[10px] font-black uppercase tracking-wider text-muted-foreground pt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-brand-blue" />
                              {review.hours_committed} Hours Committed
                            </span>
                            {review.task_remarks?.rating && (
                              <span className="flex items-center gap-1 text-warning">
                                ⭐ {review.task_remarks.rating} Rating
                              </span>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                ))}

                {reviews.length === 0 && (
                  <div className="text-center text-xs text-muted-foreground italic uppercase tracking-wider py-8">
                    No review records found for this token
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/20 py-8">
        <Sparkles className="w-3 h-3" /> Data Sanctum{" "}
        <Sparkles className="w-3 h-3" />
      </div>
    </div>
  );
}
