"use client";

import { Clock, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import {
  getTaskBaseKarma,
  getTaskKarma,
  type TInternTask,
  useInternTasks,
  useUpdateTaskStatus,
} from "@/features/intern";
import { useDebounce } from "@/hooks/use-debounce";
import { SubmitDeliverableDialog } from "./components/submit-deliverable-dialog";
import { TaskDetailDialog } from "./components/task-detail-dialog";

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

export function InternTasksPageClient() {
  const [searchText, setSearchText] = useState("");
  const debouncedSearch = useDebounce(searchText, 300);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [selectedTask, setSelectedTask] = useState<TInternTask | null>(null);

  const { data: tasksResponse, isLoading } = useInternTasks({
    page,
    perPage: 20,
    search: debouncedSearch || undefined,
  });

  const updateStatusMutation = useUpdateTaskStatus();

  const [completingTaskId, setCompletingTaskId] = useState<string | null>(null);
  const [outputLink, setOutputLink] = useState("");
  const [isSubmitLinkOpen, setIsSubmitLinkOpen] = useState(false);

  const tasks = tasksResponse?.data || [];
  const filteredTasks = tasks.filter((t) => {
    return statusFilter === "ALL" || t.status === statusFilter;
  });

  const handleStatusChange = (
    taskId: string,
    newStatus: TInternTask["status"],
  ) => {
    if (newStatus === "COMPLETED") {
      setCompletingTaskId(taskId);
      setOutputLink("");
      setIsSubmitLinkOpen(true);
    } else {
      updateStatusMutation.mutate({ id: taskId, status: newStatus });
    }
  };

  const handleConfirmComplete = () => {
    if (!completingTaskId) return;
    if (!outputLink.trim()) {
      toast.error("Please enter a submission URL");
      return;
    }
    try {
      const url = new URL(outputLink.trim());
      if (url.protocol !== "http:" && url.protocol !== "https:") {
        toast.error("Submission link must start with http:// or https://");
        return;
      }
    } catch {
      toast.error("Please enter a valid URL (e.g. https://github.com/...)");
      return;
    }
    updateStatusMutation.mutate(
      { id: completingTaskId, status: "COMPLETED", outputLink },
      {
        onSuccess: () => {
          setIsSubmitLinkOpen(false);
          setCompletingTaskId(null);
          setOutputLink("");
          if (selectedTask && selectedTask.id === completingTaskId) {
            setSelectedTask((prev) =>
              prev
                ? { ...prev, status: "COMPLETED", output_link: outputLink }
                : null,
            );
          }
        },
      },
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-foreground uppercase">
            Task Tracker
          </h2>
          <p className="text-muted-foreground mt-1 font-medium italic">
            View your assigned guild duties and update your progress.
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 bg-card/40 backdrop-blur-md border border-border/40 p-4 rounded-2xl shadow-md">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
          <Input
            placeholder="Search tasks..."
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setPage(1);
            }}
            className="pl-10 h-10 bg-background/50 border-border/50 font-medium"
          />
        </div>
        <div className="w-full sm:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full h-10 font-bold uppercase text-[10px] tracking-widest border-border/50 bg-background/50">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent
              position="popper"
              className="bg-card font-bold border-border/60"
            >
              <SelectItem value="ALL" className="uppercase text-[10px]">
                All Statuses
              </SelectItem>
              <SelectItem
                value="WAITING_FOR_REVIEW"
                className="uppercase text-[10px]"
              >
                Waiting for Review
              </SelectItem>
              <SelectItem value="IN_PROGRESS" className="uppercase text-[10px]">
                In Progress
              </SelectItem>
              <SelectItem value="COMPLETED" className="uppercase text-[10px]">
                Completed
              </SelectItem>
              <SelectItem value="ON_HOLD" className="uppercase text-[10px]">
                On Hold
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <Spinner className="w-8 h-8 text-primary" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTasks.map((task) => (
            <Card
              key={task.id}
              data-slot="card"
              className="border-border/40 bg-card/30 backdrop-blur-md shadow-lg overflow-hidden flex flex-col justify-between transition-all hover:shadow-xl cursor-pointer hover:border-brand-blue/30"
              onClick={() => setSelectedTask(task)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge
                      variant="outline"
                      className={`text-[9px] uppercase font-black tracking-widest ${getComplexityColor(task.complexity)}`}
                    >
                      {task.complexity}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-[9px] uppercase font-black tracking-widest bg-success/10 text-success border-success/20"
                    >
                      {getTaskBaseKarma(task)} Karma
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-[9px] uppercase font-black tracking-widest bg-brand-purple/10 text-brand-purple border-brand-purple/20"
                    >
                      {getTaskKarma(task)} Pts
                    </Badge>
                  </div>
                  {task.deadline && (
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono font-bold">
                      <Clock className="w-3 h-3" />
                      {new Date(task.deadline).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                  )}
                </div>
                <CardTitle className="text-base font-black uppercase tracking-tight text-foreground line-clamp-1">
                  {task.title}
                </CardTitle>
                <CardDescription className="text-xs font-semibold text-muted-foreground/80 line-clamp-3 min-h-[48px] mt-1.5 leading-relaxed">
                  {task.description || "No description provided."}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2 border-t border-border/10 mt-auto">
                {/* biome-ignore lint/a11y/useKeyWithClickEvents: stopPropagation container */}
                {/* biome-ignore lint/a11y/noStaticElementInteractions: stopPropagation container */}
                <div
                  className="flex items-center justify-end gap-2 mt-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-2">
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
                      onValueChange={(val) =>
                        handleStatusChange(
                          task.id,
                          val as TInternTask["status"],
                        )
                      }
                      disabled={updateStatusMutation.isPending}
                    >
                      <SelectTrigger className="h-8 font-black uppercase text-[9px] tracking-widest w-fit min-w-[110px] px-3 border-border/50 bg-background/50 rounded-lg">
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
              </CardContent>
            </Card>
          ))}

          {filteredTasks.length === 0 && (
            <div className="col-span-full py-16 text-center text-xs text-muted-foreground italic uppercase tracking-wider">
              No tasks found
            </div>
          )}
        </div>
      )}

      <TaskDetailDialog
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onStatusChange={handleStatusChange}
        onTaskUpdate={(updated) => setSelectedTask(updated)}
        isStatusUpdating={updateStatusMutation.isPending}
      />

      <SubmitDeliverableDialog
        open={isSubmitLinkOpen}
        outputLink={outputLink}
        isPending={updateStatusMutation.isPending}
        onOpenChange={setIsSubmitLinkOpen}
        onOutputLinkChange={setOutputLink}
        onCancel={() => {
          setIsSubmitLinkOpen(false);
          setCompletingTaskId(null);
          setOutputLink("");
        }}
        onConfirm={handleConfirmComplete}
      />
    </div>
  );
}
