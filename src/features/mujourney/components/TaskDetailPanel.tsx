/**
 * Task Detail Panel Component
 *
 * 📍 src/features/mujourney/components/TaskDetailPanel.tsx
 *
 * Side panel that displays detailed task information with markdown support
 */

"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
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

  // Prevent body scroll and manage focus when panel is open
  useEffect(() => {
    if (isOpen) {
      // Save current scroll position
      const scrollY = window.scrollY;

      // Disable body scroll
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";

      // Focus management: simple focus trap
      // In a production app, use @radix-ui/react-dialog or react-focus-lock
      const panel = document.getElementById("task-detail-panel");
      panel?.focus();

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

  return (
    <AnimatePresence>
      {isOpen && task && (
        <>
          {/* Backdrop - Covers entire screen including sidebar */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-foreground/50 z-100"
            onClick={handleClose}
            onKeyDown={handleBackdropKeyDown}
            role="button"
            tabIndex={0}
            aria-label="Close panel"
          />

          {/* Side Panel - 75% width */}
          <motion.div
            id="task-detail-panel"
            tabIndex={-1}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full md:w-[75%] bg-card border-l border-border z-101 shadow-2xl overflow-y-auto outline-none"
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
              <div className="text-3xl font-bold text-foreground">
                <MarkdownRenderer content={task.task_name} className="*:mb-0" />
              </div>

              {/* Task Description/Steps - with Markdown */}
              {task.task_description && (
                <div className="text-base text-muted-foreground prose prose-sm dark:prose-invert max-w-none">
                  <MarkdownRenderer content={task.task_description} />
                </div>
              )}

              {/* Metadata Sections */}
              <div className="space-y-6 pt-4">
                {/* Interest Group */}
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-foreground">
                    Interest Group
                  </h3>
                  <p className="text-base text-muted-foreground">
                    {task.interest_group?.name || "General Tasks"}
                  </p>
                  {task.hashtag && (
                    <div className="pt-1">
                      <span className="text-sm font-bold text-foreground">
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
                      <h3 className="text-lg font-bold text-foreground">
                        Skills:
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {extendedTask.skills.map((skill: string) => (
                          <span
                            key={skill}
                            className="px-3 py-1 bg-brand-blue/10 text-brand-blue rounded-full text-sm font-medium"
                          >
                            <MarkdownRenderer
                              content={skill}
                              className="*:inline *:mb-0"
                            />
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Published Info */}
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-foreground">
                    Published Info
                  </h3>
                  <p className="text-base text-muted-foreground">
                    <span className="font-bold text-foreground">By:</span>{" "}
                    {extendedTask?.organization?.title || "μLearn Foundation"}
                  </p>
                </div>

                {/* Prerequisites - with Markdown */}
                {extendedTask?.prerequisites && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-foreground">
                      Prerequisites
                    </h3>
                    <div className="text-base text-muted-foreground">
                      <MarkdownRenderer content={extendedTask.prerequisites} />
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Proof of Work Button */}
              <div className="pt-6">
                <Button
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base h-11 rounded-lg cursor-pointer px-8"
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
