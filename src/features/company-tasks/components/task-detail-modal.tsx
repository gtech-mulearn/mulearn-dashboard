"use client";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useCompanyTaskDetail } from "../hooks/use-company-tasks";

interface TaskDetailModalProps {
  taskId: string | null;
  onClose: () => void;
}

export function TaskDetailModal({ taskId, onClose }: TaskDetailModalProps) {
  const { data: task, isLoading, error } = useCompanyTaskDetail(taskId || "");

  return (
    <Dialog open={!!taskId} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Task Details</DialogTitle>
          <DialogDescription>
            Full details for this company task.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-24 w-full mt-4" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-16" />
              </div>
            </div>
          ) : error || !task ? (
            <div className="p-4 bg-destructive/10 text-destructive rounded-md border border-destructive/20">
              Failed to load task details.
            </div>
          ) : (
            <>
              <div className="space-y-1">
                <div className="flex justify-between items-start gap-4">
                  <h2 className="text-xl font-bold tracking-tight text-foreground">
                    {task.title}
                  </h2>
                  <Badge
                    variant={
                      task.approval_status === "approved"
                        ? "default"
                        : task.approval_status === "rejected"
                          ? "destructive"
                          : "secondary"
                    }
                    className="capitalize shrink-0"
                  >
                    {task.approval_status}
                  </Badge>
                </div>
                <p className="text-sm font-medium text-primary">
                  {task.hashtag}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Karma</p>
                  <p className="font-semibold">{task.karma}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Type</p>
                  <p className="font-semibold">{task.type}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Bonus Karma</p>
                  <p className="font-semibold">{task.bonus_karma || 0}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Usage Count</p>
                  <p className="font-semibold">{task.usage_count}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">
                  Description
                </h3>
                <div className="p-4 bg-muted/50 rounded-lg whitespace-pre-wrap text-sm text-foreground">
                  {task.description || "No description provided."}
                </div>
              </div>

              {task.skills && task.skills.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Required Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {task.skills.map((skill) => (
                      <Badge
                        key={skill.id}
                        variant="outline"
                        className="bg-background"
                      >
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {task.approval_status === "rejected" && task.rejection_reason && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-destructive">
                    Rejection Reason
                  </h3>
                  <div className="p-3 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive/20">
                    {task.rejection_reason}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground pt-4 border-t border-border">
                <div>
                  <span className="font-medium">Requested By:</span>{" "}
                  {task.requested_by_name}
                </div>
                <div>
                  <span className="font-medium">Requested At:</span>{" "}
                  {new Date(task.requested_at).toLocaleDateString()}
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
