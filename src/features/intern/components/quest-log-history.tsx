"use client";

import { Calendar, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { useInternActivityLog } from "../hooks/use-intern";

export function QuestLogHistory() {
  const [page, setPage] = useState(1);
  const perPage = 10;

  const { data: activityLog, isLoading } = useInternActivityLog({
    page,
    perPage,
  });

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Spinner className="w-8 h-8 text-primary" />
      </div>
    );
  }

  const activities = activityLog?.data || [];
  const totalPages = activityLog?.pagination?.totalPages || 1;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6 max-w-7xl mx-auto w-full bg-background/50">
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
            Review your approved accomplishments and XP gains.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => (
          <Card
            key={activity.id}
            className="border-border/40 bg-card/40 backdrop-blur-md shadow-md overflow-hidden py-4 px-5"
          >
            <CardHeader className="pt-0 px-0 pb-2 border-b border-border/20">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-brand-blue" />
                  <CardTitle className="text-sm font-black uppercase tracking-wider">
                    {new Date(activity.created_at).toLocaleDateString(
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
                <div className="flex items-center gap-2">
                  <Badge className="bg-success/15 text-success border-success/30 font-black text-[10px] rounded-full px-2.5 py-0.5 uppercase tracking-wider">
                    Approved
                  </Badge>
                  <Badge className="bg-warning/15 text-warning border-warning/30 font-black text-[10px] rounded-full px-2.5 py-0.5 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />+{activity.karma} XP
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-3 pb-0 px-0">
              <p className="text-xs font-medium text-foreground leading-relaxed">
                {activity.task_title}
              </p>
            </CardContent>
          </Card>
        ))}

        {activities.length === 0 && (
          <Card className="border-border/40 bg-card/30 backdrop-blur-md p-12 text-center">
            <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider italic">
              No quests logged yet.
            </p>
          </Card>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <Button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              variant="outline"
              className="rounded-full h-9 text-xs font-black uppercase tracking-wider border-border/40 hover:bg-muted/20"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Prev
            </Button>
            <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">
              Page {page} of {totalPages}
            </span>
            <Button
              onClick={() => setPage((p) => p + 1)}
              disabled={!activityLog?.pagination?.isNext}
              variant="outline"
              className="rounded-full h-9 text-xs font-black uppercase tracking-wider border-border/40 hover:bg-muted/20"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
