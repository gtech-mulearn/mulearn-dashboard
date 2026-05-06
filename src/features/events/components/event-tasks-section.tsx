import { Clock, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { LinkedTask } from "../types";

interface EventTasksSectionProps {
  tasks: LinkedTask[];
}

export function EventTasksSection({ tasks }: EventTasksSectionProps) {
  if (!tasks || tasks.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-2.5 px-5 py-4">
        <div className="flex size-9 items-center justify-center rounded-xl bg-violet-500/10">
          <Zap className="size-4 text-violet-500" />
        </div>
        <h2 className="text-base font-bold text-foreground">
          Earn Karma at This Event
        </h2>
      </div>
      <div className="px-5 pb-5 pt-0 space-y-3">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="space-y-2 rounded-xl border border-border bg-muted/40 p-4"
          >
            {/* Row 1: hashtag + karma */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2.5 py-1 font-mono text-xs text-violet-600 dark:text-violet-400">
                #{task.hashtag}
              </span>
              <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                +{task.karma} karma
              </span>
            </div>

            {/* Row 2: task name */}
            <p
              className={cn(
                "text-sm font-medium",
                task.active
                  ? "text-foreground"
                  : "text-muted-foreground line-through",
              )}
            >
              {task.title}
            </p>

            {/* Row 3: IG + bonus */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {task.ig?.name}
              </span>
              {task.bonus_time && task.active ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                  <Clock className="size-3" />+{task.bonus_karma} before{" "}
                  {new Date(task.bonus_time).toLocaleString(undefined, {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              ) : null}
              {!task.active && (
                <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">
                  Closed
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
