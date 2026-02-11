/**
 * Task Card Component
 *
 * 📍 src/features/mujourney/components/TaskCard.tsx
 *
 * Individual task display with all metadata
 */

"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Task } from "../schemas";

interface TaskCardProps {
  task: Task;
  status?: "completed" | "pending" | "locked";
  className?: string;
}

export function TaskCard({
  task,
  status = "pending",
  className,
}: TaskCardProps) {
  // Status badge colors matching the reference image
  const statusBadges = {
    completed:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    pending:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    locked: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  };

  // Hover effect with shadow only for pending tasks - enhanced shadow for more elevation
  const cardHoverClass =
    status === "pending" ? "hover:shadow-2xl hover:-translate-y-1" : "";

  // Fade effect for completed tasks
  const completedFadeClass = status === "completed" ? "opacity-60" : "";

  return (
    <Card
      className={cn(
        "relative transition-all duration-300 bg-card border border-border rounded-xl overflow-hidden shadow-md h-full flex flex-col",
        cardHoverClass,
        completedFadeClass,
        className,
      )}
    >
      <CardContent className="p-7 space-y-5 flex flex-col flex-grow">
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

        {/* Task Title - Montserrat */}
        <h3 className="text-xl font-semibold text-card-foreground leading-tight font-montserrat">
          {task.task_name}
        </h3>

        {/* Description - Open Sans */}
        {task.task_description && (
          <p className="text-base text-muted-foreground line-clamp-2 leading-relaxed font-open-sans">
            {task.task_description}
          </p>
        )}

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
            asChild={status !== "locked" && !!task.discord_link}
          >
            {status === "locked" ? (
              <span>🔒 Locked</span>
            ) : task.discord_link ? (
              <Link
                href={task.discord_link}
                target="_blank"
                rel="noopener noreferrer"
              >
                View
              </Link>
            ) : (
              <span>View</span>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
