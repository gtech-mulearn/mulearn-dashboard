/**
 * Task List Component
 *
 * 📍 src/features/mujourney/components/TaskList.tsx
 *
 * Horizontal scrollable view of tasks with arrow navigation
 */

"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import type { Task } from "../schemas";
import { TaskCard } from "./TaskCard";

const TaskDetailPanel = dynamic(
  () =>
    import("./TaskDetailPanel").then((mod) => ({
      default: mod.TaskDetailPanel,
    })),
  { ssr: false },
);

interface TaskListProps {
  tasks: Task[];
  isLocked?: boolean;
  keyPrefix?: string;
}

export function TaskList({
  tasks,
  isLocked = false,
  keyPrefix = "",
}: TaskListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    // Delay clearing the task to allow animation to complete
    setTimeout(() => setSelectedTask(null), 500);
  };

  const getTaskStatus = (task: Task) => {
    if (isLocked) return "locked";
    if (task.completed) return "completed";
    return "pending";
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 370; // Card width (350px) + gap (20px)
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft +
        (direction === "right" ? scrollAmount : -scrollAmount);
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative group">
      {/* Left Arrow */}
      <button
        type="button"
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-card hover:bg-muted rounded-full p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-6 h-6 text-card-foreground" />
      </button>

      {/* Horizontal scrollable container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-6 min-h-[500px] overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {tasks.map((task, index) => {
          // Use hashtag (without #) with prefix or fallback to index for unique key
          const baseKey = task.hashtag
            ? task.hashtag.replace("#", "")
            : `task-${index}`;
          const uniqueKey = keyPrefix ? `${keyPrefix}-${baseKey}` : baseKey;

          return (
            <div
              key={uniqueKey}
              className="shrink-0 w-[85vw] sm:w-[350px] snap-start h-full"
            >
              <TaskCard
                task={task}
                status={getTaskStatus(task)}
                onClick={() => handleTaskClick(task)}
              />
            </div>
          );
        })}
      </div>

      {/* Right Arrow */}
      <button
        type="button"
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-card hover:bg-muted rounded-full p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-6 h-6 text-card-foreground" />
      </button>

      {/* Task Detail Panel */}
      <TaskDetailPanel
        task={selectedTask}
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
      />
    </div>
  );
}
