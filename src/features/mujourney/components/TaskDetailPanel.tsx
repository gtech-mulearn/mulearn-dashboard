/**
 * Task Detail Panel Component
 *
 * 📍 src/features/mujourney/components/TaskDetailPanel.tsx
 *
 * Side panel that displays detailed task information with markdown support
 */

"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Task } from "../schemas";
import { MarkdownRenderer } from "../utils/markdown";

// Extended Task type to include optional backend fields
interface ExtendedTask extends Task {
  skills?: string[];
  organization?: {
    title?: string;
  };
  prerequisites?: string;
}

interface TaskDetailPanelProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskDetailPanel({
  task,
  isOpen,
  onClose,
}: TaskDetailPanelProps) {
  const extendedTask = task as ExtendedTask | null;

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;

      // Disable body scroll
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";

      return () => {
        // Re-enable body scroll
        document.body.style.overflow = "";
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.width = "";

        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  const handleClose = () => {
    onClose();
  };

  const handleBackdropKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" || e.key === "Enter") {
      onClose();
    }
  };

  if (!task) return null;

  return (
    <>
      {/* Backdrop - Covers entire screen including sidebar */}
      <button
        type="button"
        className={cn(
          "fixed inset-0 bg-black/50 z-[100] transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={handleClose}
        onKeyDown={handleBackdropKeyDown}
        aria-label="Close panel"
      />

      {/* Side Panel - 75% width */}
      <div
        className={cn(
          "fixed right-0 top-0 h-full w-full md:w-[75%] bg-card border-l border-border z-[101] shadow-2xl transition-transform duration-300 ease-in-out overflow-y-auto",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="p-8 space-y-6">
          {/* Close Button */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              aria-label="Close panel"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Task Title - with Markdown */}
          <div className="text-3xl font-bold text-foreground font-montserrat">
            <MarkdownRenderer content={task.task_name} className="[&>*]:mb-0" />
          </div>

          {/* Metadata Sections */}
          <div className="space-y-6 pt-4">
            {/* Interest Group */}
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-foreground font-montserrat">
                Interest Group
              </h3>
              <p className="text-base text-muted-foreground font-open-sans">
                {task.interest_group?.name || "General Tasks"}
              </p>
              {task.hashtag && (
                <div className="pt-1">
                  <span className="text-sm font-bold text-foreground font-open-sans">
                    Hashtag:
                  </span>{" "}
                  <span className="inline-block px-3 py-1 bg-muted text-muted-foreground rounded-full font-mono text-sm">
                    {task.hashtag}
                  </span>
                </div>
              )}
            </div>

            {/* Skills */}
            {extendedTask?.skills &&
              Array.isArray(extendedTask.skills) &&
              extendedTask.skills.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-foreground font-montserrat">
                    Skills:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {extendedTask.skills.map((skill: string) => (
                      <span
                        key={skill}
                        className="px-3 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-sm font-medium font-open-sans"
                      >
                        <MarkdownRenderer
                          content={skill}
                          className="inline [&>*]:inline [&>*]:mb-0"
                        />
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {/* Published Info */}
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-foreground font-montserrat">
                Published Info
              </h3>
              <p className="text-base text-muted-foreground font-open-sans">
                <span className="font-bold text-foreground">By:</span>{" "}
                {extendedTask?.organization?.title || "μLearn Foundation"}
              </p>
            </div>

            {/* Prerequisites - with Markdown */}
            {extendedTask?.prerequisites && (
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-foreground font-montserrat">
                  Prerequisites
                </h3>
                <div className="text-base text-muted-foreground font-open-sans">
                  <MarkdownRenderer content={extendedTask.prerequisites} />
                </div>
              </div>
            )}
          </div>

          {/* Submit Proof of Work Button */}
          <div className="pt-6">
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base h-11 rounded-lg font-montserrat cursor-pointer px-8"
              onClick={() => {
                window.open(
                  "https://discord.com/channels/771670169691881483/782353185552465951",
                  "_blank",
                );
              }}
            >
              Submit proof of Work
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
