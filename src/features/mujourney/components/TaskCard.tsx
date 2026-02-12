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
    completed: "bg-green-100 text-green-700 ",
    pending: "bg-yellow-100 text-yellow-700  ",
    locked: "bg-gray-100 text-gray-600 ",
  };

  // Hover effect with shadow only for pending tasks - enhanced shadow for more elevation
  const cardHoverClass =
    status === "pending" ? "hover:shadow-2xl hover:-translate-y-1" : "";

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
      <CardContent className="p-7 space-y-5 flex flex-col grow">
        {/* Status Badge */}
        <div>
          <span
            className={cn(
              "inline-block px-5 py-2 rounded-full text-sm font-semibold font-open-sans",
              statusBadges[status],
            )}
          >
            {status}
          </span>
        </div>

        {/* Task Title - Rendered with Markdown */}
        <div className="text-xl font-semibold text-card-foreground leading-tight font-montserrat">
          <MarkdownRenderer content={task.task_name} className="[&>*]:mb-0" />
        </div>

        {/* Description - Rendered with Markdown */}
        {/* {task.task_description && (
          <div className="text-base text-muted-foreground line-clamp-2 leading-relaxed font-open-sans">
            <MarkdownRenderer
              content={task.task_description}
              className="[&>*]:mb-0"
            />
          </div>
        )} */}

        {/* Metadata - Open Sans */}
        <div className="space-y-3 text-base font-open-sans flex-grow">
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

          <div className="flex items-start gap-1.5">
            <span className="font-bold text-card-foreground">Hashtag:</span>
            <span className="inline-block px-3 py-1 bg-muted text-muted-foreground rounded-full font-mono text-sm font-normal">
              {task.hashtag}
            </span>
          </div>
        </div>

        {/* Action Button - Montserrat */}
        <div className="mt-auto pt-5">
          <Button
            className={cn(
              "w-full rounded-lg font-semibold text-white transition-all duration-200 h-11 text-base font-montserrat cursor-pointer",
              // Blue background for all tasks
              status === "pending" && "bg-blue-600 hover:bg-blue-700",
              // Lighter blue for completed tasks (dimmed)
              status === "completed" &&
                "bg-blue-400 hover:bg-blue-500 opacity-70",
              // Gray for locked tasks
              status === "locked" && "bg-gray-400 cursor-not-allowed",
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
