"use client";

import {
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  ShieldAlert,
  Star,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useTimesheetHistory, useWeeklyReviews } from "../hooks/use-intern";

export function QuestLogHistory() {
  const [activeTab, setActiveTab] = useState<"daily" | "weekly">("daily");
  const [dailyPage, setDailyPage] = useState(1);
  const [weeklyPage, setWeeklyPage] = useState(1);
  const perPage = 10;

  // Daily timesheets history
  const { data: dailyData, isLoading: isDailyLoading } = useTimesheetHistory({
    page: dailyPage,
    perPage,
  });

  // Weekly reviews history
  const { data: weeklyData, isLoading: isWeeklyLoading } = useWeeklyReviews({
    page: weeklyPage,
    perPage,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <Badge className="bg-success/15 text-success border-success/30 font-black text-[10px] rounded-full px-2.5 py-0.5">
            Approved
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-brand-blue/15 text-brand-blue border-brand-blue/30 font-black text-[10px] rounded-full px-2.5 py-0.5">
            Pending
          </Badge>
        );
      case "REJECTED":
        return (
          <Badge className="bg-destructive/15 text-destructive border-destructive/30 font-black text-[10px] rounded-full px-2.5 py-0.5">
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="bg-muted/30 text-muted-foreground border-transparent font-black text-[10px] rounded-full px-2.5 py-0.5">
            Cancelled
          </Badge>
        );
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "DEVELOPMENT":
        return (
          <Badge className="bg-brand-blue/10 text-brand-blue border-brand-blue/20 text-[9px] font-black rounded-md uppercase tracking-wider px-2 py-0.5">
            Development
          </Badge>
        );
      case "DESIGN":
        return (
          <Badge className="bg-brand-purple/10 text-brand-purple border-brand-purple/20 text-[9px] font-black rounded-md uppercase tracking-wider px-2 py-0.5">
            Design
          </Badge>
        );
      case "TESTING":
        return (
          <Badge className="bg-warning/10 text-warning border-warning/20 text-[9px] font-black rounded-md uppercase tracking-wider px-2 py-0.5">
            Testing
          </Badge>
        );
      default:
        return (
          <Badge className="bg-muted/10 text-muted-foreground border-border/20 text-[9px] font-black rounded-md uppercase tracking-wider px-2 py-0.5">
            {category}
          </Badge>
        );
    }
  };

  const renderStars = (rating?: number) => {
    if (!rating) return null;
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }, (_, idx) => (
          <Star
            // biome-ignore lint/suspicious/noArrayIndexKey: static star rating layout
            key={idx}
            className={`w-3.5 h-3.5 ${
              idx < rating
                ? "text-warning fill-warning"
                : "text-muted/20 fill-muted/10"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6 max-w-7xl mx-auto w-full bg-background/50">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-brand-blue/10 text-brand-blue border-brand-blue/20 px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-widest">
              Quest History
            </Badge>
          </div>
          <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase">
            Quest Log History
          </h2>
          <p className="text-muted-foreground mt-1 font-medium italic">
            Review your submitted daily activity timesheets and weekly progress
            reports.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-border/20 pb-4">
        <button
          type="button"
          onClick={() => setActiveTab("daily")}
          className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-full transition-all duration-300 cursor-pointer ${
            activeTab === "daily"
              ? "bg-brand-blue text-primary-foreground shadow-md"
              : "bg-muted/10 text-muted-foreground hover:bg-muted/20"
          }`}
        >
          Daily Logs
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("weekly")}
          className={`px-4 py-2 text-xs font-black uppercase tracking-widest rounded-full transition-all duration-300 cursor-pointer ${
            activeTab === "weekly"
              ? "bg-brand-blue text-primary-foreground shadow-md"
              : "bg-muted/10 text-muted-foreground hover:bg-muted/20"
          }`}
        >
          Weekly Reviews
        </button>
      </div>

      <div className="space-y-6">
        {activeTab === "daily" ? (
          isDailyLoading ? (
            <div className="flex justify-center p-12">
              <Spinner className="w-8 h-8 text-primary" />
            </div>
          ) : !dailyData?.data || dailyData.data.length === 0 ? (
            <Card className="border-border/40 bg-card/30 backdrop-blur-md p-12 text-center">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider italic">
                No daily logs found.
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {dailyData.data.map((log) => (
                <Card
                  key={log.id}
                  className="border-border/40 bg-card/40 backdrop-blur-md shadow-md overflow-hidden"
                >
                  <CardHeader className="pt-4 pb-2 px-5 border-b border-border/20">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-brand-blue" />
                        <CardTitle className="text-sm font-black uppercase tracking-wider">
                          {new Date(log.entry_date).toLocaleDateString(
                            undefined,
                            {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            },
                          )}
                        </CardTitle>
                      </div>
                      {getStatusBadge(log.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-3 pb-4 px-5 space-y-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      {getCategoryBadge(log.category)}
                      <div className="flex items-center gap-1 text-[11px] font-black uppercase text-muted-foreground tracking-wider">
                        <Clock className="w-3.5 h-3.5" />
                        {log.hours} Hours
                      </div>
                      {log.karma_awarded !== null && (
                        <Badge className="bg-warning/10 text-warning border-none font-black text-[10px] rounded-md px-2 py-0.5">
                          +{log.karma_awarded} XP
                        </Badge>
                      )}
                    </div>

                    <div className="bg-background/40 border border-border/20 px-3 py-2 rounded-lg">
                      <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground/60 mb-1 flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        Achievement Log
                      </p>
                      <p className="text-xs font-medium text-foreground leading-tight line-clamp-4">
                        {log.description}
                      </p>
                    </div>

                    {log.blockers &&
                      log.blockers !== "None" &&
                      log.blockers !== "" && (
                        <div className="bg-destructive/5 border border-destructive/20 px-3 py-2 rounded-lg flex items-start gap-2">
                          <ShieldAlert className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
                          <div>
                            <p className="text-[9px] font-black uppercase text-destructive tracking-widest">
                              Blockers
                            </p>
                            <p className="text-xs text-muted-foreground font-medium leading-tight">
                              {log.blockers}
                            </p>
                          </div>
                        </div>
                      )}

                    {log.review_note && (
                      <div className="bg-brand-blue/5 border border-brand-blue/20 px-3 py-2 rounded-lg flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-brand-blue shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[9px] font-black uppercase text-brand-blue tracking-widest">
                            Reviewer Remarks
                          </p>
                          <p className="text-xs text-muted-foreground font-medium leading-tight">
                            {log.review_note}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}

              {/* Daily pagination */}
              <div className="flex items-center justify-between pt-4">
                <Button
                  onClick={() => setDailyPage((p) => Math.max(1, p - 1))}
                  disabled={dailyPage === 1}
                  variant="outline"
                  className="rounded-full h-9 text-xs font-black uppercase tracking-wider border-border/40 hover:bg-muted/20"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                </Button>
                <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                  Page {dailyPage} of {dailyData?.pagination?.totalPages || 1}
                </span>
                <Button
                  onClick={() => setDailyPage((p) => p + 1)}
                  disabled={!dailyData?.pagination?.isNext}
                  variant="outline"
                  className="rounded-full h-9 text-xs font-black uppercase tracking-wider border-border/40 hover:bg-muted/20"
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )
        ) : isWeeklyLoading ? (
          <div className="flex justify-center p-12">
            <Spinner className="w-8 h-8 text-primary" />
          </div>
        ) : !weeklyData?.data || weeklyData.data.length === 0 ? (
          <Card className="border-border/40 bg-card/30 backdrop-blur-md p-12 text-center">
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider italic">
              No weekly reviews found.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {weeklyData.data.map((review) => (
              <Card
                key={review.id}
                className="border-border/40 bg-card/40 backdrop-blur-md shadow-md overflow-hidden"
              >
                <CardHeader className="pt-4 pb-2 px-5 border-b border-border/20">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-brand-blue" />
                      <CardTitle className="text-sm font-black uppercase tracking-wider">
                        Week {review.iso_week} &bull; {review.iso_year}
                      </CardTitle>
                      <span className="text-[10px] text-muted-foreground font-bold italic">
                        ({new Date(review.week_start_date).toLocaleDateString()}{" "}
                        - {new Date(review.week_end_date).toLocaleDateString()})
                      </span>
                    </div>
                    {getStatusBadge(review.status)}
                  </div>
                </CardHeader>
                <CardContent className="pt-3 pb-4 px-5 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge className="bg-brand-blue/10 text-brand-blue border-brand-blue/20 text-[9px] font-black rounded-md uppercase tracking-wider px-2 py-0.5">
                      {review.team}
                    </Badge>
                    <div className="flex items-center gap-1 text-[11px] font-black uppercase text-muted-foreground tracking-wider">
                      <Clock className="w-3.5 h-3.5" />
                      {review.hours_committed} Hours Committed
                    </div>
                    {review.is_on_leave && (
                      <Badge className="bg-warning/10 text-warning border-none font-black text-[10px] rounded-md px-2 py-0.5">
                        On Leave ({review.leave_days} Days)
                      </Badge>
                    )}
                    {review.task_remarks?.rating &&
                      renderStars(review.task_remarks.rating)}
                    {review.karma_awarded !== null && (
                      <Badge className="bg-warning/10 text-warning border-none font-black text-[10px] rounded-md px-2 py-0.5">
                        +{review.karma_awarded} XP
                      </Badge>
                    )}
                  </div>

                  {!review.is_on_leave ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="bg-background/40 border border-border/20 px-3 py-2 rounded-lg space-y-1.5">
                        <div>
                          <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground/60 mb-0.5">
                            Tasks Assigned
                          </p>
                          <p className="text-xs font-medium text-foreground leading-tight line-clamp-3">
                            {review.tasks_assigned || "None"}
                          </p>
                        </div>
                        <div className="pt-2 border-t border-border/10">
                          <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground/60 mb-0.5">
                            Tasks Completed
                          </p>
                          <p className="text-xs font-medium text-foreground leading-tight line-clamp-3">
                            {review.tasks_completed || "None"}
                          </p>
                        </div>
                        <div className="pt-2 border-t border-border/10">
                          <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground/60 mb-0.5">
                            Weekly Review / Work Done
                          </p>
                          <p className="text-xs font-medium text-foreground leading-tight line-clamp-4">
                            {review.weekly_review || "None"}
                          </p>
                        </div>
                      </div>

                      <div className="bg-background/40 border border-border/20 px-3 py-2 rounded-lg space-y-1.5">
                        {review.task_remarks?.learnings && (
                          <div>
                            <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground/60 mb-0.5">
                              Learnings
                            </p>
                            <p className="text-xs font-medium text-foreground leading-tight line-clamp-3">
                              {review.task_remarks.learnings}
                            </p>
                          </div>
                        )}
                        {review.task_remarks?.challenges_faced && (
                          <div className="pt-2 border-t border-border/10">
                            <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground/60 mb-0.5">
                              Challenges Faced
                            </p>
                            <p className="text-xs font-medium text-foreground leading-tight line-clamp-3">
                              {review.task_remarks.challenges_faced}
                            </p>
                          </div>
                        )}
                        {review.task_remarks?.next_week_plan && (
                          <div className="pt-2 border-t border-border/10">
                            <p className="text-[9px] font-black uppercase tracking-wider text-muted-foreground/60 mb-0.5">
                              Next Week's Plan
                            </p>
                            <p className="text-xs font-medium text-foreground leading-tight line-clamp-3">
                              {review.task_remarks.next_week_plan}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-background/40 border border-border/20 px-3 py-2 rounded-lg">
                      <p className="text-xs font-bold text-muted-foreground italic uppercase tracking-wider">
                        Marked as on leave this week.
                      </p>
                    </div>
                  )}

                  {review.blockers && (
                    <div className="bg-destructive/5 border border-destructive/20 px-3 py-2 rounded-lg flex items-start gap-3">
                      <ShieldAlert className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-black uppercase text-destructive tracking-widest">
                          Blockers Encountered
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 font-medium leading-tight">
                          {review.blockers}
                        </p>
                      </div>
                    </div>
                  )}

                  {review.review_note && (
                    <div className="bg-brand-blue/5 border border-brand-blue/20 px-3 py-2 rounded-lg flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-brand-blue shrink-0 mt-0.5" />
                      <div>
                        <p className="text-[10px] font-black uppercase text-brand-blue tracking-widest">
                          Council Review Remarks
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 font-medium leading-tight">
                          {review.review_note}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {/* Weekly pagination */}
            <div className="flex items-center justify-between pt-4">
              <Button
                onClick={() => setWeeklyPage((p) => Math.max(1, p - 1))}
                disabled={weeklyPage === 1}
                variant="outline"
                className="rounded-full h-9 text-xs font-black uppercase tracking-wider border-border/40 hover:bg-muted/20"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Prev
              </Button>
              <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                Page {weeklyPage} of {weeklyData?.pagination?.totalPages || 1}
              </span>
              <Button
                onClick={() => setWeeklyPage((p) => p + 1)}
                disabled={!weeklyData?.pagination?.isNext}
                variant="outline"
                className="rounded-full h-9 text-xs font-black uppercase tracking-wider border-border/40 hover:bg-muted/20"
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
