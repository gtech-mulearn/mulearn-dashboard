/**
 * Task Card Component
 *
 * 📍 src/features/mujourney/components/TaskCard.tsx
 *
 * Individual task display with all metadata, now with markdown support
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Task } from "../schemas";
import { MarkdownRenderer } from "../utils/markdown";

interface TaskCardProps {
  task: Task;
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
  // Status badge colors matching the reference image
  const statusBadges = {
    completed: "bg-success/10 text-success border border-success/30",
    pending: "bg-warning/10 text-warning border border-warning/30",
    locked: "bg-muted text-muted-foreground border border-border",
  };

  // Hover effect with shadow only for pending tasks - enhanced shadow for more elevation
  const cardHoverClass = status === "pending" ? "hover:shadow-2xl" : "";

  // Fade effect for completed tasks
  const completedFadeClass = status === "completed" ? "opacity-60" : "";

  return (
    <Card
      className={cn(
        "relative transition-all duration-300 bg-card border border-border rounded-xl overflow-hidden shadow-md h-full flex flex-col focus:outline-none focus:ring-2 focus:ring-ring",
        cardHoverClass,
        completedFadeClass,
        onClick && status !== "locked" && "cursor-pointer",
        className,
      )}
      onClick={() => {
        if (onClick && status !== "locked") {
          onClick();
        }
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
      <CardContent className="p-5 sm:p-7 space-y-5 flex flex-col grow">
        {/* Status Badge */}
        <div>
          <span
            className={cn(
              "inline-block px-5 py-2 rounded-full text-sm font-semibold",
              statusBadges[status],
            )}
          >
            {status}
          </span>
        </div>

        {/* Task Title - Rendered with Markdown */}
        <div className="text-xl font-semibold text-card-foreground leading-tight">
          <MarkdownRenderer content={task.task_name} className="*:mb-0" />
        </div>

        {/* Description - Rendered with Markdown */}
        {/* {task.task_description && (
          <div className="text-base text-muted-foreground line-clamp-2 leading-relaxed">
            <MarkdownRenderer
              content={task.task_description}
              className="[&>*]:mb-0"
            />
          </div>
        )} */}

        {/* Metadata - Open Sans */}
        <div className="space-y-3 text-base grow min-w-0">
          <div className="flex items-start gap-1.5">
            <span className="font-bold text-card-foreground">
              Interest Group:
            </span>
            <span className="text-muted-foreground font-normal">
              {task.interest_group?.name || "General Tasks"}
            </span>
          </div>

          <div className="flex items-start gap-1.5">
            <span className="font-bold text-card-foreground">Karma:</span>
            <span className="text-muted-foreground font-normal">
              {task.karma}
            </span>
          </div>

          <div className="flex items-start gap-1.5 min-w-0">
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
        </div>

        {/* Action Button - Montserrat */}
        <div className="mt-auto pt-5">
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
              e.stopPropagation(); // Prevent card click when button is clicked
              if (onClick && status !== "locked") {
                onClick();
              }
            }}
          >
            {status === "locked" ? <span>🔒 Locked</span> : <span>View</span>}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
