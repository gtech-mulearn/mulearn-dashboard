"use client";

import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getTaskBaseKarma,
  getTaskKarma,
  type TInternTask,
} from "@/features/intern";

const getComplexityColor = (complexity: string) => {
  switch (complexity) {
    case "LOW":
      return "border-success/30 bg-success/5 text-success";
    case "MEDIUM":
      return "border-brand-blue/30 bg-brand-blue/5 text-brand-blue";
    case "HIGH":
      return "border-warning/30 bg-warning/5 text-warning";
    case "CRITICAL":
      return "border-destructive/30 bg-destructive/5 text-destructive";
    default:
      return "border-border/30 bg-muted/50 text-muted-foreground";
  }
};

interface TaskDetailDialogProps {
  task: TInternTask | null;
  onClose: () => void;
  onStatusChange: (taskId: string, status: TInternTask["status"]) => void;
  onTaskUpdate: (updatedTask: TInternTask) => void;
  isStatusUpdating?: boolean;
}

export function TaskDetailDialog({
  task,
  onClose,
  onStatusChange,
  onTaskUpdate,
  isStatusUpdating = false,
}: TaskDetailDialogProps) {
  if (!task) return null;

  return (
    <Dialog open={!!task} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-2xl border-border/40 bg-card/95 backdrop-blur-2xl shadow-2xl">
        <>
          <DialogHeader className="pt-3 sm:pt-0 pr-8 pb-4 border-b border-border/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <DialogTitle className="text-2xl font-black uppercase tracking-tight text-foreground break-all">
                {task.title}
              </DialogTitle>
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Badge
                  variant="outline"
                  className={`text-[9px] uppercase font-black tracking-widest ${getComplexityColor(task.complexity)}`}
                >
                  {task.complexity}
                </Badge>
                {task.team && (
                  <Badge
                    variant="default"
                    className="text-[9px] font-black rounded-md uppercase tracking-wider px-2 py-0.5"
                  >
                    {task.team}
                  </Badge>
                )}
                <Badge
                  variant="outline"
                  className="bg-success/10 text-success border-success/20 text-[9px] font-black rounded-md uppercase tracking-wider px-2 py-0.5"
                >
                  {getTaskBaseKarma(task)} Karma
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-brand-purple/10 text-brand-purple border-brand-purple/20 text-[9px] font-black rounded-md uppercase tracking-wider px-2 py-0.5"
                >
                  {getTaskKarma(task)} Pts
                </Badge>
                <Badge
                  variant="default"
                  className="text-[9px] font-black rounded-md uppercase tracking-wider px-2 py-0.5"
                >
                  {task.category}
                </Badge>
              </div>
            </div>
            <DialogDescription className="hidden">
              Task details and description view
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-y-auto max-h-[calc(80vh-10rem)] space-y-6 pt-4 pr-1">
            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Description
              </h4>
              <div className="p-4 rounded-xl border border-border/40 bg-background/40 max-h-[220px] overflow-y-auto w-full min-w-0">
                <p className="text-sm font-medium text-foreground whitespace-pre-wrap leading-relaxed break-all">
                  {task.description || "No description provided."}
                </p>
              </div>
            </div>

            {/* Grid info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1 bg-background/25 border border-border/20 p-3 rounded-xl">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-muted-foreground/50" />
                  Deadline
                </p>
                <p className="text-sm font-bold text-foreground">
                  {task.deadline
                    ? new Date(task.deadline).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "No deadline"}
                </p>
              </div>
              <div className="space-y-1 bg-background/25 border border-border/20 p-3 rounded-xl">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                  Created By
                </p>
                <p className="text-sm font-bold text-foreground">
                  {task.created_by_name || task.created_by || "Admin/Mentor"}
                </p>
              </div>
              <div className="space-y-1 bg-background/25 border border-border/20 p-3 rounded-xl">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                  Karma
                </p>
                <p className="text-sm font-bold text-foreground">
                  {getTaskBaseKarma(task)}
                </p>
              </div>
              <div className="space-y-1 bg-background/25 border border-border/20 p-3 rounded-xl">
                <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                  Points
                </p>
                <p className="text-sm font-bold text-foreground">
                  {getTaskKarma(task)}
                </p>
              </div>
              {task.status === "COMPLETED" && task.output_link && (
                <div className="space-y-1 bg-background/25 border border-border/20 p-3 rounded-xl col-span-1 sm:col-span-2">
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                    Submission Link
                  </p>
                  <a
                    href={task.output_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-brand-blue hover:underline break-all"
                  >
                    {task.output_link}
                  </a>
                </div>
              )}
            </div>

            {/* Status Updater inside modal */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/40 bg-brand-blue/5">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-foreground">
                  Task Status
                </h4>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mt-0.5">
                  Update your work progress on this task
                </p>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Select
                  value={
                    [
                      "WAITING_FOR_REVIEW",
                      "IN_PROGRESS",
                      "COMPLETED",
                      "ON_HOLD",
                    ].includes(task.status)
                      ? task.status
                      : undefined
                  }
                  onValueChange={(val) => {
                    onStatusChange(task.id, val as TInternTask["status"]);
                    if (val !== "COMPLETED") {
                      onTaskUpdate({
                        ...task,
                        status: val as TInternTask["status"],
                      });
                    }
                  }}
                  disabled={isStatusUpdating}
                >
                  <SelectTrigger className="h-9 font-black uppercase text-[10px] tracking-widest w-fit min-w-[130px] px-3 border-border/50 bg-background/50 rounded-lg">
                    <SelectValue placeholder="TODO" />
                  </SelectTrigger>
                  <SelectContent
                    position="popper"
                    className="bg-card font-bold border-border/60"
                  >
                    <SelectItem
                      value="WAITING_FOR_REVIEW"
                      className="uppercase text-[9px]"
                    >
                      Waiting for Review
                    </SelectItem>
                    <SelectItem
                      value="IN_PROGRESS"
                      className="uppercase text-[9px]"
                    >
                      In Progress
                    </SelectItem>
                    <SelectItem
                      value="COMPLETED"
                      className="uppercase text-[9px]"
                    >
                      Completed
                    </SelectItem>
                    <SelectItem
                      value="ON_HOLD"
                      className="uppercase text-[9px]"
                    >
                      On Hold
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </>
      </DialogContent>
    </Dialog>
  );
}
