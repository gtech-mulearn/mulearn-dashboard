/**
 * Task Card Component
 *
 * 📍 src/features/mujourney/components/TaskCard.tsx
 *
 * Individual task display card using TaskListPublic fields from the redesigned API.
 * Fields: title, description, karma, hashtag, ig, channel, level, type, variable_karma
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { TaskListPublic } from "../schemas";
import { MarkdownRenderer } from "../utils/markdown";

interface TaskCardProps {
  task: TaskListPublic;
  status?: "completed" | "pending" | "locked";
  className?: string;
  onClick?: () => void;
}

export function TaskCard({
  task,
  status = "pending",
  className,
  onClick,
}: TaskCardProps) {
  const statusBadges = {
    completed: "bg-success/10 text-success border border-success/30",
    pending: "bg-warning/10 text-warning border border-warning/30",
    locked: "bg-muted text-muted-foreground border border-border",
  };

  const cardHoverClass = status === "pending" ? "hover:shadow-2xl" : "";
  const completedFadeClass = status === "completed" ? "opacity-60" : "";

  return (
    <Card
      className={cn(
        "relative transition-all duration-300 bg-card border border-border rounded-xl overflow-hidden shadow-md h-full w-full flex flex-col focus:outline-none focus:ring-2 focus:ring-ring",
        cardHoverClass,
        completedFadeClass,
        onClick && status !== "locked" && "cursor-pointer",
        className,
      )}
      onClick={() => {
        if (onClick && status !== "locked") onClick();
      }}
      role={onClick && status !== "locked" ? "button" : undefined}
      tabIndex={onClick && status !== "locked" ? 0 : undefined}
      onKeyDown={(e) => {
        if (
          onClick &&
          status !== "locked" &&
          (e.key === "Enter" || e.key === " ")
        ) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <CardContent className="p-5 sm:p-6 flex flex-col h-full justify-between gap-4">
        {/* Status Badge */}
        <div className="shrink-0">
          <span
            className={cn(
              "inline-block px-5 py-2 rounded-full text-sm font-semibold",
              statusBadges[status],
            )}
          >
            {status}
          </span>
        </div>

        {/* Task Title */}
        <div
          className="shrink-0 min-h-[3.25rem] flex items-center text-xl font-semibold text-card-foreground leading-snug"
          title={task.title}
        >
          <MarkdownRenderer
            content={task.title}
            className="*:mb-0 line-clamp-2"
          />
        </div>

        {/* Metadata */}
        <div className="space-y-3 text-base grow min-w-0 flex flex-col justify-center">
          {/* Interest Group */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-bold text-card-foreground shrink-0">
              Interest Group:
            </span>
            <span
              className="text-muted-foreground font-normal truncate"
              title={task.ig ?? "General Tasks"}
            >
              {task.ig ?? "General Tasks"}
            </span>
          </div>

          {/* Karma */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-bold text-card-foreground shrink-0">
              Karma:
            </span>
            <span className="text-muted-foreground font-normal">
              {task.variable_karma ? `${task.karma}+` : task.karma}
            </span>
          </div>

          {/* Hashtag */}
          {task.hashtag && (
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-bold text-card-foreground shrink-0">
                Hashtag:
              </span>
              <span
                className="inline-block px-3 py-1 bg-muted text-muted-foreground rounded-full font-mono text-sm font-normal truncate max-w-full"
                title={task.hashtag}
              >
                {task.hashtag}
              </span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="mt-auto shrink-0 pt-2">
          <Button
            variant="default"
            className={cn(
              "w-full rounded-lg font-semibold transition-all duration-200 h-11 text-base",
              status === "completed" && "opacity-80",
              status === "locked" &&
                "bg-muted text-muted-foreground cursor-not-allowed",
            )}
            disabled={status === "locked"}
            onClick={(e) => {
              e.stopPropagation();
              if (onClick && status !== "locked") onClick();
            }}
          >
            {status === "locked" ? <span>🔒 Locked</span> : <span>View</span>}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
