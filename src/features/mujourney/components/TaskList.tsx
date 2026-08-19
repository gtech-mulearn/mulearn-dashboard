/**
 * Task List Component
 *
 * 📍 src/features/mujourney/components/TaskList.tsx
 *
 * Horizontal scrollable view of tasks with arrow navigation.
 * Uses TaskListPublic from the redesigned unified task list API.
 */

"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import type { TaskListPublic } from "../schemas";
import { TaskCard } from "./TaskCard";

const TaskDetailPanel = dynamic(() =>
  import("./TaskDetailPanel").then((mod) => ({
    default: mod.TaskDetailPanel,
  })),
);

interface TaskListProps {
  tasks: TaskListPublic[];
  isLocked?: boolean;
  keyPrefix?: string;
}

export function TaskList({
  tasks,
  isLocked = false,
  keyPrefix = "",
}: TaskListProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [selectedTask, setSelectedTask] = useState<TaskListPublic | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const handleTaskClick = (task: TaskListPublic) => {
    setSelectedTask(task);
    setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
    setIsPanelOpen(false);
    setTimeout(() => setSelectedTask(null), 500);
  };

  const getTaskStatus = (task: TaskListPublic) => {
    if (isLocked) return "locked";
    if (task.completed) return "completed";
    return "pending";
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 370;
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
      {/* Arrow wrapper */}
      <div className="absolute inset-y-6 left-0 right-0 pointer-events-none z-10">
        {/* Left Arrow */}
        <button
          type="button"
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-card hover:bg-muted rounded-full p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer pointer-events-auto focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6 text-card-foreground" />
        </button>

        {/* Right Arrow */}
        <button
          type="button"
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-card hover:bg-muted rounded-full p-3 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer pointer-events-auto focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6 text-card-foreground" />
        </button>
      </div>

      {/* Horizontal scrollable container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-6 py-6 px-2 overflow-x-auto snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {tasks.map((task, index) => {
          const hashtagKey = task.hashtag
            ? task.hashtag.replace("#", "")
            : "task";
          const baseKey = task.id ? `${hashtagKey}-${task.id}` : hashtagKey;
          const uniqueKey = keyPrefix
            ? `${keyPrefix}-${baseKey}-${index}`
            : `${baseKey}-${index}`;

          return (
            <div
              key={uniqueKey}
              className="shrink-0 w-[85vw] sm:w-[350px] h-[380px] snap-start"
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

      {/* Task Detail Panel */}
      <TaskDetailPanel
        task={selectedTask}
        isOpen={isPanelOpen}
        onClose={handleClosePanel}
      />
    </div>
  );
}
