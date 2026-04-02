/**
 * Task List Component
 *
 * 📍 src/features/mujourney/components/TaskList.tsx
 *
 * Horizontal scrollable view of tasks with arrow navigation
 */

"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";
import type { Task } from "../schemas";
import { TaskCard } from "./TaskCard";
import { TaskDetailPanel } from "./TaskDetailPanel";

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
      {/* Left Arrow - hidden on small mobile, visible on sm and up hover */}
      <button
        type="button"
        onClick={() => scroll("left")}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-card/80 backdrop-blur-sm hover:bg-card rounded-full p-2.5 shadow-xl border border-border hidden sm:block group-hover:block transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-5 h-5 text-foreground" />
      </button>

      {/* Horizontal scrollable container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 sm:gap-6 min-h-[500px] overflow-x-auto snap-x snap-mandatory no-scrollbar pb-6 px-4"
      >
        {tasks.map((task, index) => {
          const baseKey = task.hashtag
            ? task.hashtag.replace("#", "")
            : `task-${index}`;
          const uniqueKey = keyPrefix ? `${keyPrefix}-${baseKey}` : baseKey;

          return (
            <div
              key={uniqueKey}
              className="shrink-0 w-[78vw] sm:w-[350px] snap-start h-full"
            >
              <TaskCard
                task={task}
                status={getTaskStatus(task)}
                onClick={() => handleTaskClick(task)}
              />
            </div>
          );
        })}
        {/* Spacer to allow the last card to peek correctly */}
        <div className="shrink-0 w-4 sm:hidden" aria-hidden="true" />
      </div>

      {/* Right Arrow - more visible on hover, but accessible */}
      <button
        type="button"
        onClick={() => scroll("right")}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-card/80 backdrop-blur-sm hover:bg-card rounded-full p-2.5 shadow-xl border border-border hidden sm:block group-hover:block transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-5 h-5 text-foreground" />
      </button>

      {/* Mobile Scroll Hint - Pulse animation on the last partially visible card edge or just card layout */}
      <div className="flex justify-center gap-1.5 mt-2 sm:hidden">
        {tasks.slice(0, Math.min(tasks.length, 5)).map((_, i) => (
          <div
            key={`dot-${i}`}
            className="w-1.5 h-1.5 rounded-full bg-primary/20"
          />
        ))}
      </div>

      {/* Task Detail Panel */}
      <TaskDetailPanel
        task={selectedTask}
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
      />
    </div>
  );
}
