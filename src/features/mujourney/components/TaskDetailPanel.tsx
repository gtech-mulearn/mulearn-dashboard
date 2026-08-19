/**
 * Task Detail Panel Component
 *
 * 📍 src/features/mujourney/components/TaskDetailPanel.tsx
 *
 * Side panel with full task details using TaskListPublic from the redesigned API.
 * Discord submit opens the task's submission channel (discord_id).
 */

import { X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetTitle,
} from "@/components/ui/sheet";
import { useUserInfo } from "@/features/auth";
import { chipColor } from "@/lib/chip-colors";
import type { TaskListPublic } from "../schemas";
import { MarkdownRenderer } from "../utils/markdown";

interface TaskDetailPanelProps {
  task: TaskListPublic | null;
  isOpen: boolean;
  onClose: () => void;
}

const DISCORD_GUILD_ID = "771670169691881483";
const DEFAULT_DISCORD_CHANNEL_ID = "782353185552465951";

export function TaskDetailPanel({
  task,
  isOpen,
  onClose,
}: TaskDetailPanelProps) {
  const userInfo = useUserInfo();
  const discordConnected = userInfo.data?.exist_in_guild === true;

  if (!task) return null;

  const handleSubmit = () => {
    if (!discordConnected) {
      toast.error(
        "Please connect your Discord account first to submit proof of work.",
      );
      return;
    }
    const channelId = task.discord_id ?? DEFAULT_DISCORD_CHANNEL_ID;
    window.open(
      `https://discord.com/channels/${DISCORD_GUILD_ID}/${channelId}`,
      "_blank",
    );
  };

  const publishedBy = task.company_name ?? "μLearn Foundation";

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        showCloseButton={false}
        className="!bg-card !z-[101] !shadow-2xl !w-full md:!min-w-[75%] !sm:max-w-none !outline-none !gap-0 !border-border"
      >
        <SheetTitle className="sr-only">Task Details</SheetTitle>
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* Close Button */}
          <div className="flex justify-end">
            <Button
              type="button"
              size="icon"
              onClick={onClose}
              aria-label="Close panel"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* Task Title */}
          <div className="text-3xl font-bold text-foreground">
            <MarkdownRenderer content={task.title} className="*:mb-0" />
          </div>

          {/* Task Description */}
          {task.description && (
            <div className="text-base text-foreground prose prose-sm dark:prose-invert max-w-none">
              <MarkdownRenderer content={task.description} />
            </div>
          )}

          {/* Metadata */}
          <div className="space-y-6 pt-4">
            {/* Interest Group + Hashtag */}
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-foreground">
                Interest Group
              </h3>
              <p className="text-base text-muted-foreground">
                {task.ig ?? "General Task"}
              </p>
              {task.hashtag && (
                <div className="pt-1">
                  <span className="text-sm font-bold text-foreground">
                    Hashtag:{" "}
                  </span>
                  <span className="inline-block px-3 py-1 bg-muted text-muted-foreground rounded-full font-mono text-sm">
                    {task.hashtag}
                  </span>
                </div>
              )}
            </div>

            {/* Task Type */}
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-foreground">Task Type</h3>
              <div className="flex flex-wrap gap-2">
                {task.type && (
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${chipColor(task.type)}`}
                  >
                    {task.type}
                  </span>
                )}
              </div>
            </div>

            {/* Event */}
            {task.event && (
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-foreground">Event</h3>
                <p className="text-base text-muted-foreground">{task.event}</p>
              </div>
            )}

            {/* Published Info */}
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-foreground">
                Published Info
              </h3>
              <p className="text-base text-muted-foreground">
                <span className="font-bold text-foreground">By:</span>{" "}
                {publishedBy}
              </p>
            </div>
          </div>
        </div>

        {/* Submit Proof of Work */}
        <SheetFooter className="pt-6">
          <Button
            variant="default"
            className="font-semibold px-8"
            onClick={handleSubmit}
          >
            Submit Proof of Work
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
