"use client";

import {
  AlertCircle,
  CheckCircle2,
  Clock,
  PlayCircle,
  Search,
  Sparkles,
  StopCircle,
} from "lucide-react";
import { useState } from "react";
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
import { useInternTasks, useUpdateTaskStatus } from "@/features/intern";

const getStatusIcon = (status: string) => {
  switch (status) {
    case "TODO":
      return <StopCircle className="w-4 h-4 text-muted-foreground" />;
    case "IN_PROGRESS":
      return <PlayCircle className="w-4 h-4 text-brand-blue animate-pulse" />;
    case "COMPLETED":
      return <CheckCircle2 className="w-4 h-4 text-success" />;
    case "ON_HOLD":
      return <AlertCircle className="w-4 h-4 text-warning" />;
    default:
      return null;
  }
};

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
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);

  const { data: tasksResponse, isLoading } = useInternTasks({
    page,
    perPage: 20,
    search: searchText || undefined,
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
    <div className="flex-1 space-y-8 p-8 pt-6 max-w-7xl mx-auto w-full bg-background/50">
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
              className="border-border/40 bg-card/30 backdrop-blur-md shadow-lg overflow-hidden flex flex-col justify-between transition-all hover:shadow-xl"
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
                <div className="flex items-center justify-between gap-4 mt-2">
                  <div className="flex items-center gap-1.5">
                    {getStatusIcon(task.status)}
                    <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
                      {task.status.replace("_", " ")}
                    </span>
                  </div>
                  <Select
                    value={task.status}
                    onValueChange={(val) => handleStatusChange(task.id, val)}
                    disabled={updateStatusMutation.isPending}
                  >
                    <SelectTrigger className="h-8 font-black uppercase text-[9px] tracking-widest w-[110px] border-border/50 bg-background/50 rounded-lg">
                      <SelectValue placeholder="Update" />
                    </SelectTrigger>
                    <SelectContent className="bg-card font-bold border-border/60">
                      <SelectItem value="TODO" className="uppercase text-[9px]">
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

      <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/20 py-8">
        <Sparkles className="w-3 h-3" /> Conquering Duties{" "}
        <Sparkles className="w-3 h-3" />
      </div>
    </div>
  );
}
