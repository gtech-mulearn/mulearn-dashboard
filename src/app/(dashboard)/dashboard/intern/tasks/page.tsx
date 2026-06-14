"use client";

import { Clock, Search, Sparkles } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  type TInternTask,
  useInternTasks,
  useUpdateTaskStatus,
} from "@/features/intern";
import { useDebounce } from "@/hooks/use-debounce";

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

export default function InternTasksPage() {
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

  const tasks = tasksResponse?.data || [];
  const filteredTasks = tasks.filter((t) => {
    return statusFilter === "ALL" || t.status === statusFilter;
  });

  const handleStatusChange = (taskId: string, newStatus: any) => {
    updateStatusMutation.mutate({ id: taskId, status: newStatus });
  };

  return (
    <div className="flex-1 space-y-8 p-4 sm:p-8 pt-6 max-w-7xl mx-auto w-full bg-background/50">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-brand-blue/10 text-brand-blue border-brand-blue/20 px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-widest">
              My Quests
            </Badge>
          </div>
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
            <SelectContent className="bg-card font-bold border-border/60">
              <SelectItem value="ALL" className="uppercase text-[10px]">
                All Statuses
              </SelectItem>
              <SelectItem value="TODO" className="uppercase text-[10px]">
                To Do
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
                  <Badge
                    variant="outline"
                    className={`text-[9px] uppercase font-black tracking-widest ${getComplexityColor(task.complexity)}`}
                  >
                    {task.complexity}
                  </Badge>
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
                      value={task.status}
                      onValueChange={(val) => handleStatusChange(task.id, val)}
                      disabled={updateStatusMutation.isPending}
                    >
                      <SelectTrigger className="h-8 font-black uppercase text-[9px] tracking-widest w-[110px] border-border/50 bg-background/50 rounded-lg">
                        <SelectValue placeholder="Update" />
                      </SelectTrigger>
                      <SelectContent className="bg-card font-bold border-border/60">
                        <SelectItem
                          value="TODO"
                          className="uppercase text-[9px]"
                        >
                          To Do
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

      {/* Detailed Task View Dialog */}
      <Dialog
        open={!!selectedTask}
        onOpenChange={(o) => !o && setSelectedTask(null)}
      >
        <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-2xl border-border/40 bg-card/95 backdrop-blur-2xl shadow-2xl">
          {selectedTask && (
            <>
              <DialogHeader className="pt-3 sm:pt-0 pr-8 pb-4 border-b border-border/20">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <DialogTitle className="text-2xl font-black uppercase tracking-tight text-foreground break-all">
                    {selectedTask.title}
                  </DialogTitle>
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    <Badge
                      variant="outline"
                      className={`text-[9px] uppercase font-black tracking-widest ${getComplexityColor(selectedTask.complexity)}`}
                    >
                      {selectedTask.complexity}
                    </Badge>
                    {selectedTask.team && (
                      <Badge
                        variant="outline"
                        className="bg-brand-blue/10 text-brand-blue border-brand-blue/20 text-[9px] font-black rounded-md uppercase tracking-wider px-2 py-0.5"
                      >
                        {selectedTask.team}
                      </Badge>
                    )}
                    <Badge
                      variant="outline"
                      className="bg-muted/30 text-muted-foreground border-border text-[9px] font-black rounded-md uppercase tracking-wider px-2 py-0.5"
                    >
                      {selectedTask.category}
                    </Badge>
                  </div>
                </div>
                <DialogDescription className="hidden">
                  Task details and description view
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 pt-4">
                {/* Description */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Description
                  </h4>
                  <div className="p-4 rounded-xl border border-border/40 bg-background/40 max-h-[220px] overflow-y-auto w-full min-w-0">
                    <p className="text-sm font-medium text-foreground whitespace-pre-wrap leading-relaxed break-all">
                      {selectedTask.description || "No description provided."}
                    </p>
                  </div>
                </div>

                {/* Grid info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 bg-background/25 border border-border/20 p-3 rounded-xl">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60">
                      Created By
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      {selectedTask.created_by_name ||
                        selectedTask.created_by ||
                        "Admin/Mentor"}
                    </p>
                  </div>

                  <div className="space-y-1 bg-background/25 border border-border/20 p-3 rounded-xl">
                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/60 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-muted-foreground/50" />
                      Deadline
                    </p>
                    <p className="text-sm font-bold text-foreground">
                      {selectedTask.deadline
                        ? new Date(selectedTask.deadline).toLocaleDateString(
                            undefined,
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            },
                          )
                        : "No deadline"}
                    </p>
                  </div>
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
                      value={selectedTask.status}
                      onValueChange={(val) => {
                        handleStatusChange(selectedTask.id, val);
                        setSelectedTask((prev) =>
                          prev ? { ...prev, status: val as any } : null,
                        );
                      }}
                      disabled={updateStatusMutation.isPending}
                    >
                      <SelectTrigger className="h-9 font-black uppercase text-[10px] tracking-widest w-[130px] border-border/50 bg-background/50 rounded-lg">
                        <SelectValue placeholder="Update" />
                      </SelectTrigger>
                      <SelectContent className="bg-card font-bold border-border/60">
                        <SelectItem
                          value="TODO"
                          className="uppercase text-[9px]"
                        >
                          To Do
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
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
