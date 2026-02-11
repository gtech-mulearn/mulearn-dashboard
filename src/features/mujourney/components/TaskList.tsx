/**
 * Task List Component
 *
 * 📍 src/features/mujourney/components/TaskList.tsx
 *
 * Horizontal scrollable view of tasks with arrow navigation
 */

"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import type { Task } from "../schemas";
import { TaskCard } from "./TaskCard";

interface TaskListProps {
  tasks: Task[];
  isLocked?: boolean;
}

export function TaskList({ tasks, isLocked = false }: TaskListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-card hover:bg-muted rounded-full p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-6 h-6 text-card-foreground" />
      </button>

      {/* Horizontal scrollable container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-6 overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {tasks.map((task, index) => {
          // Use hashtag (without #) or fallback to index for unique key
          const uniqueKey = task.hashtag
            ? task.hashtag.replace("#", "")
            : `task-${index}`;

          return (
            <div key={uniqueKey} className="flex-shrink-0 w-[350px] snap-start">
              <TaskCard task={task} status={getTaskStatus(task)} />
            </div>
          );
        })}
      </div>

      {/* Right Arrow */}
      <button
        type="button"
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-card hover:bg-muted rounded-full p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-6 h-6 text-card-foreground" />
      </button>
    </div>
  );
}
