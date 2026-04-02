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

import { Copy } from "lucide-react";
import { toast } from "sonner";

export function TaskCard({
  task,
  status = "pending",
  className,
  onClick,
}: TaskCardProps) {
  // Status constants derived from theme vibes
  const isCompleted = status === "completed";
  const isLocked = status === "locked";
  const isPending = status === "pending";

  const handleCopyHashtag = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(task.hashtag);
    toast.success("Hashtag copied to clipboard!");
  };

  return (
    <Card
      className={cn(
        "group relative h-full flex flex-col transition-all duration-500 rounded-3xl overflow-hidden border border-border/50 shadow-xs hover:shadow-xl hover:-translate-y-1.5 cursor-pointer bg-card/60 backdrop-blur-xl",
        isCompleted && "bg-emerald-500/5 border-emerald-500/20",
        isLocked && "cursor-not-allowed opacity-60",
        className,
      )}
      onClick={() => !isLocked && onClick?.()}
    >
      {/* Soft Theme-aligned Glows */}
      <div
        className={cn(
          "absolute -top-12 -right-12 w-32 h-32 blur-3xl rounded-full opacity-10 transition-opacity duration-700 group-hover:opacity-25",
          isCompleted
            ? "bg-emerald-500"
            : isPending
              ? "bg-primary"
              : "bg-muted-foreground",
        )}
      />
      <div
        className={cn(
          "absolute -bottom-8 -left-8 w-24 h-24 blur-2xl rounded-full opacity-5",
          isCompleted ? "bg-emerald-400" : "bg-primary/50",
        )}
      />

      <CardContent className="p-7 sm:p-9 flex flex-col h-full space-y-7 relative z-10">
        {/* Header Badges */}
        <div className="flex items-center justify-between">
          <div
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border backdrop-blur-sm",
              isCompleted &&
                "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
              isPending && "bg-amber-500/10 text-amber-600 border-amber-500/20",
              isLocked && "bg-muted/50 text-muted-foreground border-border",
            )}
          >
            <span className="text-sm shrink-0">
              {isCompleted ? "✨" : isPending ? "⏳" : "🔒"}
            </span>
            {status}
          </div>

          <div className="bg-primary/5 px-3 py-1 rounded-lg border border-primary/10">
            <span className="text-[10px] font-black text-primary/80 tabular-nums">
              {task.karma} KARMA
            </span>
          </div>
        </div>

        {/* Task Title Area */}
        <div className="space-y-2 grow">
          <div className="text-xl font-bold text-foreground leading-tight tracking-tight group-hover:text-primary transition-colors">
            <MarkdownRenderer content={task.task_name} className="*:mb-0" />
          </div>

          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-primary/40" />
            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest">
              {task.interest_group?.name || "Foundation"}
            </span>
          </div>
        </div>

        {/* Submission Panel - Softer and more integrated */}
        <div className="bg-muted/30 p-4 rounded-2xl border border-border/40 shadow-xs">
          <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 mb-1.5">
            Submission ID
          </p>
          <div className="flex items-center gap-2 bg-background/50 p-1 rounded-xl border border-border/20">
            <code className="text-xs font-mono text-foreground/80 font-bold block truncate grow pl-2">
              {task.hashtag}
            </code>
            <button
              type="button"
              onClick={handleCopyHashtag}
              className="p-1.5 hover:bg-muted rounded-lg transition-colors group/copy shrink-0"
              title="Copy to clipboard"
            >
              <Copy className="h-3 w-3 text-muted-foreground group-hover/copy:text-primary" />
            </button>
          </div>
        </div>

        {/* Action Button - Standardized with site palette */}
        <Button
          disabled={isLocked}
          className={cn(
            "w-full h-12 rounded-xl font-black uppercase tracking-widest text-[11px] transition-all duration-500",
            isPending &&
              "bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02]",
            isCompleted &&
              "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/15 shadow-none",
            isLocked && "bg-muted text-muted-foreground opacity-50 shadow-none",
          )}
        >
          {isLocked ? "Locked" : isCompleted ? "Completed" : "Start Task"}
        </Button>
      </CardContent>
    </Card>
  );
}
